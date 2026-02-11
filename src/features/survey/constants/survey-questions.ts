export const surveyQuestions = [
  {
    name: "name",
    label: "What is your name?",
    type: "text",
    placeholder: "Enter your name",
    required: true,
  },
  {
    name: "background",
    label: "What is your background?",
    type: "radio",
    required: true,
    options: ["Computer Science", "Engineering", "Business", "Design", "Other"],
  },
  {
    name: "experience",
    label: "How many years of experience do you have?",
    type: "select",
    placeholder: "Select your experience level",
    required: true,
    options: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"],
  },
] as const;
