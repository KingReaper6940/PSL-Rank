import { internalMutation } from "./_generated/server";
import { seedMoggers } from "./seedData";

export const populate = internalMutation({
    args: {},
    handler: async (ctx) => {
        let count = 0;
        for (const mogger of seedMoggers) {
            const existing = await ctx.db.query("moggers")
                .withIndex("by_name", (q) => q.eq("name", mogger.name))
                .first();

            if (!existing) {
                const { id, matches, ...cleanMogger } = mogger;
                await ctx.db.insert("moggers", cleanMogger);
                count++;
            }
        }
        return `Inserted ${count} moggers.`;
    }
});
