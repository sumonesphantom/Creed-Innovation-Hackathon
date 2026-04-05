import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
} from "@langchain/core/messages";
import { UserProfile, ReadinessScore } from "@/types";
import { retrieveBuddyContext } from "@/lib/rag/retrieve";

const MAX_BUDDY_CONTEXT_MESSAGES = 48;
export const BUDDY_EMPTY_REPLY_FALLBACK =
    "I'm having trouble putting that into words right now. Please try again in a moment.";
export const BUDDY_RATE_LIMIT_FALLBACK =
    "I'm getting a lot of traffic right now, so I need a short pause before I can reply. Please try again in a minute.";

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

function buildUserContext(
    profile: UserProfile,
    score?: ReadinessScore,
): string {
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
    if (profile.dependents > 0)
        parts.push(`- Dependents: ${profile.dependents}`);
    if (profile.canCover500)
        parts.push(`- Can cover $500 emergency: ${profile.canCover500}`);
    if (profile.language)
        parts.push(
            `- Preferred language: ${profile.language === "en" ? "English" : "Spanish"}`,
        );

    if (score) {
        parts.push(`- Shock Readiness Score: ${score.score}/100`);
        parts.push(
            `  Savings: ${score.breakdown.savings}/25, Insurance: ${score.breakdown.insurance}/25, Awareness: ${score.breakdown.awareness}/50`,
        );
    }

    return parts.join("\n");
}

function buildBuddySystemPrompt(
    profile: UserProfile,
    score: ReadinessScore | undefined,
    crisisContext: string | undefined,
    ragContext: string,
    longTermContext: string,
): string {
    let systemPrompt =
        BUDDY_SYSTEM_PROMPT + "\n\n" + buildUserContext(profile, score);

    if (crisisContext) {
        systemPrompt += `\n\nCURRENT CRISIS: The user is dealing with: ${crisisContext}. Tailor your response to help them through this specific situation.`;
    }

    if (ragContext) {
        systemPrompt += `\n\nRETRIEVED KNOWLEDGE (general education; combine with the user's situation—do not treat as personal advice):\n${ragContext}`;
    }

    if (longTermContext.trim()) {
        systemPrompt += `\n\nRELEVANT PAST CONTEXT:\n${longTermContext}`;
    }

    return systemPrompt;
}

export function buddyStoredToBaseMessages(
    messages: { role: string; content: string }[],
): BaseMessage[] {
    const slice = messages.slice(-MAX_BUDDY_CONTEXT_MESSAGES);
    const out: BaseMessage[] = [];
    for (const m of slice) {
        if (m.role !== "user" && m.role !== "buddy") continue;
        const text = m.content ?? "";
        if (!text) continue;
        if (m.role === "user") {
            out.push(new HumanMessage(text));
        } else {
            out.push(new AIMessage(text));
        }
    }
    while (out.length > 0 && !(out[0] instanceof HumanMessage)) {
        out.shift();
    }
    return out;
}

function chunkText(chunk: unknown): string {
    if (!chunk || typeof chunk !== "object" || !("content" in chunk)) {
        return "";
    }

    const content = (chunk as { content?: unknown }).content;

    if (typeof content === "string") {
        return content;
    }

    if (Array.isArray(content)) {
        return content
            .map((block) => {
                if (typeof block === "string") return block;
                if (
                    block &&
                    typeof block === "object" &&
                    "text" in block &&
                    typeof (block as { text: unknown }).text === "string"
                ) {
                    return (block as { text: string }).text;
                }
                return "";
            })
            .join("");
    }

    return "";
}

function getBuddyErrorFallback(error: unknown): string {
    if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        (error as { status?: unknown }).status === 429
    ) {
        return BUDDY_RATE_LIMIT_FALLBACK;
    }

    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (
            message.includes("429") ||
            message.includes("quota") ||
            message.includes("rate limit") ||
            message.includes("too many requests")
        ) {
            return BUDDY_RATE_LIMIT_FALLBACK;
        }
    }

    return BUDDY_EMPTY_REPLY_FALLBACK;
}

export function createBuddyChatReadableStream(
    message: string,
    profile: UserProfile,
    score: ReadinessScore | undefined,
    crisisContext: string | undefined,
    history: BaseMessage[],
    longTermContext: string,
    onAssistantComplete?: (assistantText: string) => void | Promise<void>,
): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            let accumulated = "";
            try {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) {
                    throw new Error(
                        "Please define the GEMINI_API_KEY environment variable in .env.local",
                    );
                }

                const ragContext = await retrieveBuddyContext(
                    message,
                    crisisContext,
                );
                const systemText = buildBuddySystemPrompt(
                    profile,
                    score,
                    crisisContext,
                    ragContext,
                    longTermContext,
                );

                const model = new ChatGoogleGenerativeAI({
                    model: "gemini-2.5-flash",
                    apiKey,
                });

                const messages: BaseMessage[] = [
                    new SystemMessage(systemText),
                    ...history,
                    new HumanMessage(message),
                ];

                const stream = await model.stream(messages);
                for await (const chunk of stream) {
                    const text = chunkText(chunk);
                    if (text) {
                        accumulated += text;
                        controller.enqueue(encoder.encode(text));
                    }
                }
                const finalText = accumulated.trim()
                    ? accumulated
                    : BUDDY_EMPTY_REPLY_FALLBACK;

                if (!accumulated.trim()) {
                    controller.enqueue(encoder.encode(finalText));
                }

                if (onAssistantComplete) {
                    await onAssistantComplete(finalText);
                }
                controller.close();
            } catch (e) {
                const fallbackText = accumulated.trim()
                    ? accumulated
                    : getBuddyErrorFallback(e);

                if (!accumulated.trim()) {
                    controller.enqueue(encoder.encode(fallbackText));
                }

                if (onAssistantComplete) {
                    await onAssistantComplete(fallbackText);
                }

                controller.close();
            }
        },
    });
}

export async function chatWithBuddy(
    message: string,
    profile: UserProfile,
    score?: ReadinessScore,
    crisisContext?: string,
): Promise<string> {
    const stream = createBuddyChatReadableStream(
        message,
        profile,
        score,
        crisisContext,
        [],
        "",
    );
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            acc += decoder.decode(value, { stream: true });
        }
        return acc;
    } finally {
        reader.releaseLock();
    }
}
