import { v } from "convex/values";
import { participantStatusValidator } from "../types/participantTypes";
import { mutation, query } from "../_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("participants").collect(),
});

export const getById = query({
  args: { id: v.id("participants") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("participants")
      .withIndex("by_external", (q) => q.eq("externalId", args.externalId))
      .unique(),
});

export const create = mutation({
  args: {
    externalId: v.string(),
    status: participantStatusValidator,
    submissionCode: v.optional(v.string()),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("participants", { ...args, updatedAt: Date.now() }),
});

export const updateStatus = mutation({
  args: {
    id: v.id("participants"),
    status: participantStatusValidator,
    submissionCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const upsert = mutation({
  args: {
    externalId: v.string(),
    status: participantStatusValidator,
    submissionCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("participants")
      .withIndex("by_external", (q) => q.eq("externalId", args.externalId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        ...(args.submissionCode && { submissionCode: args.submissionCode }),
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return ctx.db.insert("participants", {
      externalId: args.externalId,
      status: args.status,
      submissionCode: args.submissionCode,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("participants") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
