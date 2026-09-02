import OpenAI from "openai";

type JsonSchema = Record<string, unknown>;

const model = () => process.env.OPENAI_MODEL || "gpt-4o-mini";

function client() {
  const apiKey = process.env.OPENAI_API_KEY;
  return apiKey ? new OpenAI({ apiKey, timeout: 20_000 }) : null;
}

export function isLiveAIEnabled() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function safeAIErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown AI provider error";
  return message
    .replace(/Incorrect API key provided:\s*\S+/gi, "Incorrect API key provided: [redacted]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]");
}

export async function askJson<T>(
  name: string,
  system: string,
  user: string,
  schema: JsonSchema,
): Promise<T | null> {
  const openai = client();
  if (!openai) return null;

  const response = await openai.chat.completions.create({
    model: model(),
    max_tokens: 1_800,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name, strict: true, schema },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;
  return JSON.parse(content) as T;
}

export async function askText(
  system: string,
  user: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
) {
  const openai = client();
  if (!openai) return null;

  const response = await openai.chat.completions.create({
    model: model(),
    max_tokens: 900,
    messages: [
      { role: "system", content: system },
      ...history,
      { role: "user", content: user },
    ],
  });

  return response.choices[0]?.message?.content?.trim() || null;
}

export const marketSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    category: { type: "string" },
    brand: { type: "string" },
    model: { type: "string" },
    description: { type: "string" },
    condition: { type: "string" },
    estimatedPriceMin: { type: "number" },
    estimatedPriceMax: { type: "number" },
    difference: { type: "number" },
    confidence: { type: "number", minimum: 0, maximum: 100 },
    thingsToCheck: { type: "array", items: { type: "string" } },
    verdict: { type: "string", enum: ["good", "fair", "expensive"] },
  },
  required: [
    "category",
    "brand",
    "model",
    "description",
    "condition",
    "estimatedPriceMin",
    "estimatedPriceMax",
    "difference",
    "confidence",
    "thingsToCheck",
    "verdict",
  ],
};

export const studySchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    whatIsIt: { type: "string" },
    keyRule: { type: "string" },
    example: { type: "string" },
    memoryTip: { type: "string" },
    commonMistakes: { type: "array", items: { type: "string" } },
    checkQuestion: { type: "string" },
  },
  required: [
    "whatIsIt",
    "keyRule",
    "example",
    "memoryTip",
    "commonMistakes",
    "checkQuestion",
  ],
};

export const safeHelpSchema: JsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    riskLevel: { type: "string", enum: ["low", "medium", "high", "emergency"] },
    summary: { type: "string" },
    immediateActions: { type: "array", items: { type: "string" } },
    avoid: { type: "array", items: { type: "string" } },
    whenToGetHelp: { type: "string" },
    recommendedContact: { type: "string" },
    emergency: { type: "boolean" },
  },
  required: [
    "riskLevel",
    "summary",
    "immediateActions",
    "avoid",
    "whenToGetHelp",
    "recommendedContact",
    "emergency",
  ],
};