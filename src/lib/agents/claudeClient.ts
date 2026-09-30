/**
 * Cliente Unificado de IA para o Sistema Multi-Agentes.
 * Suporta prioritariamente:
 * 1. Anthropic Claude (Claude 3.5 Sonnet / Haiku / 3.7)
 * 2. Google Gemini (Gemini 2.5 Flash / 1.5 Pro / Flash)
 * 3. OpenAI (GPT-4o / GPT-4o-mini)
 */

interface ClaudeCallOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

function getAnthropicApiKey(): string | null {
  const apiKey =
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_API_KEY ||
    process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ||
    (typeof window !== 'undefined' ? (window as any).__ANTHROPIC_API_KEY__ : undefined);

  return apiKey && apiKey.trim() !== '' ? apiKey.trim() : null;
}

function getGeminiApiKey(): string | null {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    (typeof window !== 'undefined' ? (window as any).__GEMINI_API_KEY__ : undefined);

  return apiKey && apiKey.trim() !== '' ? apiKey.trim() : null;
}

function getOpenAIApiKey(): string | null {
  const apiKey =
    process.env.OPENAI_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
    (typeof window !== 'undefined' ? (window as any).__OPENAI_API_KEY__ : undefined);

  return apiKey && apiKey.trim() !== '' ? apiKey.trim() : null;
}

/**
 * Chamada à API da Anthropic Claude
 */
async function callAnthropicDirect(
  modelCandidates: string[],
  userPrompt: string,
  options: ClaudeCallOptions = {}
): Promise<string | null> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) return null;

  const {
    systemPrompt = 'Você é um arquiteto e consultor sênior de IA especializado no ecossistema automotivo.',
    temperature = 0.7,
    maxTokens = 4096,
  } = options;

  for (const model of modelCandidates) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.content?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text;
        }
      } else {
        const errBody = await response.text().catch(() => '');
        console.warn(`[Anthropic] Modelo ${model} status ${response.status}: ${errBody.slice(0, 160)}`);
      }
    } catch (err) {
      console.warn(`[Anthropic] Falha na requisição ao modelo ${model}:`, err);
    }
  }

  return null;
}

/**
 * Chamada à API do Google Gemini (Fallback transparente de alta performance)
 */
async function callGeminiDirect(
  userPrompt: string,
  options: ClaudeCallOptions = {}
): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const {
    systemPrompt = 'Você é um arquiteto e consultor sênior de IA especializado no ecossistema automotivo.',
    temperature = 0.7,
    maxTokens = 4096,
  } = options;

  const geminiModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

  for (const model of geminiModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text;
        }
      } else {
        const errBody = await response.text().catch(() => '');
        console.warn(`[Gemini] Modelo ${model} status ${response.status}: ${errBody.slice(0, 160)}`);
      }
    } catch (err) {
      console.warn(`[Gemini] Falha na requisição ao modelo ${model}:`, err);
    }
  }

  return null;
}

/**
 * Chamada à API da OpenAI (Fallback adicional)
 */
async function callOpenAIDirect(
  userPrompt: string,
  options: ClaudeCallOptions = {}
): Promise<string | null> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) return null;

  const {
    systemPrompt = 'Você é um arquiteto e consultor sênior de IA especializado no ecossistema automotivo.',
    temperature = 0.7,
    maxTokens = 4096,
  } = options;

  const openAiModels = ['gpt-4o', 'gpt-4o-mini'];

  for (const model of openAiModels) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 0) {
          return text;
        }
      }
    } catch (err) {
      console.warn(`[OpenAI] Falha na requisição ao modelo ${model}:`, err);
    }
  }

  return null;
}

/**
 * Executa chamada inteligente respeitando a hierarquia de provedores configurados
 */
export async function callClaudeApi(
  modelCandidates: string[],
  userPrompt: string,
  options: ClaudeCallOptions = {}
): Promise<string | null> {
  // 1. Tentar Anthropic Claude
  const anthropicRes = await callAnthropicDirect(modelCandidates, userPrompt, options);
  if (anthropicRes) return anthropicRes;

  // 2. Tentar Google Gemini
  const geminiRes = await callGeminiDirect(userPrompt, options);
  if (geminiRes) return geminiRes;

  // 3. Tentar OpenAI
  const openaiRes = await callOpenAIDirect(userPrompt, options);
  if (openaiRes) return openaiRes;

  return null;
}

/**
 * Agente Orquestrador: Claude Sonnet
 */
export async function callClaudeSonnet(
  userPrompt: string,
  options: ClaudeCallOptions = {}
): Promise<string | null> {
  const configured = process.env.ANTHROPIC_SONNET_MODEL;
  const models = Array.from(
    new Set([
      configured,
      'claude-sonnet-4-6',
      'claude-sonnet-4-5-20250929',
      'claude-sonnet-5',
      'claude-haiku-4-5-20251001',
      'claude-3-7-sonnet-latest',
      'claude-3-5-sonnet-20241022',
    ].filter(Boolean) as string[])
  );

  return callClaudeApi(models, userPrompt, {
    temperature: 0.3,
    maxTokens: 4096,
    ...options,
  });
}

/**
 * Agentes Especialistas: Claude Haiku
 */
export async function callClaudeHaiku(
  userPrompt: string,
  options: ClaudeCallOptions = {}
): Promise<string | null> {
  const configured = process.env.ANTHROPIC_HAIKU_MODEL;
  const models = Array.from(
    new Set([
      configured,
      'claude-haiku-4-5-20251001',
      'claude-sonnet-4-5-20250929',
      'claude-sonnet-4-6',
      'claude-3-5-haiku-20241022',
    ].filter(Boolean) as string[])
  );

  return callClaudeApi(models, userPrompt, {
    temperature: 0.5,
    maxTokens: 4096,
    ...options,
  });
}
