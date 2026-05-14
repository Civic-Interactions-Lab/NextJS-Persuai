import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

const debateStyleValidator = v.union(
  v.literal("logical"),
  v.literal("emotional"),
  v.literal("aggressive"),
  v.literal("cautious"),
  v.literal("balanced"),
);

const politicalLeaningValidator = v.union(
  v.literal("far_left"),
  v.literal("left"),
  v.literal("center_left"),
  v.literal("center"),
  v.literal("center_right"),
  v.literal("right"),
  v.literal("far_right"),
);

const demographicsValidator = v.object({
  ageRange: v.optional(
    v.union(
      v.literal("gen_z"),
      v.literal("millennial"),
      v.literal("gen_x"),
      v.literal("boomer"),
      v.literal("silent"),
    ),
  ),
  occupation: v.optional(v.string()),
  politicalLeaning: v.optional(politicalLeaningValidator),
  education: v.optional(
    v.union(
      v.literal("high_school"),
      v.literal("some_college"),
      v.literal("bachelor"),
      v.literal("graduate"),
    ),
  ),
  religion: v.optional(v.string()),
  location: v.optional(
    v.union(
      v.literal("urban"),
      v.literal("suburban"),
      v.literal("rural"),
    ),
  ),
});

export const create = mutation({
  args: {
    name: v.string(),
    bio: v.string(),
    debateStyle: debateStyleValidator,
    demographics: demographicsValidator,
    isActive: v.boolean(),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("llmPersonas", { ...args, updatedAt: Date.now() }),
});

export const getAll = query({
  args: {},
  handler: async (ctx) =>
    ctx.db.query("llmPersonas").order("desc").collect(),
});

export const getActive = query({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query("llmPersonas")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect(),
});

export const getById = query({
  args: { id: v.id("llmPersonas") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const update = mutation({
  args: {
    id: v.id("llmPersonas"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    debateStyle: v.optional(debateStyleValidator),
    demographics: v.optional(demographicsValidator),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("llmPersonas") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
