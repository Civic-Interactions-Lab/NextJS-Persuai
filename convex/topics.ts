import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("topics").collect(),
});

export const getActive = query({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query("topics")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect(),
});

export const getById = query({
  args: { id: v.id("topics") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const create = mutation({
  args: {
    title: v.string(),
    issue: v.string(),
    context: v.string(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("topics", { ...args, isActive: args.isActive ?? true }),
});

export const update = mutation({
  args: {
    id: v.id("topics"),
    title: v.optional(v.string()),
    issue: v.optional(v.string()),
    context: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("topics") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
