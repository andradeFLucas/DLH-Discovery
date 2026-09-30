/**
 * Cliente Oficial Exclusivo da Anthropic Claude para o Sistema Multi-Agentes.
 * Suporta chamadas com Claude 3.5 Sonnet (alta cognição) e Claude 3.5 Haiku (velocidade).
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

  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  return apiKey.trim();
}

/**
 * Chamada genérica aos modelos da Anthropic
 */
export async function callClaudeApi(
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
        console.warn(`[Claude API] Modelo ${model} retornou status ${response.status}: ${errBody.slice(0, 160)}`);
      }
    } catch (err) {
      console.warn(`[Claude API] Falha na requisição ao modelo ${model}:`, err);
    }
  }

  return null;
}

/**
 * Agente Orquestrador: Claude 3.5 Sonnet
 */
export async function callClaudeSonnet(
  userPrompt: string,
  options: ClaudeCallOptions = {}
): Promise<string | null> {
  const configured = process.env.ANTHROPIC_SONNET_MODEL;
  const models = Array.from(
    new Set([
      configured,
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-latest',
      'claude-3-7-sonnet-latest',
    ].filter(Boolean) as string[])
  );

  return callClaudeApi(models, userPrompt, {
    temperature: 0.4, // Mais analítico e preciso para arquitetura e orquestração
    maxTokens: 4096,
    ...options,
  });
}

/**
 * Agentes Especialistas: Claude 3.5 Haiku
 */
export async function callClaudeHaiku(
  userPrompt: string,
  options: ClaudeCallOptions = {}
): Promise<string | null> {
  const configured = process.env.ANTHROPIC_HAIKU_MODEL;
  const models = Array.from(
    new Set([
      configured,
      'claude-3-5-haiku-20241022',
      'claude-3-5-haiku-latest',
      'claude-3-haiku-20240307',
    ].filter(Boolean) as string[])
  );

  return callClaudeApi(models, userPrompt, {
    temperature: 0.6,
    maxTokens: 4096,
    ...options,
  });
}
