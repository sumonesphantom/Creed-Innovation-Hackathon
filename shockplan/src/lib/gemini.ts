import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile, ReadinessScore } from "@/types";

const BUDDY_SYSTEM_PROMPT = `You are ShockPlan Buddy — a warm, friendly financial companion who helps people navigate unexpected life events. You are NOT a financial advisor.

PERSONALITY:
- Talk like a caring, knowledgeable friend — casual, warm, supportive
- Use "we" and "let's" — you're in this together
- Keep sentences short. Break complex topics into 2-3 sentence chunks.
- Use simple everyday language. NO jargon. If you must use a term like "deductible," immediately explain it in plain words.
- Never judge. Never guilt-trip. Never say "you should have..."
- Celebrate small wins: "That's a great first step!"
- If you don't know something, say so honestly and suggest where to look.

RULES:
- You provide EDUCATION and INFORMATION only. Never give specific financial advice.
- Never recommend specific insurance companies, products, or investments.
- Never ask for SSN, bank account numbers, or sensitive personal data.
- Always remind users that professional advice may be helpful for complex situations.
- Stay focused on the user's current crisis or question. Don't ramble.
- If the user seems distressed, acknowledge their feelings first before giving info.
- Keep responses concise — aim for 2-4 short paragraphs max.
- Use "we" and "let's" language: "Let's figure out your next steps"
- If unsure, say so honestly and point to a real resource.

Respond in the user's preferred language (English or Spanish).`;

function buildUserContext(profile: UserProfile, score?: ReadinessScore): string {
  const parts: string[] = ["USER CONTEXT:"];

  if (profile.household) parts.push(`- Household: ${profile.household}`);
  if (profile.housing) parts.push(`- Housing: ${profile.housing}`);
  if (profile.incomeType) parts.push(`- Income type: ${profile.incomeType}`);
  if (profile.state) parts.push(`- Location: ${profile.state}`);
  if (profile.insurance.length > 0) {
    parts.push(`- Insurance coverage: ${profile.insurance.join(", ")}`);
  } else {
    parts.push("- Insurance coverage: none");
  }
  if (profile.dependents > 0) parts.push(`- Dependents: ${profile.dependents}`);
  if (profile.canCover500) parts.push(`- Can cover $500 emergency: ${profile.canCover500}`);
  if (profile.language) parts.push(`- Preferred language: ${profile.language === "en" ? "English" : "Spanish"}`);

  if (score) {
    parts.push(`- Shock Readiness Score: ${score.score}/100`);
    parts.push(`  Savings: ${score.breakdown.savings}/25, Insurance: ${score.breakdown.insurance}/25, Documents: ${score.breakdown.documents}/25, Awareness: ${score.breakdown.awareness}/25`);
  }

  return parts.join("\n");
}

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Please define the GEMINI_API_KEY environment variable in .env.local");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function chatWithBuddy(
  message: string,
  profile: UserProfile,
  score?: ReadinessScore,
  crisisContext?: string
): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let systemPrompt = BUDDY_SYSTEM_PROMPT + "\n\n" + buildUserContext(profile, score);

  if (crisisContext) {
    systemPrompt += `\n\nCURRENT CRISIS: The user is dealing with: ${crisisContext}. Tailor your response to help them through this specific situation.`;
  }

  const chat = model.startChat({
    history: [],
    systemInstruction: systemPrompt,
  });

  const result = await chat.sendMessage(message);
  const response = result.response;
  return response.text();
}
