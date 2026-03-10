import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("topics").collect();
    if (existing.length > 0) return;

    const topics = [
      {
        label: "Universal Basic Income",
        prompt:
          "I believe universal basic income should be implemented globally. It would reduce poverty, provide financial security, and give people freedom to pursue meaningful work without fear of destitution.",
        isActive: true,
      },
      {
        label: "Remote Work vs Office",
        prompt:
          "Working from home is more productive than office work. People have fewer distractions, save commute time, and can create their ideal work environment at home.",
        isActive: true,
      },
      {
        label: "Social Media Ban for Kids",
        prompt:
          "Social media should be banned for anyone under 16 years old. It's harmful to mental health, disrupts development, and exposes children to inappropriate content and predators.",
        isActive: true,
      },
      {
        label: "Four-Day Work Week",
        prompt:
          "All companies should adopt a four-day work week. Research shows productivity doesn't decrease, employee satisfaction increases, and it's better for work-life balance.",
        isActive: true,
      },
      {
        label: "College Education Value",
        prompt:
          "Traditional college degrees are becoming obsolete. With online learning, bootcamps, and self-education, spending four years and going into debt for a degree makes no sense anymore.",
        isActive: true,
      },
      {
        label: "AI in Healthcare",
        prompt:
          "AI should replace doctors for most diagnostic work. AI is more accurate, faster, doesn't get tired, and would make healthcare more accessible and affordable for everyone.",
        isActive: true,
      },
      {
        label: "Privacy vs Security",
        prompt:
          "We should give up some privacy for better security. Mass surveillance and data collection help prevent terrorism and crime, which is worth the trade-off.",
        isActive: true,
      },
      {
        label: "Cryptocurrency Future",
        prompt:
          "Cryptocurrency will replace traditional banking within 20 years. It's more transparent, accessible globally, and eliminates the need for centralized financial institutions.",
        isActive: true,
      },
      {
        label: "Space Exploration Priority",
        prompt:
          "Space exploration is a waste of money when we have problems on Earth. We should focus resources on climate change, poverty, and healthcare instead of Mars missions.",
        isActive: true,
      },
      {
        label: "Standardized Testing",
        prompt:
          "Standardized tests should be eliminated from education. They don't measure real intelligence or ability, create unnecessary stress, and disadvantage certain groups of students.",
        isActive: true,
      },
    ];

    for (const topic of topics) {
      await ctx.db.insert("topics", topic);
    }
  },
});

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
    label: v.string(),
    prompt: v.string(),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) =>
    ctx.db.insert("topics", { ...args, isActive: args.isActive ?? true }),
});

export const update = mutation({
  args: {
    id: v.id("topics"),
    label: v.optional(v.string()),
    prompt: v.optional(v.string()),
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
