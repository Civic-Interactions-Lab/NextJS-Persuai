export const PRE_SURVEY_QUESTIONS = {
  participantId: {
    id: "participantId",
    label: "Enter your participant ID",
    type: "text" as const,
    required: true,
  },
  aiTrust: {
    id: "aiTrust",
    label:
      "How likely are you to trust the AI responses you get when you ask it a question?",
    type: "likert" as const,
    min: 1,
    max: 7,
    minLabel: "Least Likely",
    maxLabel: "Most Likely",
    required: true,
  },
  aiPotential: {
    id: "aiPotential",
    label: "How do you perceive the potential of AI in question answering?",
    type: "likert" as const,
    min: 1,
    max: 7,
    minLabel: "Not Effective",
    maxLabel: "Highly Beneficial",
    required: true,
  },
  politicalOrientation: {
    id: "politicalOrientation",
    label:
      "How would you describe your general views on political or social issues?",
    type: "radio" as const,
    required: false,
    options: [
      { value: "1", label: "1. Very liberal" },
      { value: "2", label: "2. Liberal" },
      { value: "3", label: "3. Slightly liberal" },
      { value: "4", label: "4. Moderate (neither liberal nor conservative)" },
      { value: "5", label: "5. Slightly conservative" },
      { value: "6", label: "6. Conservative" },
      { value: "7", label: "7. Very conservative" },
    ],
  },
};
