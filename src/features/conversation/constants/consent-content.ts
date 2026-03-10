export const CONSENT_CONTENT = {
  title: "Opinion Dynamics in Human LLM Interaction — Consent Form",
  subtitle:
    "Protocol Number: 32995 ▪ PI: Stephen MacNeil ▪ Temple University ▪ College of Science and Technology (CST)",
  sections: [
    {
      heading: "What is this? Why are we asking for your participation?",
      paragraphs: [
        'We are asking you to participate in a research study titled "Opinion Dynamics in Human-LLM Interaction." The Faculty Advisor for this study is Stephen MacNeil, Department of Computer and Information Sciences, Temple University.',
      ],
      bullets: [
        "Are 18 years or older",
        "Can read and write English",
        "Have access to a computer with the internet",
      ],
      bulletsLabel: "You are eligible to participate if you:",
    },
    {
      heading: "What is this study about?",
      paragraphs: [
        "In this study, you will choose one topic from a set of public issues (such as freedom of speech, healthcare, climate change, or immigration) and engage in a conversation about that topic with an AI agent. Some participants may find certain social or political topics personal or sensitive. You may skip any question, change the topic if you feel uncomfortable, or stop participating at any time without penalty.",
      ],
    },
    {
      heading:
        "Will everything about the study be explained to me ahead of time?",
      paragraphs: [
        "While we cannot fully disclose the purpose of this research because it would negatively impact the scientific validity of this study, we are providing you with as much information as we can disclose without compromising the results. By participating in this research, you are agreeing to participate despite not being fully informed of all of the purposes of the research.",
      ],
    },
    {
      heading: "What will you do in this study?",
      paragraphs: [
        "Recruitment will be managed through the Prolific website. Participants will access the experiment, which consists of pre and post surveys, consent form, and the experiment web application, by clicking a provided link. Prolific will retain all identifiable participant information. In our surveys, participants will only be asked to enter the unique participant number assigned to them by Prolific; we will not have access to any other participant details.",
      ],
      bullets: [
        "You will complete a short pre-survey about your general opinions on several political/social topics. This includes one optional question about your general political orientation (1 = very liberal, 4 = moderate, 7 = very conservative). You may skip any question.",
        "You will use our Chatbot system to engage in a 30-round conversation with an AI agent about one of the topics you chose.",
        "After the conversation, you may be asked follow-up questions about your experience.",
        "This entire task will take approximately 60 minutes.",
      ],
    },
    {
      heading: "What risks are associated with this study?",
      subsections: [
        {
          label: "Loss of Confidentiality:",
          text: "There is a potential risk of loss of confidentiality. Your conversations, survey responses, and associated data will be stored without your name or identifying information. Only the research team will have access to this data.",
        },
        {
          label: "Inappropriate Content:",
          text: "AI models may occasionally generate inappropriate text. We will monitor this and stop the study if necessary.",
        },
        {
          label: "Fatigue or Boredom:",
          text: "The task may become repetitive; you may stop at any time.",
        },
        {
          label: "Sensitive Question Risk:",
          text: "The pre-survey includes an optional question about political orientation. You may skip it.",
        },
      ],
    },
    {
      heading: "What are alternatives to participating in the study?",
      paragraphs: [
        "You are not under any obligation to participate in the study. If at any time you choose to end participation in the study you may notify a researcher and we will delete your data.",
      ],
    },
    {
      heading: "What benefits/compensation can you expect?",
      paragraphs: [
        "You may gain insight into how people interact with AI models and how AI powered Chatbots respond to their users.",
        "Participants will receive a $10 electronic payment from Prolific as a thank-you for their time.",
      ],
    },
    {
      heading: "Ending participation in our study",
      paragraphs: [
        "Participation is entirely voluntary. You may end participation early at any time without losing compensation. If you withdraw, your data will be deleted upon request.",
        "The PI may remove you from the study without your consent if the PI feels it is in your best interest or the best interest of the study. If you encounter unforeseen technical issues we will remove you from the study.",
      ],
    },
    {
      heading: "Are there any associated costs?",
      paragraphs: ["No, this study will not come at any cost to you."],
    },
    {
      heading: "Who can you contact if there are additional questions?",
      paragraphs: [
        "If you have any additional questions, you may contact the researchers:",
      ],
      contacts: [
        {
          name: "Mohammad Siahkamari",
          email: "mohammad.siahkamari@temple.edu",
        },
        { name: "Stephen MacNeil", email: "stephen.macneil@temple.edu" },
        {
          name: "Temple IRB",
          email: "irb@temple.edu",
          phone: "(215) 707-3390",
        },
      ],
    },
  ],
  consentStatement:
    "I agree to participate in this study. I agree to allow the research team to collect data in the study and share this data internally.",
};
