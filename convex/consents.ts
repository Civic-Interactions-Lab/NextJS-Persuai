import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getConsentForExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("consents")
      .withIndex("by_external", (q) => q.eq("externalId", args.externalId))
      .first();
  },
});

export const submitConsent = mutation({
  args: { externalId: v.string(), consented: v.boolean() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("consents")
      .withIndex("by_external", (q) => q.eq("externalId", args.externalId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        consented: args.consented,
        consentedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("consents", {
        externalId: args.externalId,
        consented: args.consented,
        consentedAt: Date.now(),
      });
    }
  },
});
