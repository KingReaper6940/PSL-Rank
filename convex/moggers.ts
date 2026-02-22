import { query, mutation, internalMutation } from "./_generated/server";
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
        const meta = await ctx.db.query("metadata").first();
        const externalVotes = meta?.externalVoteCount || 0;
        return {
            totalVotes: matches.length + externalVotes,
            localVotes: matches.length,
            externalVotes
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
        });

        return { newWinnerElo, newLoserElo, eloGained: newWinnerElo - winner.elo };
    },
});

// Bot to hallucinate/simulate matches to populate the site with activity
export const simulateRandomMatches = internalMutation({
    args: { count: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const moggers = await ctx.db.query("moggers").collect();
        if (moggers.length < 2) return;

        const matchesToSimulate = args.count || Math.floor(Math.random() * 5) + 1; // 1 to 5 matches

        for (let i = 0; i < matchesToSimulate; i++) {
            const idx1 = Math.floor(Math.random() * moggers.length);
            let idx2 = Math.floor(Math.random() * moggers.length);
            while (idx1 === idx2) {
                idx2 = Math.floor(Math.random() * moggers.length);
            }

            const m1 = await ctx.db.get(moggers[idx1]._id);
            const m2 = await ctx.db.get(moggers[idx2]._id);
            if (!m1 || !m2) continue;

            // Calculate win probability based on ELO difference for realism
            const expected1 = 1 / (1 + Math.pow(10, (m2.elo - m1.elo) / 400));
            const isM1Winner = Math.random() < expected1;

            const winner = isM1Winner ? m1 : m2;
            const loser = isM1Winner ? m2 : m1;

            const [newWinnerElo, newLoserElo] = calcElo(winner.elo, loser.elo, 1, 0, 32);

            await ctx.db.patch(winner._id, {
                elo: newWinnerElo,
                wins: winner.wins + 1,
                eloHistory: [...winner.eloHistory, newWinnerElo],
            });

            await ctx.db.patch(loser._id, {
                elo: newLoserElo,
                losses: loser.losses + 1,
                eloHistory: [...loser.eloHistory, newLoserElo],
            });

            await ctx.db.insert("matches", {
                winnerId: winner._id,
                loserId: loser._id,
                timestamp: Date.now() - Math.floor(Math.random() * 5000), // Slight jitter
            });
        }

        return `Simulated ${matchesToSimulate} matches`;
    }
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
