import { CommercialDeckAsset, DiscoveryAnswers, SlideItem } from '../types';
import { MasterBlueprint } from './orchestrator';
import { callClaudeHaiku } from './claudeClient';

export interface PitchAgentInput {
  blueprint: MasterBlueprint;
  discovery_answers: DiscoveryAnswers;
  area: string;
  /** Quando true, falha com erro em vez de devolver o pitch genérico de contingência. */
  strict?: boolean;
}

/**
 * Agente 3: Especialista em Pitch Comercial & Estratégia de Negócios (Claude 3.5 Haiku)
 * Constrói a apresentação de slides interativa (Pitch Deck), consolidando os dados
 * informados pelo usuário e enriquecendo com métricas de mercado, ROI e projeções financeiras.
 */
export async function runPitchAgent(
  input: PitchAgentInput
): Promise<CommercialDeckAsset> {
  const { blueprint, discovery_answers, area } = input;

  const systemPrompt = `Você é um Diretor de Novos Negócios, Estrategista de Startups e Especialista em Pitch Decks para o setor automotivo e de concessionárias.
Sua missão é transformar uma ideia e o Master Blueprint em uma apresentação de slides comercial impactante (Pitch Deck) de 5 a 6 slides.
Você DEVE:
1. Respeitar as informações que a pessoa forneceu (problema, solução, público e volume).
2. ENRIQUECER a apresentação com novas informações valiosas: estimativas realistas de mercado, cálculos de ROI (tempo e dinheiro recuperados), riscos mitigados e argumentos de convencimento para a diretoria.
Retorne SOMENTE o JSON válido contendo o array de slides, sem blocos markdown.`;

  const userPrompt = `Gere a apresentação de slides comercial (Pitch Deck) para a diretoria:

BLUEPRINT DO PROJETO:
- Título da Solução: "${blueprint.project_title}"
- Departamento: "${area}"
- Problema Central: "${blueprint.core_problem_statement}"
- Solução: "${blueprint.solution_concept}"
- Gargalo Reportado: "${blueprint.operational_bottleneck.metric} | Impacto: ${blueprint.operational_bottleneck.impact}"
- Projeção de ROI: "${blueprint.business_roi_projections.time_saved_per_day} | ${blueprint.business_roi_projections.estimated_revenue_increase}"
- Persona Atendida: "${blueprint.target_personas.map((p) => p.name).join(', ')}"
- Respostas do Discovery:
  * Perdas atuais: "${discovery_answers.A_perdas || 'Atrasos e perda de vendas'}"
  * Frequência: "${discovery_answers.A_frequencia || 'Diária'}"
  * Volume estimado: "${discovery_answers.B_volume || 'Volume expressivo'}"

ESTRUTURA DO JSON ESPERADO (6 SLIDES):
{
  "slides": [
    {
      "title": "1. O Desafio Invisível na Concessionária",
      "subtitle": "Gargalo operacional e perdas acumuladas no departamento de ${area}",
      "bullets": [
        "Apresentação clara da dor enfrentada diariamente pela equipe.",
        "Métricas concretas: volume de leads/veículos afetados.",
        "Custo da ineficiência: tempo desperdiçado em processos manuais."
      ],
      "iconType": "alert"
    },
    {
      "title": "2. A Solução: ${blueprint.project_title}",
      "subtitle": "Transformando ineficiência em velocidade com Inteligência Artificial",
      "bullets": [
        "Como a tecnologia resolve a dor na prática.",
        "Experiência do colaborador: facilidade de uso em celulares ou desktops.",
        "Eliminação definitiva do retrabalho e comunicação fragmentada."
      ],
      "iconType": "sparkles"
    },
    {
      "title": "3. Fluxo Operacional da Solução (Passo a Passo)",
      "subtitle": "Como o sistema opera no dia a dia da concessionária",
      "bullets": [
        "Etapa 1: Entrada simplificada dos dados pelo colaborador (em menos de 1 minuto).",
        "Etapa 2: A IA analisa o contexto, histórico e parâmetros de mercado em tempo real.",
        "Etapa 3: Sugestão de ação imediata ou automação com 1 clique para o operador.",
        "Etapa 4: Registro auditável e sincronização com os sistemas legados/DMS."
      ],
      "iconType": "workflow"
    },
    {
      "title": "4. Inteligência de Mercado & Valor Agregado",
      "subtitle": "Dados estratégicos que diferenciam a concessionária da concorrência",
      "bullets": [
        "Enriquecimento com informações em tempo real (notícias, fipe, histórico).",
        "Abordagem consultiva focada na dor do cliente final.",
        "Aumento na percepção de valor e fortalecimento da marca."
      ],
      "iconType": "trending"
    },
    {
      "title": "5. Impacto Financeiro & Estimativa de ROI",
      "subtitle": "Ganhos tangíveis e mensuráveis para o negócio",
      "bullets": [
        "Economia estimada: recuperação de ${blueprint.business_roi_projections.time_saved_per_day}.",
        "Ganhos de conversão: ${blueprint.business_roi_projections.estimated_revenue_increase}.",
        "Payback rápido com baixíssimo custo de infraestrutura."
      ],
      "iconType": "dollar"
    },
    {
      "title": "6. Próximos Passos & Implantação Piloto",
      "subtitle": "Cronograma ágil de validação prática",
      "bullets": [
        "Fase Piloto de 15 dias com equipe selecionada.",
        "Validação de integração com DMS/ERP existente.",
        "Escala gradual para toda a operação da rede."
      ],
      "iconType": "check"
    }
  ]
}`;

  const rawResult = await callClaudeHaiku(userPrompt, { systemPrompt, maxTokens: 3000 });

  if (rawResult) {
    try {
      const cleanJson = rawResult
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed.slides) && parsed.slides.length >= 3) {
        return { slides: parsed.slides };
      }
    } catch (e) {
      console.warn('[Pitch Agent] Erro ao fazer parse do JSON do Claude Haiku:', e);
    }
  }

  if (input.strict) {
    throw new Error('A IA não retornou uma Apresentação Comercial válida (timeout, chave ausente ou JSON inválido). Veja os logs do servidor.');
  }

  // Fallback estruturado local
  return generateLocalPitchDeck(blueprint, discovery_answers, area);
}

/**
 * Fallback local enriquecido para apresentação comercial
 */
function generateLocalPitchDeck(
  blueprint: MasterBlueprint,
  discovery_answers: DiscoveryAnswers,
  area: string
): CommercialDeckAsset {
  const title = blueprint.project_title;
  const pain = blueprint.core_problem_statement;
  const volume = discovery_answers.B_volume || 'centenas de operações mensais';

  const slides: SlideItem[] = [
    {
      title: '1. O Problema e o Gargalo Real',
      subtitle: `Diagnóstico operacional no setor de ${area}`,
      bullets: [
        `Gargalo diário identificado: "${pain}".`,
        `Volume afetado: cerca de ${volume} sob fluxo manual e descentralizado.`,
        `Perdas acumuladas: ${discovery_answers.A_perdas || 'perda de oportunidades, retrabalho e lentidão no atendimento'}.`,
        'Impacto: a equipe despende tempo excessivo em tarefas operacionais em vez de focar na estratégia e no cliente.',
      ],
      iconType: 'alert',
    },
    {
      title: `2. A Solução: ${title}`,
      subtitle: 'Automação inteligente e suporte proativo em tempo real',
      bullets: [
        `Conceito: ${blueprint.solution_concept}.`,
        `Interface intuitiva desenhada especificamente para ${blueprint.target_personas[0]?.name || 'a equipe'}.`,
        'Informação centralizada: eliminação de mensagens dispersas e planilhas paralelas.',
        'Atuação da IA como assistente sênior apoiando cada colaborador em tempo real.',
      ],
      iconType: 'sparkles',
    },
    {
      title: '3. Fluxo Operacional da Solução',
      subtitle: 'Como a esteira funciona no dia a dia da concessionária',
      bullets: [
        '1. Captura de Demanda: O colaborador acessa a plataforma em celular ou computador e seleciona o registro.',
        '2. Processamento por IA: O motor cruza dados em tempo real (notícias, objeções, tabelas, histórico).',
        '3. Ação Pronta em 1 Clique: Geração automática da mensagem, orçamento ou laudo com CTA persuasivo.',
        '4. Conclusão & Auditoria: Disparo direto via WhatsApp/DMS com gravação do histórico para a gerência.',
      ],
      iconType: 'workflow',
    },
    {
      title: '4. Inteligência de Mercado & Diferencial Competitivo',
      subtitle: 'Transformando dados brutos em relacionamento de alto valor',
      bullets: [
        'Enriquecimento contextual automático com base no momento do cliente.',
        'Abordagem consultiva com argumentos sólidos, rompendo objeções de preço ou atraso.',
        'Padronização da qualidade de atendimento: todo o time atua no nível dos melhores especialistas.',
        'Rastreabilidade total das interações com conformidade à LGPD.',
      ],
      iconType: 'trending',
    },
    {
      title: '5. Impacto Financeiro e Retorno sobre o Investimento (ROI)',
      subtitle: 'Resultados mensuráveis projetados para a concessionária',
      bullets: [
        `Tempo recuperado: economia de ${blueprint.business_roi_projections.time_saved_per_day}.`,
        `Ganho de receita: ${blueprint.business_roi_projections.estimated_revenue_increase}.`,
        'Aproveitamento de carteira: ativação de oportunidades que antes ficavam esquecidas por falta de tempo.',
        'Custo operacional marginal com altíssima taxa de adoção interna.',
      ],
      iconType: 'dollar',
    },
    {
      title: '6. Plano de Lançamento & Próximos Passos',
      subtitle: 'Validação rápida com foco em resultados imediatos',
      bullets: [
        'Semana 1: Homologação do protótipo com 3 operadores-chave da equipe.',
        'Semanas 2 e 3: Coleta de feedbacks práticos e calibração de regras automáticas.',
        'Semana 4: Rollout oficial departamental com painel de métricas ativado.',
        `Viabilidade de adoção: ${blueprint.business_roi_projections.adoption_feasibility}.`,
      ],
      iconType: 'check',
    },
  ];

  return { slides };
}
