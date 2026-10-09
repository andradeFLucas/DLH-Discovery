import { DiscoveryAnswers } from '../types';
import { callClaudeSonnet } from './claudeClient';

export interface MasterBlueprint {
  project_title: string;
  domain_category:
    | 'sales_crm'
    | 'workshop_service'
    | 'trade_in_valuation'
    | 'gamification_loyalty'
    | 'general_dealer_saas';
  target_personas: {
    name: string;
    role: string;
    primary_pain: string;
  }[];
  core_problem_statement: string;
  solution_concept: string;
  operational_bottleneck: {
    metric: string;
    impact: string;
  };
  recommended_theme_color: string;
  key_modules: {
    title: string;
    purpose: string;
  }[];
  key_features_for_prototype: string[];
  database_entities_needed: string[];
  business_roi_projections: {
    time_saved_per_day: string;
    estimated_revenue_increase: string;
    adoption_feasibility: string;
  };
  executive_notes: string;
}

export interface OrchestratorInput {
  title: string;
  problem: string;
  solution: string;
  area: string;
  discovery_answers: DiscoveryAnswers;
  /** Quando true, falha com erro em vez de devolver o blueprint genérico de contingência. */
  strict?: boolean;
}

/**
 * Agente 0: Orquestrador Master (Claude 3.5 Sonnet)
 * Analisa as 16 respostas do Discovery e monta o Master Blueprint estratégico
 */
export async function runOrchestratorAgent(
  input: OrchestratorInput
): Promise<MasterBlueprint> {
  const { title, problem, solution, area, discovery_answers } = input;

  const systemPrompt = `Você é o Arquiteto e Estrategista-Chefe de IA para Concessionárias de Veículos e Caminhões.
Sua missão é analisar profundamente o formulário de Discovery de uma nova ideia interna e produzir o "Master Blueprint" estratégico em formato JSON estrito.
Você compreende a fundo o dia a dia de vendas, frotistas, mecânicos, consultores técnicos, F&I e gerência geral de concessionárias.
Retorne SOMENTE o JSON válido, sem blocos markdown ou explicações externas.`;

  const userPrompt = `Analise os dados do Discovery e retorne o Master Blueprint em JSON:

DADOS BÁSICOS:
- Título Proposto: "${title}"
- Departamento: "${area}"
- Problema Central: "${problem}"
- Solução Proposta: "${solution}"

RESPOSTAS DETALHADAS DO DISCOVERY (16 PERGUNTAS):
${JSON.stringify(discovery_answers, null, 2)}

ESTRUTURA DO JSON ESPERADO:
{
  "project_title": "Título conciso e profissional para a solução",
  "domain_category": "sales_crm" | "workshop_service" | "trade_in_valuation" | "gamification_loyalty" | "general_dealer_saas",
  "target_personas": [
    { "name": "Vendedor de Caminhões", "role": "Vendas", "primary_pain": "Falta de tempo para personalizar follow-ups com notícias" }
  ],
  "core_problem_statement": "Síntese clara da dor",
  "solution_concept": "Visão técnica e operacional da solução",
  "operational_bottleneck": {
    "metric": "Ex: 185 leads sem contato semanal",
    "impact": "Ex: R$ 450.000 em negociações estagnadas"
  },
  "recommended_theme_color": "#2563eb",
  "key_modules": [
    { "title": "Painel de Leads & Notícias", "purpose": "Cruzar objeções do lead com notícias recentes de mercado" }
  ],
  "key_features_for_prototype": ["Tabela de leads", "Card de notícias dos últimos 30 dias", "Botão disparar WhatsApp com CTA personalizado", "Modal adicionar lead"],
  "database_entities_needed": ["leads", "news_articles", "followup_messages", "dealers"],
  "business_roi_projections": {
    "time_saved_per_day": "3 a 4 horas por vendedor",
    "estimated_revenue_increase": "+18% na taxa de conversão de follow-up",
    "adoption_feasibility": "Alta, integração direta com WhatsApp e DMS"
  },
  "executive_notes": "Recomendações estratégicas e visão de implementação da solução."
}`;

  const rawResponse = await callClaudeSonnet(userPrompt, { systemPrompt });

  if (rawResponse) {
    try {
      const cleanJson = rawResponse
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(cleanJson) as MasterBlueprint;
      if (parsed.project_title && parsed.domain_category) {
        return parsed;
      }
    } catch (e) {
      console.warn('[Orchestrator Agent] Erro ao fazer parse do JSON do Claude Sonnet:', e);
    }
  }

  if (input.strict) {
    throw new Error('A IA não retornou um Master Blueprint válido (timeout, chave ausente ou JSON inválido). Veja os logs do servidor.');
  }

  // Fallback Inteligente Local caso não haja chave da Anthropic configurada ou ocorra erro
  return generateLocalMasterBlueprint(input);
}

/**
 * Fallback local de alta fidelidade
 */
function generateLocalMasterBlueprint(input: OrchestratorInput): MasterBlueprint {
  const { title, problem, solution, area, discovery_answers } = input;
  const fullText = `${title} ${problem} ${solution} ${area} ${JSON.stringify(discovery_answers)}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Pontuação por domínio usando palavras inteiras/radicais (evita falsos positivos como 'os' em 'pos', 'dos').
  const countHits = (patterns: RegExp[]) => patterns.reduce((acc, re) => acc + (fullText.match(re)?.length ?? 0), 0);
  const scores: Record<string, number> = {
    sales_crm: countHits([/\blead/g, /\bvend(a|as|edor|edores)\b/g, /\bcaminh/g, /\bfollow/g, /\bcrm\b/g, /\bproposta/g]),
    workshop_service: countHits([/\boficina/g, /\brevisa/g, /\bordem de servico/g, /\bo\.?s\b/g, /\bcheck-?in/g, /\bmecanic/g, /\bpos[- ]venda/g, /\bagendamento/g]),
    trade_in_valuation: countHits([/\bseminov/g, /\bavalia/g, /\busado/g, /\btroca\b/g, /\bfipe\b/g, /\blaudo/g]),
    gamification_loyalty: countHits([/\bpontua/g, /\bpontos\b/g, /\bresgate/g, /\bclub/g, /\bfidelid/g, /\bgamifica/g]),
  };

  let domain: MasterBlueprint['domain_category'] = 'general_dealer_saas';
  let themeColor = '#6366f1';
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] > 0) {
    domain = best[0] as MasterBlueprint['domain_category'];
    themeColor = {
      sales_crm: '#2563eb',
      workshop_service: '#059669',
      trade_in_valuation: '#d97706',
      gamification_loyalty: '#7c3aed',
    }[domain as 'sales_crm' | 'workshop_service' | 'trade_in_valuation' | 'gamification_loyalty'];
  }

  return {
    project_title: title || 'DealerHub Solução Inteligente',
    domain_category: domain,
    target_personas: [
      {
        name: discovery_answers.B_usuarios || 'Consultor / Vendedor Operacional',
        role: area || 'Operação Concessionária',
        primary_pain: problem || 'Gargalo de tempo e retrabalho manual',
      },
    ],
    core_problem_statement: problem,
    solution_concept: solution,
    operational_bottleneck: {
      metric: discovery_answers.B_volume || 'Volume expressivo de processos manuais',
      impact: discovery_answers.A_perdas || 'Perda de negócios e tempo de negociação',
    },
    recommended_theme_color: themeColor,
    key_modules: [
      { title: 'Painel Operacional Principal', purpose: 'Visão unificada das demandas e alertas prioritários' },
      { title: 'Motor de Inteligência e Automação', purpose: 'Apoio em tempo real com sugestões e regras contextuais' },
      { title: 'Integração e Auditoria', purpose: 'Sincronização bidirecional com o DMS/ERP e WhatsApp' },
    ],
    key_features_for_prototype: [
      'Visualização analítica de métricas',
      'Tabela operacional com filtros e busca',
      'Ação de geração inteligente com IA',
      'Modal para inserção ou atualização rápida',
    ],
    database_entities_needed: ['registros_principais', 'historico_interacoes', 'usuarios_responsaveis'],
    business_roi_projections: {
      time_saved_per_day: '2h30 a 3h por profissional',
      estimated_revenue_increase: '+15% de produtividade comprovada',
      adoption_feasibility: 'Elevada, alinhada à rotina atual da equipe',
    },
    executive_notes: `Projeto desenhado para o departamento de ${area}. Foco direto na eliminação do gargalo: "${discovery_answers.A_perdas || problem}".`,
  };
}
