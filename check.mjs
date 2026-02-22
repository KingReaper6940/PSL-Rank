import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const VITE_CONVEX_URL = process.env.VITE_CONVEX_URL;
const client = new ConvexHttpClient(VITE_CONVEX_URL);

async function run() {
    try {
        const url = new URL(VITE_CONVEX_URL);
        url.pathname = "/api/query";
        const res = await fetch(url.toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                path: "moggers:getMoggers",
                args: {},
                format: "json"
            })
        });
        const data = await res.json();
        const moggers = data.value;
        const vrishn = moggers.find(m => m.name.toLowerCase().includes("vrishn"));
        if (!vrishn) {
            console.log("no vrishn found");
            return;
        }
        console.log("Vrishn Details:", vrishn);

        const mRes = await fetch(url.toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                path: "moggers:getMatches",
                args: {},
                format: "json"
            })
        });
        const mData = await mRes.json();
        const matches = mData.value;

        const vMatches = matches.filter(m => m.winnerId === vrishn._id || m.loserId === vrishn._id);
        console.log("Vrishn's total matches in DB:", vMatches.length);
        console.log("- Wins in DB matches:", vMatches.filter(m => m.winnerId === vrishn._id).length);
        console.log("- First match timestamp:", vMatches.length ? new Date(vMatches[vMatches.length - 1].timestamp).toLocaleString() : 'none');
        console.log("- Last match timestamp:", vMatches.length ? new Date(vMatches[0].timestamp).toLocaleString() : 'none');

    } catch (e) { console.error(e); }
}

run();
