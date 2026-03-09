import { v } from "convex/values";

export const QUESTION_TYPES = [
  "text",
  "long_text",
  "likert",
  "rating",
  "multiple_choice",
  "checkbox",
  "nasa_tlx",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const questionTypeValidator = v.union(
  ...(QUESTION_TYPES.map((t) => v.literal(t)) as [
    ReturnType<typeof v.literal>,
    ReturnType<typeof v.literal>,
    ...ReturnType<typeof v.literal>[],
  ]),
);

export const questionValidator = v.object({
  id: v.string(),
  type: questionTypeValidator,
  prompt: v.string(),
  required: v.boolean(),
  options: v.optional(v.array(v.string())),
  points: v.optional(v.number()),
  labels: v.optional(v.array(v.string())),
  min: v.optional(v.number()),
  max: v.optional(v.number()),
  step: v.optional(v.number()),
});

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  required: boolean;
  options?: string[];
  points?: number;
  labels?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  text: "Short answer",
  long_text: "Long answer",
  likert: "Likert scale",
  rating: "Rating (slider)",
  multiple_choice: "Multiple choice",
  checkbox: "Checkboxes",
  nasa_tlx: "NASA-TLX",
};

export const TYPES_WITH_OPTIONS: QuestionType[] = [
  "multiple_choice",
  "checkbox",
];

export const NASA_TLX_DIMENSIONS = [
  "Mental Demand",
  "Physical Demand",
  "Temporal Demand",
  "Performance",
  "Effort",
  "Frustration",
] as const;

export const QUESTION_DEFAULTS: Record<
  QuestionType,
  Partial<SurveyQuestion>
> = {
  text: {},
  long_text: {},
  likert: {
    points: 5,
    labels: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree",
    ],
  },
  rating: { min: 1, max: 10, step: 1 },
  multiple_choice: { options: [] },
  checkbox: { options: [] },
  nasa_tlx: { min: 0, max: 100, step: 5 },
};
