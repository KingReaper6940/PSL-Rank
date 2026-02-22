import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// This runs the scraper every hour automatically to merge ChadScan's data globally.
crons.hourly(
    "scrape chadscan data",
    { minuteUTC: 0 },
    internal.scraper.scrapeChadscan
);

export default crons;
