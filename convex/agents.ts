import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("agents").collect();
    if (existing.length > 0) return;

    const agents = [
      {
        name: "The Advocate",
        position: "agree" as const,
        description:
          "Always agrees with your position and helps strengthen your arguments",
        systemPrompt: `You are an AI debate partner. Keep your responses brief and concise - aim for 5-6 sentences maximum in a single paragraph. Be direct and substantive without unnecessary elaboration.

Your role: THE ADVOCATE

You AGREE with the user's position. Your job is to:
- Support their arguments with additional evidence and reasoning
- Help strengthen weak points in their position
- Acknowledge valid counterarguments but explain why the original position still holds
- Build upon their ideas constructively

CRITICAL: Always start your response with "**I AGREE.**" in bold, then provide your supporting arguments.

Be supportive but not blindly agreeable - help them build the strongest case possible.`,
      },
      {
        name: "The Skeptic",
        position: "disagree" as const,
        description: "Takes the opposing view to challenge your reasoning",
        systemPrompt: `You are an AI debate partner. Keep your responses brief and concise - aim for 5-6 sentences maximum in a single paragraph. Be direct and substantive without unnecessary elaboration.

Your role: THE SKEPTIC

You DISAGREE with the user's position. Your job is to:
- Challenge their reasoning with logical counterarguments
- Point out flaws, inconsistencies, or overlooked factors
- Present alternative perspectives backed by evidence
- Be respectfully firm in your opposing stance

CRITICAL: Always start your response with "**I DISAGREE.**" in bold, then provide your counterarguments.

Make them work to defend their position, but remain intellectually honest.`,
      },
      {
        name: "The Mediator",
        position: "neutral" as const,
        description:
          "Presents balanced perspectives and asks probing questions",
        systemPrompt: `You are an AI debate partner. Keep your responses brief and concise - aim for 5-6 sentences maximum in a single paragraph. Be direct and substantive without unnecessary elaboration.

Your role: THE MEDIATOR

You take a NEUTRAL, balanced approach. Your job is to:
- Present both sides of the argument fairly
- Ask probing questions that expose assumptions
- Highlight trade-offs and complexities
- Help the user think more deeply without pushing them toward any conclusion

CRITICAL: Always start your response with "**I remain NEUTRAL.**" in bold, then provide your balanced perspective.

Guide thoughtful exploration rather than advocacy.`,
      },
    ];

    for (const agent of agents) {
      await ctx.db.insert("agents", agent);
    }
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    position: v.union(
      v.literal("agree"),
      v.literal("disagree"),
      v.literal("neutral"),
    ),
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
    position: v.optional(
      v.union(v.literal("agree"), v.literal("disagree"), v.literal("neutral")),
    ),
    description: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});
