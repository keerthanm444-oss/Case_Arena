/**
 * AI provider — uniform wrapper over three free-tier APIs.
 *
 * All three use OpenAI-compatible /v1/chat/completions endpoints, which
 * means a single `chat()` function with provider-specific base URLs +
 * default models. Calls happen directly from the client (no proxy);
 * the user supplies their own key.
 *
 * SECURITY: this code never sends keys to any first-party server. Keys
 * live in localStorage via the preferences store and travel only to
 * the provider's API endpoint over HTTPS.
 */

export type AIProvider = 'groq' | 'google' | 'openrouter';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ProviderConfig {
  baseUrl: string;
  defaultModel: string;
  /** Field name to send the model — OpenAI uses `model` (all three are compatible) */
  preferredHeader?: Record<string, string>;
}

const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.1-70b-versatile',
  },
  google: {
    // Google AI Studio supports OpenAI-compatible endpoints via Gemini
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-1.5-flash-latest',
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    preferredHeader: {
      'HTTP-Referer': 'https://case-arena',
      'X-Title': 'Case Arena',
    },
  },
};

export interface ChatRequest {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  messages: ChatMessage[];
  /** Temperature, default 0.4 (focused, low variance) */
  temperature?: number;
}

export interface ChatResponse {
  text: string;
  /** Whether the response was truncated by length */
  truncated: boolean;
}

export class AIProviderError extends Error {
  constructor(public status: number, public providerMessage: string) {
    super(`AI provider error ${status}: ${providerMessage}`);
  }
}

/** Send a chat completion to the configured provider. Pure client-side. */
export async function chat(req: ChatRequest): Promise<ChatResponse> {
  const cfg = PROVIDERS[req.provider];
  const model = req.model || cfg.defaultModel;
  const body = {
    model,
    messages: req.messages,
    temperature: req.temperature ?? 0.4,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${req.apiKey}`,
    ...(cfg.preferredHeader ?? {}),
  };

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '<no body>');
    throw new AIProviderError(res.status, text);
  }

  const data = (await res.json()) as {
    choices?: Array<{
      message?: { content?: string };
      finish_reason?: string;
    }>;
  };
  const choice = data.choices?.[0];
  return {
    text: choice?.message?.content ?? '',
    truncated: choice?.finish_reason === 'length',
  };
}
