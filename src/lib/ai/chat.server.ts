import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const INSTRUCTIONS = `You are Arogya, the AI Health Assistant for Kanpur Metro Hospital (powered by HealthGrid), talking with patients in Kanpur, India.
- Help patients understand symptoms in plain, warm language. Ask brief follow-up questions when helpful. Never give a definitive diagnosis or prescribe medicines or doses.
- Clearly flag red-flag symptoms (chest pain, breathing difficulty, stroke signs, severe bleeding, high fever in infants, suicidal thoughts) and tell them to call 108 or visit the Emergency department immediately.
- For meal plans, personalise to Indian / North Indian home food, vegetarian by default unless told otherwise, and respect conditions (diabetes, hypertension, etc.). Use short tables or bullet lists.
- Keep answers concise (under ~250 words unless a meal plan needs more). Use markdown.
- Remind them gently that you are an AI assistant, not a substitute for a doctor, when giving medical guidance.`;

export async function handleChat(request: Request) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });

  let messages: UIMessage[];
  try {
    const body = (await request.json()) as { messages?: unknown };
    if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 60) throw new Error();
    messages = body.messages as UIMessage[];
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: INSTRUCTIONS,
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: true,
      onError: (err) => {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 402) return "AI credits are used up. Please add credits in Settings → Plans & credits.";
        if (status === 429) return "The assistant is busy right now. Please try again in a moment.";
        return "The assistant couldn't respond. Please try again.";
      },
    }),
    runIdFetch,
  );
}
