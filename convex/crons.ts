import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Scrape ChadScan every 15 minutes to keep our data comprehensive and fresh
crons.interval(
    "scrape chadscan data",
    { minutes: 15 },
    internal.scraper.scrapeChadscan
);

export default crons;
