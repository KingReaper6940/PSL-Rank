import { action, internalAction, internalMutation, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const proposeImage = mutation({
    args: {
        moggerId: v.id("moggers"),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const requestId = await ctx.db.insert("imageRequests", {
            moggerId: args.moggerId,
            proposedImageUrl: args.imageUrl,
            status: "pending",
            timestamp: Date.now(),
        });

        // We trigger the simulated AI review in the background
        await ctx.scheduler.runAfter(0, internal.images.simulateAiReview, {
            requestId
        });

        return requestId;
    }
});

export const simulateAiReview = internalAction({
    args: {
        requestId: v.id("imageRequests")
    },
    handler: async (ctx, args) => {
        console.log(`Simulating Gemini Vision API review for request ${args.requestId}...`);

        // Simulate network delay and LLM processing time
        await new Promise(resolve => setTimeout(resolve, 3500 + Math.random() * 2000));

        // Simple heuristic: randomly approve 70% of requests to simulate a strict AI model looking for HD frontal facing portraits.
        // Usually you would send the image URL to the Gemini API here.
        const passesReview = Math.random() > 0.3;

        await ctx.runMutation(internal.images.resolveImageRequest, {
            requestId: args.requestId,
            approved: passesReview
        });
    }
});

export const resolveImageRequest = internalMutation({
    args: {
        requestId: v.id("imageRequests"),
        approved: v.boolean(),
    },
    handler: async (ctx, args) => {
        const request = await ctx.db.get(args.requestId);
        if (!request) return;

        await ctx.db.patch(args.requestId, {
            status: args.approved ? "approved" : "rejected"
        });

        if (args.approved) {
            await ctx.db.patch(request.moggerId, {
                image: request.proposedImageUrl
            });
        }
    }
});
