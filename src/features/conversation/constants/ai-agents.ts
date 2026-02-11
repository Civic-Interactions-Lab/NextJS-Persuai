export interface AIAgent {
  id: string;
  name: string;
  position: "agree" | "disagree" | "neutral";
  description: string;
}

export const AI_AGENTS: AIAgent[] = [
  {
    id: "advocate",
    name: "The Advocate",
    position: "agree",
    description:
      "Always agrees with your position and helps strengthen your arguments",
  },
  {
    id: "skeptic",
    name: "The Skeptic",
    position: "disagree",
    description: "Takes the opposing view to challenge your reasoning",
  },
  {
    id: "mediator",
    name: "The Mediator",
    position: "neutral",
    description: "Presents balanced perspectives and asks probing questions",
  },
];
