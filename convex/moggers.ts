import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { calculateElo } from "../src/utils/elo"; // We will duplicate this logic or move it to a shared package later

// Calculate ELO directly in Convex to avoid client spoofing
function calcElo(rating1: number, rating2: number, score1: number, score2: number, k: number = 32) {
    const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
    const expected2 = 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));

    return [
        Math.round(rating1 + k * (score1 - expected1)),
        Math.round(rating2 + k * (score2 - expected2))
    ];
}

import { internalMutation } from "./_generated/server";
export const backfillMatchesSource = internalMutation({
    args: {},
    handler: async (ctx) => {
        const matches = await ctx.db.query("matches").collect();
        for (const m of matches) {
            if (!m.source) {
                await ctx.db.patch(m._id, { source: "User Generated" });
            }
        }
    }
});

export const nukeFakeMatches = internalMutation({
    args: {},
    handler: async (ctx) => {
        // The cron job fired precisely 3 matches at the exact same millisecond every 5 mins.
        // We will find all matches, group them by timestamp, and if there are 3+ in the exact same MS, deleting them.
        const matches = await ctx.db.query("matches").order("desc").collect();
        const timeGroups = new Map<number, typeof matches>();

        for (const m of matches) {
            if (!timeGroups.has(m.timestamp)) timeGroups.set(m.timestamp, []);
            timeGroups.get(m.timestamp)!.push(m);
        }

        let deletedCount = 0;
        for (const [timestamp, group] of timeGroups.entries()) {
            // If they were generated instantly in a batch of 3, they are bot matches.
            // Even if a human double-clicked, 3 in 1 exact millisecond is impossible.
            if (group.length >= 3) {
                for (const match of group) {
                    await ctx.db.delete(match._id);
                    deletedCount++;
                }
            }
        }
        return `Deleted ${deletedCount} fake bot matches.`;
    }
});

export const getMoggers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("moggers").order("desc").collect();
    },
});

export const getMoggerById = query({
    args: { id: v.id("moggers") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const matches = await ctx.db.query("matches").collect();
        const allMoggers = await ctx.db.query("moggers").collect();
        const meta = await ctx.db.query("metadata").first();
        const externalVotes = meta?.externalVoteCount || 0;

        let authenticMoggersCount = 0;
        for (const m of allMoggers) {
            if (!m.isScraped) authenticMoggersCount++;
        }

        return {
            totalVotes: matches.length + externalVotes,
            localVotes: matches.length,
            externalVotes,
            totalMoggers: allMoggers.length,
            authenticMoggers: authenticMoggersCount
        };
    }
});

export const getRandomMatchup = query({
    args: {},
    handler: async (ctx) => {
        const moggers = await ctx.db.query("moggers").collect();
        if (moggers.length < 2) return null;

        const idx1 = Math.floor(Math.random() * moggers.length);
        let idx2 = Math.floor(Math.random() * moggers.length);
        while (idx1 === idx2) {
            idx2 = Math.floor(Math.random() * moggers.length);
        }

        return [moggers[idx1], moggers[idx2]];
    }
});

export const getMatches = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("matches").order("desc").collect();
    }
});

export const addMogger = mutation({
    args: {
        name: v.string(),
        alias: v.string(),
        tagline: v.string(),
        image: v.string(),
        storageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        let imageUrl = args.image;
        if (args.storageId) {
            imageUrl = await ctx.storage.getUrl(args.storageId) || args.image;
        }

        const newMogger = {
            name: args.name,
            alias: args.alias,
            tagline: args.tagline,
            image: imageUrl,
            elo: 1200,
            wins: 0,
            losses: 0,
            eloHistory: [1200],
            dateAdded: new Date().toISOString().split("T")[0],
        };
        return await ctx.db.insert("moggers", newMogger);
    },
});

export const vote = mutation({
    args: {
        winnerId: v.id("moggers"),
        loserId: v.id("moggers"),
    },
    handler: async (ctx, args) => {
        const winner = await ctx.db.get(args.winnerId);
        const loser = await ctx.db.get(args.loserId);

        if (!winner || !loser) throw new Error("Mogger not found");

        const [newWinnerElo, newLoserElo] = calcElo(winner.elo, loser.elo, 1, 0, 32);

        // Update Winner
        await ctx.db.patch(args.winnerId, {
            elo: newWinnerElo,
            wins: winner.wins + 1,
            eloHistory: [...winner.eloHistory, newWinnerElo],
        });

        // Update Loser
        await ctx.db.patch(args.loserId, {
            elo: newLoserElo,
            losses: loser.losses + 1,
            eloHistory: [...loser.eloHistory, newLoserElo],
        });

        // Record Match
        await ctx.db.insert("matches", {
            winnerId: args.winnerId,
            loserId: args.loserId,
            timestamp: Date.now(),
            source: "User Generated"
        });

        return { newWinnerElo, newLoserElo, eloGained: newWinnerElo - winner.elo };
    },
});

// For seeding
export const seedMoggers = mutation({
    args: {
        moggers: v.array(v.object({
            name: v.string(),
            alias: v.optional(v.string()),
            tagline: v.optional(v.string()),
            image: v.string(),
            elo: v.number(),
            wins: v.number(),
            losses: v.number(),
            eloHistory: v.array(v.number()),
            dateAdded: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        const ids = [];
        for (const mogger of args.moggers) {
            // Check if exists to prevent duplicate seeding
            const existing = await ctx.db.query("moggers")
                .withIndex("by_name", (q) => q.eq("name", mogger.name))
                .first();

            if (!existing) {
                const id = await ctx.db.insert("moggers", mogger);
                ids.push(id);
            }
        }
        return ids;
    }
});
