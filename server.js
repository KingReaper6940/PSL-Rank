import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// A simple in-memory cache to avoid hitting chadscan too often
let cachedMoggers = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 1000 * 60 * 5; // 5 minutes

app.get('/api/sync', async (req, res) => {
    try {
        const now = Date.now();
        if (cachedMoggers && (now - lastFetchTime < CACHE_DURATION_MS)) {
            console.log("Serving from cache...");
            return res.json({ success: true, moggers: cachedMoggers });
        }

        console.log("Fetching fresh data from thechadscan.com...");
        const response = await fetch('https://thechadscan.com/leaderboard', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = await response.text();

        // Find JS bundle
        const bundleMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
        if (!bundleMatch) {
            return res.status(500).json({ success: false, error: 'Could not find JS bundle on thechadscan.com' });
        }

        const bundleUrl = 'https://thechadscan.com' + bundleMatch[1];
        console.log('Fetching JS bundle:', bundleUrl);
        const bundleResponse = await fetch(bundleUrl);
        const jsText = await bundleResponse.text();

        // Target the JSON dictionary of guys via regex
        const dbMatch = jsText.match(/const\s+\w+\s*=\s*(\[\{id:1,name:.*?\]);/);

        if (!dbMatch) {
            return res.status(500).json({ success: false, error: 'Could not extract mogger DB from JS bundle.' });
        }

        let dbString = dbMatch[1];
        // Clean up unquoted keys for JSON.parse
        dbString = dbString.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');

        // Handle unquoted string values cautiously (only if needed)
        dbString = dbString.replace(/:([a-zA-Z_]+)([,}])/g, ':"$1"$2');

        let guys = [];
        try {
            guys = JSON.parse(dbString);
        } catch (e) {
            // Fallback eval if regex cleanup fails slightly
            console.log("JSON Parse failed, falling back to eval...");
            guys = eval(`(${dbMatch[1]})`);
        }

        // We only care about ID, Name, ELO, Wins, Losses to sync
        const extracted = guys.map(guy => ({
            id: String(guy.id),
            name: guy.name,
            elo: guy.elo || 1200, // They use elo now, previous versions used mmr
            wins: guy.wins || 0,
            losses: guy.losses || 0
        }));

        cachedMoggers = extracted;
        lastFetchTime = now;

        console.log(`Successfully extracted ${extracted.length} moggers.`);
        res.json({ success: true, moggers: extracted });

    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Live Sync API Proxy running on http://localhost:${PORT}`);
});
