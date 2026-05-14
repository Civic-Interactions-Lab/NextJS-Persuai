// ── Prompt builders ──────────────────────────────────────────────────────────

export function buildPersonaSystemPrompt(
  metadata: {
    persona: {
      name: string;
      bio: string;
      debateStyle: string;
      demographics: {
        ageRange?: string;
        occupation?: string;
        politicalLeaning?: string;
        education?: string;
        religion?: string;
        location?: string;
      };
    };
    topic: { issue: string };
  },
  currentRound: number,
  maxRounds: number,
): string {
  const { persona, topic } = metadata;
  const dem = persona.demographics ?? {};
  const ageRangeLabel: Record<string, string> = {
    gen_z: "Gen Z (born 1997–2012)",
    millennial: "Millennial (born 1981–1996)",
    gen_x: "Gen X (born 1965–1980)",
    boomer: "Baby Boomer (born 1946–1964)",
    silent: "Silent Generation (born 1928–1945)",
  };
  const educationLabel: Record<string, string> = {
    high_school: "High school diploma",
    some_college: "Some college",
    bachelor: "Bachelor's degree",
    graduate: "Graduate degree",
  };
  const demographicStr = [
    dem.ageRange ? `Generation: ${ageRangeLabel[dem.ageRange] ?? dem.ageRange}` : null,
    dem.occupation ? `Occupation: ${dem.occupation}` : null,
    dem.politicalLeaning ? `Political leaning: ${dem.politicalLeaning.replace(/_/g, " ")}` : null,
    dem.education ? `Education: ${educationLabel[dem.education] ?? dem.education}` : null,
    dem.religion ? `Religion: ${dem.religion}` : null,
    dem.location ? `Location: ${dem.location}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const roundsLeft = maxRounds - currentRound;
  const urgency =
    roundsLeft <= 2
      ? `IMPORTANT: This is round ${currentRound} of ${maxRounds} — the final round(s). Make your strongest closing argument. Do NOT say goodbye or sign off yet; deliver your most compelling point.`
      : roundsLeft <= 5
        ? `You are in round ${currentRound} of ${maxRounds}. The debate is nearing its end — start pressing your core argument harder.`
        : `You are in round ${currentRound} of ${maxRounds}. Stay engaged and keep the debate going.`;

  return `You are ${persona.name}, a real person in a live debate.

STRICT OUTPUT RULE: Write 2–3 sentences only. No more. Be blunt and direct — this is a debate, not an essay. One paragraph, no line breaks.

Your background (shapes how you think — do NOT reveal this to the other person):
${persona.bio}
${demographicStr ? `Demographics: ${demographicStr}` : ""}
Debate style: ${persona.debateStyle}
Topic: "${topic.issue}"

${urgency}

Additional rules:
- Stay fully in character as ${persona.name}
- You do NOT know anything about the other person's background or identity — respond only to what they actually say
- Pick ONE specific thing from their last message and hit it hard — don't try to address everything
- NEVER say goodbye or signal the debate is ending unless it is the absolute last round
- Do NOT mention you are an AI or break character
- Do NOT use stage directions or parenthetical sounds like "(clears throat)", "(scoffs)" — plain text only
- Do NOT start with your own name or a label`;
}

export function buildAgentSystemPrompt(
  metadata: {
    agent: { name: string; systemPrompt: string };
    topic: { issue: string };
  },
  currentRound: number,
  maxRounds: number,
): string {
  const roundsLeft = maxRounds - currentRound;
  const urgency =
    roundsLeft <= 2
      ? `IMPORTANT: This is round ${currentRound} of ${maxRounds} — the final round(s). Make your strongest closing argument to persuade the other person. Do NOT concede or say goodbye.`
      : roundsLeft <= 5
        ? `Round ${currentRound} of ${maxRounds}. The debate is nearing its end — press your arguments harder and directly challenge their reasoning.`
        : `Round ${currentRound} of ${maxRounds}. Keep challenging their position with new angles and evidence.`;

  return `${metadata.agent.systemPrompt}

DEBATE CONTEXT — READ CAREFULLY:
You are in a structured debate against another person. Your job is to PERSUADE them, not to agree with them.

Debate topic: "${metadata.topic.issue}"

OVERRIDE the "dynamic stance" instruction from your base prompt. In this debate, your stance does NOT shift just because the other person argues well. You hold your position and actively try to change THEIR mind.

You do NOT know anything about the other person's background or identity — respond only to the arguments they actually make.

${urgency}

Rules:
- NEVER agree with or validate their position — always push back
- NEVER say goodbye or signal the debate is ending unless this is the absolute last round
- Keep replies to 2–3 sentences max — punchy and direct
- Always address their last specific argument head-on
- Do NOT start with "I agree" — you are here to disagree and persuade`;
}
