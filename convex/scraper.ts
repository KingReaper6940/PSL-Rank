import { action, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Scrapes ChadScan's Supabase backend every 15 minutes
export const scrapeChadscan = internalAction({
    args: {},
    handler: async (ctx) => {
        console.log("[Scraper] Fetching fresh data from thechadscan.com...");
        const response = await fetch('https://thechadscan.com/leaderboard', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const html = await response.text();
        const bundleMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
        if (!bundleMatch) throw new Error('Could not find JS bundle on thechadscan.com');

        const bundleUrl = 'https://thechadscan.com' + bundleMatch[1];
        const bundleResponse = await fetch(bundleUrl);
        const jsText = await bundleResponse.text();

        // Dynamically extract Supabase credentials from their production bundle
        const urlMatch = jsText.match(/https:\/\/[a-zA-Z0-9.\-_~:\/?#\[\]@!$&'()*+,;=]+supabase\.co/);
        const keyMatch = jsText.match(/eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/);

        if (!urlMatch || !keyMatch) throw new Error("Could not extract Supabase credentials");

        const supabaseUrl = urlMatch[0];
        const anonKey = keyMatch[0];

        // Fetch the full leaderboard (ordered by rating desc)
        const chadsResponse = await fetch(`${supabaseUrl}/rest/v1/chads?select=*&order=rating.desc`, {
            headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
        });
        const rawChads = await chadsResponse.json();

        // Fetch the total vote count from ChadScan
        const votesResponse = await fetch(`${supabaseUrl}/rest/v1/votes?select=id`, {
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`,
                'Prefer': 'count=exact'
            }
        });
        const externalVoteCount = parseInt(votesResponse.headers.get('content-range')?.split('/')[1] || '0');

        let validMoggers = [];
        for (const item of (Array.isArray(rawChads) ? rawChads : [])) {
            if (item.name && item.rating) {
                validMoggers.push({
                    name: item.name,
                    elo: item.rating,
                    wins: item.wins || 0,
                    losses: item.losses || 0,
                    image: item.image_url || ''
                });
            }
        }

        console.log(`[Scraper] Found ${validMoggers.length} moggers, ${externalVoteCount} external votes from ChadScan.`);

        if (validMoggers.length > 0) {
            await ctx.runMutation(internal.scraper.syncMoggers, {
                moggers: validMoggers,
                externalVoteCount
            });
            return `Synced ${validMoggers.length} moggers + ${externalVoteCount} external vote count.`;
        } else {
            return `Scrape empty.`;
        }
    }
});

// Mutation to diff-merge scraped data into our Convex database
export const syncMoggers = internalMutation({
    args: {
        moggers: v.array(v.object({
            name: v.string(),
            elo: v.number(),
            wins: v.optional(v.number()),
            losses: v.optional(v.number()),
            image: v.optional(v.string())
        })),
        externalVoteCount: v.number()
    },
    handler: async (ctx, args) => {
        for (const scraped of args.moggers) {
            const existing = await ctx.db.query("moggers")
                .withIndex("by_name", q => q.eq("name", scraped.name))
                .first();

            if (existing) {
                // Update ELO if ChadScan's is higher (keeps our local battles relevant too)
                const updates: any = {};
                if (scraped.elo > existing.elo) {
                    updates.elo = scraped.elo;
                    updates.eloHistory = [...existing.eloHistory, scraped.elo];
                }
                // Merge wins/losses additively from external source
                if (scraped.wins && scraped.wins > existing.wins) {
                    updates.wins = scraped.wins;
                }
                if (scraped.losses && scraped.losses > existing.losses) {
                    updates.losses = scraped.losses;
                }
                if (Object.keys(updates).length > 0) {
                    await ctx.db.patch(existing._id, updates);
                }
            } else if (scraped.image) {
                // New mogger from ChadScan — insert them
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

        // Upsert the external vote count into a metadata table
        const meta = await ctx.db.query("metadata").first();
        if (meta) {
            await ctx.db.patch(meta._id, { externalVoteCount: args.externalVoteCount });
        } else {
            await ctx.db.insert("metadata", {
                externalVoteCount: args.externalVoteCount,
                lastSyncTimestamp: Date.now()
            });
        }
    }
});
