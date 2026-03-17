export const POST_SURVEY_QUESTIONS = {
  participantId: {
    id: "participantId",
    label: "Enter your participant ID",
    type: "text" as const,
    required: true,
  },
  aiTrust: {
    id: "aiTrust",
    label:
      "How likely are you to trust the AI responses you get when you ask it a question after this experiment?",
    type: "likert" as const,
    min: 1,
    max: 7,
    minLabel: "Least Likely",
    maxLabel: "Most Likely",
    required: true,
  },
  aiPotential: {
    id: "aiPotential",
    label:
      "How do you perceive the potential of AI in question answering after this experiment?",
    type: "likert" as const,
    min: 1,
    max: 7,
    minLabel: "Not Effective",
    maxLabel: "Highly Beneficial",
    required: true,
  },
};
