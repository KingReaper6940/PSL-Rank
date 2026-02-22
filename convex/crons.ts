import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Scrape ChadScan every 15 minutes to keep our data comprehensive and fresh
crons.interval(
    "scrape chadscan data",
    { minutes: 15 },
    internal.scraper.scrapeChadscan
);

// Bot that hallucinate matches
crons.interval(
    "simulate matches",
    { minutes: 5 },
    internal.moggers.simulateRandomMatches,
    { count: 3 } // Simulates 3 matches every 5 minutes
);

export default crons;
