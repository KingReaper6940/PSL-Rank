import { action, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Since Convex Actions run on V8, `fetch` works perfectly.
export const scrapeChadscan = internalAction({
    args: {},
    handler: async (ctx) => {
        console.log("Fetching fresh data from thechadscan.com...");
        const response = await fetch('https://thechadscan.com/leaderboard', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const html = await response.text();
        const bundleMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
        if (!bundleMatch) throw new Error('Could not find JS bundle on thechadscan.com');

        const bundleUrl = 'https://thechadscan.com' + bundleMatch[1];
        const bundleResponse = await fetch(bundleUrl);
        const jsText = await bundleResponse.text();

        // Dynamically get the supabase URL and Anon Key directly from their production bundle
        const urlMatch = jsText.match(/https:\/\/[a-zA-Z0-9.\-_~:\/?#\[\]@!$&'()*+,;=]+supabase\.co/);
        const keyMatch = jsText.match(/eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/);

        if (!urlMatch || !keyMatch) throw new Error("Could not extract Supabase credentials");

        const charactersResponse = await fetch(`${urlMatch[0]}/rest/v1/chads?select=*&order=rating.desc`, {
            headers: {
                'apikey': keyMatch[0],
                'Authorization': `Bearer ${keyMatch[0]}`
            }
        });

        const rawData = await charactersResponse.json();
        console.log("Supabase response summary:", Array.isArray(rawData) ? `Array of ${rawData.length}` : rawData);
        let validMoggers = [];
        for (const item of (Array.isArray(rawData) ? rawData : [])) {
            if (item.name && item.rating) {
                validMoggers.push({
                    name: item.name,
                    elo: item.rating,
                    id: String(item.id),
                    wins: item.wins || 0,
                    losses: item.losses || 0,
                    image: item.image_url || ''
                });
            }
        }

        if (validMoggers.length > 0) {
            await ctx.runMutation(internal.scraper.syncMoggers, { moggers: validMoggers });
            return `Successfully synced ${validMoggers.length} moggers from ChadScan Supabase.`;
        } else {
            return `Scrape empty. Data payload was 0.`;
        }
    }
});

// Mutation to diff and update the database based on the scraped array
export const syncMoggers = internalMutation({
    args: {
        moggers: v.array(v.object({
            name: v.string(),
            elo: v.number(),
            id: v.optional(v.any()), // Might not match
            wins: v.optional(v.number()),
            losses: v.optional(v.number()),
            image: v.optional(v.string())
        }))
    },
    handler: async (ctx, args) => {
        for (const scraped of args.moggers) {
            // Find existing mogger by name
            const existing = await ctx.db.query("moggers")
                .withIndex("by_name", q => q.eq("name", scraped.name))
                .first();

            if (existing) {
                // If ChadScan's ELO or stats are wildly different, update.
                // We will merge by prioritizing the max to keep our local battles relevant.
                if (scraped.elo > existing.elo) {
                    await ctx.db.patch(existing._id, {
                        elo: scraped.elo,
                        eloHistory: [...existing.eloHistory, scraped.elo]
                    });
                }
            } else if (scraped.image) {
                // If the mogger exists on chadscan but not here, insert them
                await ctx.db.insert("moggers", {
                    name: scraped.name,
                    alias: scraped.name,
                    tagline: "Scraped from ChadScan",
                    image: scraped.image || '',
                    elo: scraped.elo,
                    wins: scraped.wins || 0,
                    losses: scraped.losses || 0,
                    eloHistory: [scraped.elo],
                    dateAdded: new Date().toISOString().split("T")[0]
                });
            }
        }
    }
});
