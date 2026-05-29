import type { CompareReport, LocalAiNarrative } from "./compare";

export type AiApi = "native" | "openai";

export interface AiOptions {
  model: string;
  url: string;
  timeoutMs: number;
  api: AiApi;
  apiKey?: string;
}

// Backward-compatible alias.
export type OllamaOptions = AiOptions;

interface AiResponse {
  response?: string;
  choices?: Array<{ message?: { content?: string } }>;
  error?: string | { message?: string };
}

const SYSTEM_PROMPT =
  "You are a precise data-migration analyst. Use only the provided JSON. Never invent facts. Be concise and concrete.";

const PROMPT_SCOPE = "Compact report summary only. Raw CSV rows are not sent.";

export async function buildLocalAiNarrative(
  report: CompareReport,
  options: AiOptions,
): Promise<LocalAiNarrative> {
  const provider = options.api === "openai" ? "openai-compatible" : "ollama";
  const endpoint = resolveEndpoint(options.url, options.api);
  const prompt = buildPrompt(report);
  const apiKey = options.apiKey ?? process.env.OLLAMA_API_KEY ?? process.env.OPENAI_API_KEY ?? "";

  try {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (apiKey !== "") {
      headers.authorization = `Bearer ${apiKey}`;
    }

    const payload = options.api === "openai"
      ? {
        model: options.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        stream: false,
        temperature: 0.1,
      }
      : {
        model: options.model,
        prompt,
        system: SYSTEM_PROMPT,
        stream: false,
        options: { temperature: 0.1 },
      };

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(options.timeoutMs),
    });

    if (!response.ok) {
      const detail = await safeReadText(response);
      const suffix = detail === "" ? "" : `: ${truncate(detail, 240)}`;
      return buildErrorNarrative(provider, options.model, `${endpoint.host} returned HTTP ${response.status}${suffix}`);
    }

    const json = await response.json() as AiResponse;
    const apiError = extractError(json);
    if (apiError !== undefined) {
      return buildErrorNarrative(provider, options.model, apiError);
    }

    const text = options.api === "openai" ? extractOpenAiText(json) : json.response;
    if (typeof text !== "string" || text.trim() === "") {
      return buildErrorNarrative(provider, options.model, "The AI endpoint returned an empty response.");
    }

    return {
      provider,
      model: options.model,
      generatedAt: new Date().toISOString(),
      promptScope: PROMPT_SCOPE,
      text: text.trim(),
    };
  } catch (error) {
    return buildErrorNarrative(provider, options.model, error instanceof Error ? error.message : String(error));
  }
}

// Accepts either a base URL (a default path is appended) or a full endpoint URL.
function resolveEndpoint(url: string, api: AiApi): URL {
  const trimmed = url.trim().replace(/\/+$/, "");
  const lower = trimmed.toLowerCase();
  const alreadyEndpoint =
    lower.endsWith("/chat/completions") ||
    lower.endsWith("/completions") ||
    lower.endsWith("/api/generate") ||
    lower.endsWith("/api/chat");
  if (alreadyEndpoint) {
    return new URL(trimmed);
  }
  const path = api === "openai" ? "/v1/chat/completions" : "/api/generate";
  return new URL(trimmed + path);
}

function extractOpenAiText(json: AiResponse): string | undefined {
  return json.choices?.[0]?.message?.content;
}

function extractError(json: AiResponse): string | undefined {
  if (typeof json.error === "string") {
    return json.error;
  }
  if (json.error !== undefined && json.error !== null && typeof json.error === "object") {
    return json.error.message ?? "Unknown error from AI endpoint.";
  }
  return undefined;
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return (await response.text()).trim();
  } catch {
    return "";
  }
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}

function buildPrompt(report: CompareReport): string {
  const compact = {
    status: report.passed ? "PASS" : "FAIL",
    sourceRows: report.sourceRows,
    targetRows: report.targetRows,
    matchedRows: report.matchedRows,
    keyField: report.keyField,
    missingInTarget: report.missingInTarget.slice(0, 20),
    extraInTarget: report.extraInTarget.slice(0, 20),
    intelligence: report.analysis.intelligence,
    dataProfile: report.analysis.analytics.dataProfile,
    issueLayers: report.analysis.analytics.issueLayers,
    groupInsights: report.analysis.analytics.groupInsights.slice(0, 15),
    nearMatches: report.analysis.analytics.nearMatches.slice(0, 10),
    columnImpact: report.analysis.analytics.columnImpact.slice(0, 12),
    inferredFields: report.analysis.inferredFields.map((field) => ({
      column: field.column,
      roles: field.roles,
      pattern: field.valuePattern,
      completeness: {
        source: field.sourceCompleteness,
        target: field.targetCompleteness,
      },
      uniqueness: {
        source: field.sourceUniqueness,
        target: field.targetUniqueness,
      },
    })),
    changedColumns: report.analysis.changedColumns,
    linkColumns: report.analysis.linkColumns,
  };

  return `You are helping interpret a CSV source-to-target verification report.
Use only the compact JSON below. Do not invent facts. Keep the explanation concise.

Write:
1. One short verdict paragraph.
2. The top 3 data risks.
3. The most useful grouped slices to investigate.
4. What the columns appear to represent.
5. Practical next checks.

Compact report JSON:
${JSON.stringify(compact, null, 2)}
`;
}

function buildErrorNarrative(provider: string, model: string, error: string): LocalAiNarrative {
  return {
    provider,
    model,
    generatedAt: new Date().toISOString(),
    promptScope: PROMPT_SCOPE,
    error,
  };
}
