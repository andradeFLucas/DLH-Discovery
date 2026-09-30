import { DiscoveryAnswers, PrototypeAsset } from '../types';
import { MasterBlueprint } from './orchestrator';
import { callClaudeHaiku } from './claudeClient';
import { buildDomainAwarePrototypeHtml } from '../prototypeBuilder';

export interface PrototypeAgentInput {
  blueprint: MasterBlueprint;
  discovery_answers: DiscoveryAnswers;
  area: string;
}

/**
 * Agente 1: Especialista em Protótipos UI/UX (Claude 3.5 Haiku)
 * Constrói aplicações autônomas, interativas e de alto impacto visual em HTML/CSS/JS.
 */
export async function runPrototypeAgent(
  input: PrototypeAgentInput
): Promise<PrototypeAsset> {
  const { blueprint, discovery_answers, area } = input;

  const isMobilePreferred =
    (discovery_answers.B_dispositivos || '').toLowerCase().includes('celular') ||
    (discovery_answers.B_dispositivos || '').toLowerCase().includes('tablet');

  const systemPrompt = `Você é um Engenheiro Frontend Sênior e Especialista em UI/UX para Concessionárias de Veículos.
Sua especialidade é criar protótipos funcionais completos em tela única utilizando HTML5 moderno, CSS puro elegante (com Dark Mode nativo, cores harmoniosas e micro-interações) e JavaScript puro funcional.
O protótipo precisa ser 100% autônomo (sem scripts externos bloqueantes como tailwindcdn ou react).
Retorne APENAS o código HTML completo começando em <!DOCTYPE html> e terminando em </html>. Não inclua blocos markdown como \`\`\`html.`;

  const userPrompt = `Crie o protótipo interativo completo para a solução a seguir:

DIRETRIZES DO BLUEPRINT:
- Título do Projeto: "${blueprint.project_title}"
- Categoria de Domínio: "${blueprint.domain_category}"
- Cor Temática Recomendada: "${blueprint.recommended_theme_color}"
- Usuários / Persona: "${blueprint.target_personas.map((p) => `${p.name} (${p.role})`).join(', ')}"
- Problema Central: "${blueprint.core_problem_statement}"
- Solução: "${blueprint.solution_concept}"
- Gargalo Operacional: "${blueprint.operational_bottleneck.metric} - ${blueprint.operational_bottleneck.impact}"
- Módulos Principais: ${blueprint.key_modules.map((m) => m.title).join(', ')}
- Funcionalidades Obrigatórias: ${blueprint.key_features_for_prototype.join(', ')}
- Dispositivos Prioritários: ${isMobilePreferred ? 'Celular / Tablet (Mobile First)' : 'Computador / Desktop'}

REQUISITOS DA INTERFACE:
1. Header elegante com nome do sistema ("${blueprint.project_title}"), status operacional e botão de ação primária.
2. Banner contextual explicativo da dor e ganho de tempo.
3. Cards de métricas operacionais com números reais do gargalo.
4. Tabela/Grid de registros rica com dados realistas de concessionária (nomes de clientes, placas ou veículos, status e ações).
5. Botões de ação funcionais com JavaScript (ex: disparar ação com IA, abrir modal funcional, filtrar tabela).
6. Modal funcional para adicionar ou interagir com registros.
7. Código CSS responsivo embutido no <style> e JavaScript no <script>.`;

  const rawHtml = await callClaudeHaiku(userPrompt, { systemPrompt, maxTokens: 4096 });

  let finalHtml = '';
  if (rawHtml && rawHtml.includes('<html') && rawHtml.includes('</html>')) {
    // Limpeza de marcações markdown
    finalHtml = rawHtml
      .replace(/^```html/im, '')
      .replace(/^```/im, '')
      .replace(/```$/im, '')
      .trim();
  }

  // Se o Claude não tiver retornado um HTML completo válido ou estiver sem chave, usa o gerador local especializado
  if (!finalHtml || finalHtml.length < 500) {
    finalHtml = buildDomainAwarePrototypeHtml({
      title: blueprint.project_title,
      problem: blueprint.core_problem_statement,
      solution: blueprint.solution_concept,
      area: area,
      discovery_answers: discovery_answers,
    });
  }

  return {
    themeColor: blueprint.recommended_theme_color,
    styleMode: isMobilePreferred ? 'mobile' : 'desktop',
    html_content: finalHtml,
    generatedNotes: `[Protótipo Especialista Claude 3.5 Haiku]\nDesenvolvido com foco no perfil: "${blueprint.target_personas[0]?.name || 'Operacional'}" e no gargalo: "${blueprint.operational_bottleneck.metric}".`,
  };
}
