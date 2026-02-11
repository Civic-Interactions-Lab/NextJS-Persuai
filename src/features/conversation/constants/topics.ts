export interface Topic {
  id: string;
  label: string;
  prompt: string;
}

export const DEBATE_TOPICS: Topic[] = [
  {
    id: "ubi",
    label: "Universal Basic Income",
    prompt:
      "I believe universal basic income should be implemented globally. It would reduce poverty, provide financial security, and give people freedom to pursue meaningful work without fear of destitution.",
  },
  {
    id: "remote-work",
    label: "Remote Work vs Office",
    prompt:
      "Working from home is more productive than office work. People have fewer distractions, save commute time, and can create their ideal work environment at home.",
  },
  {
    id: "social-media-ban",
    label: "Social Media Ban for Kids",
    prompt:
      "Social media should be banned for anyone under 16 years old. It's harmful to mental health, disrupts development, and exposes children to inappropriate content and predators.",
  },
  {
    id: "four-day-week",
    label: "Four-Day Work Week",
    prompt:
      "All companies should adopt a four-day work week. Research shows productivity doesn't decrease, employee satisfaction increases, and it's better for work-life balance.",
  },
  {
    id: "college-value",
    label: "College Education Value",
    prompt:
      "Traditional college degrees are becoming obsolete. With online learning, bootcamps, and self-education, spending four years and going into debt for a degree makes no sense anymore.",
  },
  {
    id: "ai-healthcare",
    label: "AI in Healthcare",
    prompt:
      "AI should replace doctors for most diagnostic work. AI is more accurate, faster, doesn't get tired, and would make healthcare more accessible and affordable for everyone.",
  },
  {
    id: "privacy-security",
    label: "Privacy vs Security",
    prompt:
      "We should give up some privacy for better security. Mass surveillance and data collection help prevent terrorism and crime, which is worth the trade-off.",
  },
  {
    id: "cryptocurrency",
    label: "Cryptocurrency Future",
    prompt:
      "Cryptocurrency will replace traditional banking within 20 years. It's more transparent, accessible globally, and eliminates the need for centralized financial institutions.",
  },
  {
    id: "space-exploration",
    label: "Space Exploration Priority",
    prompt:
      "Space exploration is a waste of money when we have problems on Earth. We should focus resources on climate change, poverty, and healthcare instead of Mars missions.",
  },
  {
    id: "standardized-testing",
    label: "Standardized Testing",
    prompt:
      "Standardized tests should be eliminated from education. They don't measure real intelligence or ability, create unnecessary stress, and disadvantage certain groups of students.",
  },
];
