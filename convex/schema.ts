import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    moggers: defineTable({
        name: v.string(),
        alias: v.optional(v.string()),
        tagline: v.optional(v.string()),
        image: v.string(),
        elo: v.number(),
        wins: v.number(),
        losses: v.number(),
        eloHistory: v.array(v.number()),
        dateAdded: v.string(),
    }).index("by_elo", ["elo"]).index("by_name", ["name"]),

    matches: defineTable({
        winnerId: v.string(),
        loserId: v.string(),
        timestamp: v.number(),
    }).index("by_timestamp", ["timestamp"]).index("by_winner", ["winnerId"]).index("by_loser", ["loserId"]),

    imageRequests: defineTable({
        moggerId: v.id("moggers"),
        proposedImageUrl: v.string(),
        status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
        timestamp: v.number(),
    }).index("by_status", ["status"]).index("by_mogger", ["moggerId"]),
});
