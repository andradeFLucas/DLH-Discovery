import { DiscoveryAnswers, PrototypeAsset } from '../types';
import { MasterBlueprint } from './orchestrator';
import { callClaudeHaiku } from './claudeClient';
import { buildDomainAwarePrototypeHtml } from '../prototypeBuilder';

export interface PrototypeAgentInput {
  blueprint: MasterBlueprint;
  discovery_answers: DiscoveryAnswers;
  area: string;
  /** Quando true, falha com erro em vez de devolver o protótipo genérico de contingência. */
  strict?: boolean;
}

/**
 * Agente 1: Especialista em Protótipos UI/UX (UI-UX Pro Max)
 * Constrói aplicações autônomas, interativas e de alto impacto visual em HTML/CSS/JS.
 */
export async function runPrototypeAgent(
  input: PrototypeAgentInput
): Promise<PrototypeAsset> {
  const { blueprint, discovery_answers, area } = input;

  const isMobilePreferred =
    (discovery_answers.B_dispositivos || '').toLowerCase().includes('celular') ||
    (discovery_answers.B_dispositivos || '').toLowerCase().includes('tablet');

  const systemPrompt = `Você é um Arquiteto Frontend e Designer UI/UX Sênior especialista no framework UI-UX Pro Max (uupm.cc).
Sua missão é criar uma aplicação web SaaS completa, autônoma e 100% INTERATIVA em tela única (HTML5, Tailwind CSS via CDN e JavaScript puro).

REGRAS DE ARQUITETURA INTERATIVA (OBRIGATÓRIO):
1. NAVEGAÇÃO MULTI-ABAS FUNCIONAL:
   - A barra lateral (sidebar) deve ter no mínimo 3 itens de menu/módulos específicos do projeto.
   - CADA item de menu DEVE ter seu respectivo contêiner de visão com classe "tab-pane" (ex: <div id="tab-modulo1" class="tab-pane active">, <div id="tab-modulo2" class="tab-pane hidden">, etc.).
   - TODAS as abas devem ter conteúdo rico, visualmente completo e estilizado (não deixe abas vazias ou com apenas um título!).
   - Ao clicar em qualquer item da sidebar, o JavaScript DEVE alternar a aba ativa (remover 'hidden' e adicionar 'active' no conteúdo e atualizar o estado visual do botão na sidebar).

2. DIRETRIZES DO FRAMEWORK UI-UX PRO MAX:
   - Estética Dark-First Moderna: Fundo principal (#090d16 ou #0e131f), cards com elevação e profundidade (#141a29 ou #182234), bordas translúcidas elegantes (border-slate-800 ou border-white/10).
   - Paleta 60-30-10: 60% neutros escuros sofisticados, 30% estrutura/cards, 10% cor de destaque temática (${blueprint.recommended_theme_color || '#3b82f6'}).
   - Tipografia: Inter / Plus Jakarta Sans para UI e JetBrains Mono / Plex Mono para métricas, valores monetários, placas e status.
   - Microinterações e Modais:
     * Botão de ação principal no topo abre um modal funcional com formulário de cadastro/operação.
     * Notificação Toast flutuante acionada por botões de ação ("Salvar", "Aprovar", "Disparar IA").
     * Filtros de busca ou status na tabela/grid funcionando com JavaScript.

3. DADOS REALISTAS DO DOMÍNIO ("${blueprint.domain_category}"):
   - Para Avaliação/Seminovos: Abas como "1. Avaliações na Troca", "2. Laudos com Fotos & Avarias IA", "3. Histórico de Leilão & Precificação FIPE". Mostre placas reais (BRA-4G21, RIO-2A19), fotos simuladas com badges de avaria e scores de IA.
   - Para Oficina/Pós-Venda: Abas como "1. Recepção & Check-in", "2. Elevadores & Diagnóstico IA", "3. Orçamentos WhatsApp".
   - Para Comercial/Vendas: Abas como "1. Leads & Follow-up", "2. Notícias Casadas", "3. Mensagens Prontas".

Retorne APENAS o código HTML completo iniciando estritamente com <!DOCTYPE html> e terminando com </html>. Não inclua blocos de markdown em volta.`;

  const userPrompt = `Gere a aplicação SaaS completa, autônoma e interativa para:

PROJETO: "${blueprint.project_title}"
ÁREA: "${area}"
CATEGORIA: "${blueprint.domain_category}"
COR DE DESTAQUE: "${blueprint.recommended_theme_color}"
PERSONAS: ${blueprint.target_personas.map((p) => `${p.name} (${p.role}) - Dor: ${p.primary_pain}`).join('; ')}
PROBLEMA: "${blueprint.core_problem_statement}"
SOLUÇÃO: "${blueprint.solution_concept}"
GARGALO: "${blueprint.operational_bottleneck.metric} — ${blueprint.operational_bottleneck.impact}"
MÓDULOS EXIGIDOS: ${blueprint.key_modules.map((m) => `${m.title}: ${m.purpose}`).join(' | ')}
LAYOUT: ${isMobilePreferred ? 'Mobile First (Responsivo para Tablet/Smartphone)' : 'Desktop Dashboard Profissional'}

ESTRUTURA DO CÓDIGO HTML/JS:
1. <head> com <script src="https://cdn.tailwindcss.com"></script> e fontes do Google Fonts.
2. Sidebar lateral com 3 botões de módulo (com data-tab="tab1", data-tab="tab2", data-tab="tab3" e onclick="showTab('tab1')").
3. Área principal com 3 seções completas (<div id="tab1" class="tab-pane">, <div id="tab2" class="tab-pane hidden">, <div id="tab3" class="tab-pane hidden">).
4. Modal funcional (<div id="action-modal" class="fixed inset-0 hidden ...">) com botão de fechar funcional.
5. Toast de notificação (<div id="toast" class="fixed bottom-5 right-5 hidden ...">).
6. <script> no final com as funções globais: showTab(tabId), openModal(), closeModal(), showToast(msg), filterTable().`;

  const rawHtml = await callClaudeHaiku(userPrompt, { systemPrompt, maxTokens: 6000 });

  let finalHtml = '';
  if (rawHtml && rawHtml.includes('<html') && rawHtml.includes('</html>')) {
    finalHtml = rawHtml
      .replace(/^```html\s*/im, '')
      .replace(/^```\s*/im, '')
      .replace(/\s*```$/im, '')
      .trim();
  } else {
    console.warn(`[PrototypeAgent] HTML da IA ausente ou truncado (tamanho: ${rawHtml?.length ?? 0}).`);
  }

  if ((!finalHtml || finalHtml.length < 500) && input.strict) {
    throw new Error('A IA não retornou um protótipo HTML válido (timeout, chave ausente ou HTML truncado). Veja os logs do servidor.');
  }

  // Fallback caso a API não responda
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
    generatedNotes: `[Protótipo UI-UX Pro Max Multi-Abas]\nDesenvolvido dinamicamente para: "${blueprint.project_title}" (${area}). Módulos e abas 100% navegáveis.`,
  };
}
