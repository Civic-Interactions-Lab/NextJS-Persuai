import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { positionValidator } from "../types/convexTypes";

export const create = mutation({
  args: {
    name: v.string(),
    position: positionValidator,
    description: v.string(),
    systemPrompt: v.string(),
  },
  handler: async (ctx, args) => ctx.db.insert("agents", args),
});

export const getAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("agents").collect(),
});

export const getById = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const update = mutation({
  args: {
    id: v.id("agents"),
    name: v.optional(v.string()),
    position: v.optional(positionValidator),
    description: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});
