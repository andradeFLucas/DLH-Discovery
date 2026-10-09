import {
  DiscoveryAnswers,
  TechnicalDocAsset,
  PersonaItem,
  SystemMacroModule,
  DetailedUserStory,
  DatabaseTableSpec,
  ApiEndpointSpec,
  ApiContractSpec,
  RlsPolicySpec,
  EnvVarSpec,
  ErrorStateSpec,
  RoadmapPhase,
  EffortEstimation,
  RaciItem,
  SuccessMetricOkr,
} from '../types';
import { MasterBlueprint } from './orchestrator';
import { callClaudeHaiku } from './claudeClient';

export interface TechnicalDocAgentInput {
  blueprint: MasterBlueprint;
  discovery_answers: DiscoveryAnswers;
  area: string;
  /** Quando true, falha com erro em vez de devolver o PRD genérico de contingência. */
  strict?: boolean;
}

function parseJsonLoose(raw: string | null): any | null {
  if (!raw) return null;
  const clean = raw
    .replace(/^```json\s*/im, '')
    .replace(/^```\s*/im, '')
    .replace(/\s*```$/im, '')
    .trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    console.warn('[TechnicalDocAgent] JSON inválido/truncado:', (err as Error).message, '| fim:', clean.slice(-80));
    return null;
  }
}

/**
 * Agente 2: Arquiteto de Software e PRD de Engenharia Enterprise (Claude 3.5 Haiku)
 * Produz documentação técnica de alta densidade com Diagrama Mermaid, RACI, OKRs, Gherkin e Schema Relacional.
 */
export async function runTechnicalDocAgent(
  input: TechnicalDocAgentInput
): Promise<TechnicalDocAsset> {
  const { blueprint, discovery_answers, area } = input;

  const systemPrompt = `Você é o Arquiteto de Software Líder e Principal Product Manager de ecossistemas automotivos.
Sua missão é produzir uma Especificação Técnica e Funcional de Engenharia (PRD 1.0) de altíssimo nível para o projeto "${blueprint.project_title}".

DIRETRIZES DE QUALIDADE ENTERPRISE:
1. SUB-FUNCIONALIDADES HIPER-ESPECÍFICAS: Para CADA módulo do sistema, gere 3 a 4 sub-funcionalidades REAIS e EXCLUSIVAS do setor automotivo e do domínio (NUNCA repita textos genéricos como "Validação de campos").
2. HISTÓRIAS DE USUÁRIO COM GHERKIN: Cada história deve conter 3 a 4 critérios de aceite no formato Gherkin ("Dado que...", "Quando...", "Então...").
3. DIAGRAMA ARQUITETURAL MERMAID: Crie um flowchart TD ou LR detalhado em sintaxe Mermaid válida, demonstrando App Mobile/Web -> API Gateway / Backend -> Microserviço IA / Visão / LLM -> APIs Externas (FIPE, Leilão, Detran, DMS) -> Banco PostgreSQL -> Notificações.
4. MATRIZ RACI ESTRUTURADA: Mapeie 4 a 5 atividades críticas de implantação e operação com R (Responsible), A (Accountable), C (Consulted) e I (Informed) para os papéis reais da concessionária.
5. OKRS E MÉTRICAS DE SUCESSO: Defina 3 a 4 OKRs com Key Results numéricos e ROI estimado.
6. SCHEMA RELACIONAL SQL: Defina tabelas com colunas reais de negócio (placa, chassi, km, valores, scores de IA, status).

Retorne SOMENTE um JSON estrito e válido.`;

  const userPrompt = `Gere o PRD Técnico Enterprise completo em JSON para a seguinte solução:

PROJETO: "${blueprint.project_title}"
ÁREA: "${area}"
CATEGORIA DE DOMÍNIO: "${blueprint.domain_category}"
PERSONAS: ${blueprint.target_personas.map((p) => `${p.name} (${p.role}) - ${p.primary_pain}`).join('; ')}
PROBLEMA CENTRAL: "${blueprint.core_problem_statement}"
SOLUÇÃO: "${blueprint.solution_concept}"
GARGALO OPERACIONAL: "${blueprint.operational_bottleneck.metric} - ${blueprint.operational_bottleneck.impact}"
MÓDULOS OBRIGATÓRIOS: ${blueprint.key_modules.map((m) => `${m.title}: ${m.purpose}`).join(' | ')}
INTEGRAÇÕES E FONTES: "${discovery_answers.C_fontes || 'DMS Linx/Apollo/Totvs, Tabela FIPE, APIs Veiculares'}"
SEGURANÇA E DADOS: "${discovery_answers.E_dados_sensiveis || 'LGPD, dados de veículos e clientes'}"

ESTRUTURA JSON EXIGIDA:
{
  "executive_summary": "Resumo executivo completo e quantificado",
  "product_objectives": ["Objetivo 1", "Objetivo 2", "Objetivo 3", "Objetivo 4"],
  "architecture_overview": "Visão geral de arquitetura",
  "architecture_diagram_mermaid": "graph TD\\n  A[Consultor Mobile] -->|1. Captura| B[Next.js API Gateway]...",
  "raci_matrix": [
    { "activity": "Captura e Registro Inicial", "responsible": "Consultor de Vendas", "accountable": "Gerente Comercial", "consulted": "Cliente", "informed": "Avaliador Chefe" }
  ],
  "success_metrics_okrs": [
    { "objective": "Objetivo de Negócio", "key_results": ["KR 1", "KR 2"], "target_timeline": "60 dias", "target_roi": "R$ X/mês" }
  ],
  "macro_modules": [
    {
      "module_number": 1,
      "title": "Nome do Módulo",
      "objective": "Objetivo do Módulo",
      "sub_features": [
        { "name": "Sub-funcionalidade Real 1", "description": "Descrição técnica detalhada", "input_or_extraction": "Dados manipulados" }
      ],
      "business_rules": ["Regra 1", "Regra 2"]
    }
  ],
  "user_stories": [
    {
      "id": "US-01",
      "title": "Título da História",
      "actor": "Ator",
      "description": "Como [ator], quero [ação] para [benefício]",
      "acceptance_criteria_gherkin": [
        "Dado que o operador está autenticado...",
        "Quando submeter os dados...",
        "Então o sistema deve..."
      ]
    }
  ],
  "custom_database_columns": [
    { "field": "nome_campo", "type": "TIPO_SQL", "description": "Finalidade" }
  ],
  "custom_api_endpoints": [
    { "method": "POST", "path": "/api/v1/...", "description": "Finalidade", "payload": "{ ... }", "response": "{ ... }" }
  ]
}`;

  const partAPrompt = `${userPrompt}

IMPORTANTE (PARTE 1 de 2): retorne SOMENTE as chaves executive_summary, product_objectives, architecture_overview, architecture_diagram_mermaid, raci_matrix e success_metrics_okrs. NÃO inclua as demais chaves.`;
  const partBPrompt = `${userPrompt}

IMPORTANTE (PARTE 2 de 2): retorne SOMENTE as chaves macro_modules (máximo 4 módulos, 3 sub-funcionalidades cada), user_stories (máximo 5), custom_database_columns e custom_api_endpoints (máximo 5). NÃO inclua as demais chaves. Seja objetivo para não exceder o limite de tamanho.`;

  try {
    const [rawA, rawB] = await Promise.all([
      callClaudeHaiku(partAPrompt, { systemPrompt, maxTokens: 3000 }),
      callClaudeHaiku(partBPrompt, { systemPrompt, maxTokens: 4096 }),
    ]);

    const partA = parseJsonLoose(rawA);
    const partB = parseJsonLoose(rawB);

    if (partA && partB && Array.isArray(partB.macro_modules) && partB.macro_modules.length > 0) {
      return buildCanonicalPRDFromAI(blueprint, discovery_answers, area, { ...partA, ...partB });
    }
    console.warn(`[TechnicalDocAgent] Resposta incompleta da IA (parte A: ${!!partA}, parte B: ${!!partB}).`);
  } catch (err) {
    console.warn('[TechnicalDocAgent] Falha ao chamar a IA:', err);
  }

  if (input.strict) {
    throw new Error('A IA não retornou uma Documentação Técnica válida (timeout, chave ausente ou JSON truncado). Veja os logs do servidor.');
  }

  // Fallback Canônico de Alta Densidade
  return buildHighFidelityPRD(blueprint, discovery_answers, area);
}

/**
 * Constrói o PRD completo incorporando as partes ricas geradas pela IA
 */
function buildCanonicalPRDFromAI(
  blueprint: MasterBlueprint,
  discovery_answers: DiscoveryAnswers,
  area: string,
  aiData: any
): TechnicalDocAsset {
  const normTitle = blueprint.project_title;
  const domain = blueprint.domain_category;
  const tableName = `tb_${area.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${domain}`;

  const defaultColumns = aiData.custom_database_columns || [
    { field: 'id', type: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Identificador único do registro' },
    { field: 'tenant_id', type: 'VARCHAR(50) NOT NULL', description: 'Identificador da concessionária/loja' },
    { field: 'operator_id', type: 'UUID NOT NULL', description: 'Usuário responsável pela operação' },
    { field: 'placa_ou_ref', type: 'VARCHAR(50) NOT NULL', description: 'Identificador principal (placa, chassi ou lead)' },
    { field: 'dados_operacionais', type: 'JSONB DEFAULT \'{}\'', description: 'Payload enriquecido com dados do domínio' },
    { field: 'score_ou_resultado_ia', type: 'NUMERIC(10,2)', description: 'Métrica, score ou valor monetário calculado pela IA' },
    { field: 'status_aprovacao', type: 'VARCHAR(30) DEFAULT \'pendente\'', description: 'Status no fluxo de aprovação' },
    { field: 'created_at', type: 'TIMESTAMPTZ DEFAULT NOW()', description: 'Data de criação' },
    { field: 'updated_at', type: 'TIMESTAMPTZ DEFAULT NOW()', description: 'Data da última alteração' },
  ];

  const defaultEndpoints: ApiEndpointSpec[] = aiData.custom_api_endpoints || [
    {
      method: 'POST',
      path: `/api/v1/${domain}/scan-or-input`,
      description: 'Captura inicial e validação dos dados de entrada',
      payload: '{\n  "tenant_id": "string",\n  "identificador": "string",\n  "fotos_urls": ["string"]\n}',
      response: '{\n  "status": "sucesso",\n  "record_id": "uuid",\n  "pre_validacao": true\n}',
    },
    {
      method: 'POST',
      path: `/api/v1/${domain}/process-ai`,
      description: 'Processamento analítico do motor de IA e cruzamento com bases de dados',
      payload: '{\n  "record_id": "uuid",\n  "parametros_contextuais": {}\n}',
      response: '{\n  "score_ia": 9.4,\n  "recomendacao": "string",\n  "faixa_valores": { "min": 0, "max": 0 }\n}',
    },
    {
      method: 'PATCH',
      path: `/api/v1/${domain}/:id/approve`,
      description: 'Validação e aprovação da proposta pelo gestor',
      payload: '{\n  "status": "aprovado",\n  "justificativa": "string"\n}',
      response: '{\n  "atualizado": true,\n  "notificacao_enviada": true\n}',
    },
  ];

  const data_model_sql = `-- Schema DDL Oficial para PostgreSQL / Supabase
CREATE TABLE IF NOT EXISTS ${tableName} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL,
    operator_id UUID NOT NULL,
    placa_ou_ref VARCHAR(50) NOT NULL,
    dados_operacionais JSONB DEFAULT '{}',
    score_ou_resultado_ia NUMERIC(10,2),
    status_aprovacao VARCHAR(30) DEFAULT 'pendente',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_${tableName}_tenant ON ${tableName}(tenant_id);
CREATE INDEX IF NOT EXISTS idx_${tableName}_status ON ${tableName}(status_aprovacao);

-- Trilha de Auditoria LGPD
CREATE TABLE IF NOT EXISTS ${tableName}_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    record_id UUID NOT NULL REFERENCES ${tableName}(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  return {
    document_version: '1.0.0-PROD',
    executive_summary: aiData.executive_summary || `Este documento formaliza a Especificação Técnica e Funcional de Engenharia (PRD 1.0) para "${normTitle}" (${area}).`,
    product_objectives: aiData.product_objectives || [
      `Eliminar o gargalo: "${blueprint.operational_bottleneck.metric}".`,
      `Acelerar a produtividade diária em: ${blueprint.business_roi_projections.time_saved_per_day}.`,
      `Garantir compliance e rastreabilidade total com trilha de auditoria LGPD.`,
      `Integrar com o DMS corporativo (${discovery_answers.C_fontes || 'Linx, Apollo, NBS, Totvs'}).`,
    ],
    architecture_overview: aiData.architecture_overview || 'Arquitetura moderna baseada em Next.js App Router, Supabase PostgreSQL com RLS e orquestração de IA via Anthropic Claude.',
    architecture_diagram_mermaid: aiData.architecture_diagram_mermaid || generateDomainMermaidDiagram(blueprint),
    raci_matrix: aiData.raci_matrix || generateDomainRaciMatrix(blueprint, area),
    success_metrics_okrs: aiData.success_metrics_okrs || generateDomainOkrs(blueprint),
    personas: blueprint.target_personas.map((p) => ({
      persona: p.name,
      role: p.role,
      needs: p.primary_pain,
    })),
    journey_steps: [
      '1. Captura ágil das informações na interface móvel ou desktop',
      '2. Enriquecimento automatizado por IA e cruzamento com bases de dados',
      '3. Validação e ajuste em tempo real pelo gestor da área',
      '4. Disparo da ação de valor e registro auditado no DMS da concessionária',
    ],
    macro_modules: aiData.macro_modules,
    user_stories: aiData.user_stories,
    tech_stack: {
      frontend: 'Next.js 16 (App Router) + React 19 + Tailwind CSS',
      backend: 'Next.js Server Actions & Edge Route Handlers',
      database: 'PostgreSQL 16 (Supabase) com Row Level Security (RLS)',
      auth: 'Supabase Auth (RBAC multi-tenant)',
      hosting: 'Vercel Enterprise Edge Network',
    },
    architecture_justification: {
      nextjs: ['Renderização híbrida de altíssimo desempenho', 'Rotas de API nativas com zero complexidade de infraestrutura'],
      supabase: ['PostgreSQL robusto com Row Level Security por concessionária', 'Trilhas de auditoria e webhooks em tempo real'],
      vercel: ['Deploy contínuo e escalabilidade global com baixa latência'],
      components: ['Design system modular e acessível em qualquer dispositivo'],
    },
    database_tables: [
      {
        table_name: tableName,
        description: `Armazena as entidades operacionais da solução ${normTitle}.`,
        columns: defaultColumns,
      },
      {
        table_name: `${tableName}_audit_logs`,
        description: 'Trilha de auditoria para fins de compliance LGPD e histórico de operações.',
        columns: [
          { field: 'id', type: 'BIGSERIAL PRIMARY KEY', description: 'Identificador do evento' },
          { field: 'record_id', type: 'UUID NOT NULL', description: 'Referência ao registro principal' },
          { field: 'actor_id', type: 'UUID NOT NULL', description: 'Identificador de quem realizou a ação' },
          { field: 'action_type', type: 'VARCHAR(50) NOT NULL', description: 'Ex: CRIACAO, ATUALIZACAO, DISPARO_IA' },
          { field: 'metadata', type: 'JSONB DEFAULT \'{}\'', description: 'Dados do evento' },
          { field: 'created_at', type: 'TIMESTAMPTZ DEFAULT NOW()', description: 'Horário do log' },
        ],
      },
    ],
    data_model_sql,
    api_endpoints: defaultEndpoints,
    ai_contracts: [
      {
        name: 'Contrato de Geração e Enriquecimento IA',
        endpoint: `/api/ai/${domain}/process`,
        method: 'POST',
        description: 'Dispara a IA para enriquecer o registro com sugestões, laudos ou mensagens personalizadas.',
        input_payload: '{\n  "record_id": "uuid",\n  "context_text": "...",\n  "lead_or_client_info": { ... }\n}',
        output_payload: '{\n  "suggested_action": "...",\n  "generated_content": "...",\n  "confidence_score": 0.96\n}',
      },
    ],
    rls_policies: [
      {
        table: tableName,
        rules: [
          'ENABLE ROW LEVEL SECURITY;',
          'CREATE POLICY tenant_isolation_policy ON ' + tableName + ' FOR ALL USING (tenant_id = current_setting(\'app.current_tenant\', true));',
          'CREATE POLICY operator_access_policy ON ' + tableName + ' FOR SELECT USING (auth.uid() IS NOT NULL);',
        ],
      },
    ],
    env_vars: [
      { variable: 'NEXT_PUBLIC_SUPABASE_URL', purpose: 'URL base da instância Supabase', scope: 'Client & Server' },
      { variable: 'SUPABASE_SERVICE_ROLE_KEY', purpose: 'Chave administrativa com bypass de RLS para workers', scope: 'Server-Only' },
      { variable: 'ANTHROPIC_API_KEY', purpose: 'Chave de integração com Claude 3.5 Sonnet/Haiku', scope: 'Server-Only' },
    ],
    error_states: [
      {
        scenario: 'Falha de Conectividade com o DMS / ERP',
        system_behavior: 'Armazena requisição em fila local (Outbox Pattern) com retry exponencial.',
        user_action: 'Exibe indicador visual discreto de "Sincronização em fila". Operação não é interrompida.',
      },
      {
        scenario: 'Instabilidade na API de IA',
        system_behavior: 'Aciona imediatamente o motor local de contingência sem travar a tela.',
        user_action: 'Exibe mensagem amigável e permite a edição manual dos dados sem retornar erro 500.',
      },
    ],
    functional_requirements: [
      'Captura e higienização automática de dados em menos de 2 segundos.',
      'Validação de regras de negócio em tempo real.',
      'Exportação e sincronização com sistemas legados da concessionária.',
    ],
    non_functional_requirements: [
      'Tempo de resposta de APIs abaixo de 500ms (p95).',
      'Disponibilidade mínima de 99.9% (SLA Enterprise).',
      'Suporte a 100% dos navegadores modernos (Chrome, Safari, Edge) em mobile e desktop.',
    ],
    integrations: [
      { name: 'DMS Concessionária', type: 'REST / SOAP', purpose: 'Sincronização bidirecional de ordens e clientes' },
      { name: 'Motor de IA (Claude)', type: 'REST API', purpose: 'Enriquecimento, OCR e precificação instantânea' },
    ],
    security_requirements: ['Autenticação JWT com renovação automática', 'Criptografia em trânsito (TLS 1.3) e em repouso (AES-256)'],
    roadmap_phases: [
      {
        phase_number: 1,
        title: 'MVP Funcional & Validação Operacional',
        duration: 'Semanas 1 a 3',
        deliverables: ['Interface web e mobile responsiva', 'CRUD essencial com validações', 'Disparo de IA'],
      },
      {
        phase_number: 2,
        title: 'Integrações DMS & Trilha de Auditoria',
        duration: 'Semanas 4 a 6',
        deliverables: ['Conexão bidirecional com DMS', 'Trilha completa de auditoria LGPD', 'Dashboards'],
      },
      {
        phase_number: 3,
        title: 'Escala & Rollout na Rede de Concessionárias',
        duration: 'Semanas 7 a 8',
        deliverables: ['Treinamento das equipes', 'Monitoramento de SLA', 'Ajuste fino de prompts da IA'],
      },
    ],
    next_steps: [
      'Configurar schema PostgreSQL no Supabase.',
      'Realizar teste de carga no endpoint de geração com Claude.',
      'Apresentar protótipo para a equipe operacional piloto.',
    ],
  };
}

/**
 * Fallback de Alta Densidade Específico por Domínio
 */
function buildHighFidelityPRD(
  blueprint: MasterBlueprint,
  discovery_answers: DiscoveryAnswers,
  area: string
): TechnicalDocAsset {
  const isTradeIn = blueprint.domain_category === 'trade_in_valuation';
  const isWorkshop = blueprint.domain_category === 'workshop_service';
  const isSales = blueprint.domain_category === 'sales_crm';

  let macroModules: SystemMacroModule[] = [];
  let userStories: DetailedUserStory[] = [];

  if (isTradeIn) {
    macroModules = [
      {
        module_number: 1,
        title: 'Scanner de Placa & OCR Inteligente',
        objective: 'Reconhecimento óptico instantâneo da placa e consulta paralela a bases de dados veiculares.',
        sub_features: [
          { name: 'Leitura OCR via Câmera', description: 'Identificação de placas padrão Mercosul e cinza com conferência de reflexos e nitidez.', input_or_extraction: 'Foto da placa -> String da Placa' },
          { name: 'Consulta SINESP / DETRAN em Paralelo', description: 'Validação automática de restrições de roubo/furto, multas ativas e débitos de IPVA.', input_or_extraction: 'Placa -> JSON de Restrições' },
          { name: 'Decodificador de Chassi (VIN)', description: 'Extração automática de marca, modelo, ano de fabricação, versão e motorização oficial.', input_or_extraction: 'Placa -> Ficha Técnica Homologada' },
        ],
        business_rules: ['Placas com alerta de roubo/furto bloqueiam imediatamente a avaliação', 'Divergência entre modelo no documento e foto dispara alerta ao gerente'],
      },
      {
        module_number: 2,
        title: 'Captura Guiada de Fotos (6 Ângulos)',
        objective: 'Overlay visual na câmera do smartphone para padronização das fotos de vistoria.',
        sub_features: [
          { name: 'Guia de Enquadramento com IA', description: 'Silhueta gráfica na tela orientando frente, traseira, laterais, painel e teto.', input_or_extraction: 'Feed da câmera -> Validação de Enquadramento' },
          { name: 'Detecção de Nitidez e Iluminação', description: 'Rejeição instantânea de fotos embaçadas ou em contra-luz no pátio antes do envio.', input_or_extraction: 'Blob da imagem -> Score de Qualidade (0-100)' },
          { name: 'Compressão WebP e Upload Assíncrono', description: 'Otimização de imagens no dispositivo para upload ultrarrápido mesmo em 3G.', input_or_extraction: 'Imagem original -> WebP comprimido (250KB)' },
        ],
        business_rules: ['É obrigatório o registro de todos os 6 ângulos mínimos para emissão da oferta', 'Cada foto é gravada com carimbo de data, hora e geolocalização da concessionária'],
      },
      {
        module_number: 3,
        title: 'Motor de Avaliação & Precificação IA',
        objective: 'Cálculo algorítmico da faixa de oferta cruzando FIPE, mercado e avarias detectadas.',
        sub_features: [
          { name: 'Visão Computacional de Avarias', description: 'Identificação visual de repinturas, riscos profundos, mossas e desgaste de pneus.', input_or_extraction: '6 Fotos -> Lista de Avarias e Custo de Reparo' },
          { name: 'Cruzamento com Histórico de Leilão', description: 'Verificação em bases nacionais de leilão (indício de sinistro leve/médio).', input_or_extraction: 'Chassi -> Score de Leilão e Desvalorização' },
          { name: 'Algoritmo de Margem e Giro', description: 'Cálculo da faixa de compra recomendada garantindo margem mínima de 12% na revenda.', input_or_extraction: 'FIPE - Descontos de Avarias = Faixa de Oferta' },
        ],
        business_rules: ['A IA nunca pode sugerir valor superior à FIPE sem autorização da diretoria', 'Carros com passagem por leilão recebem desconto paramétrico obrigatório de 15%'],
      },
      {
        module_number: 4,
        title: 'Validação Rápida do Gerente Comercial',
        objective: 'Aprovação em 1 clique via push notification no smartphone do gestor.',
        sub_features: [
          { name: 'Notificação Push em Tempo Real', description: 'Alerta instantâneo ao gerente com resumo executivo, fotos e valor sugerido.', input_or_extraction: 'ID da Avaliação -> Notificação Push com Botões' },
          { name: 'Ajuste de Margem com Trava', description: 'Possibilidade de flexibilizar a oferta em até ±R$ 2.000 para fechamento de vendas de novos.', input_or_extraction: 'Input do Gerente -> Oferta Aprovada' },
        ],
        business_rules: ['Se o gerente não responder em 3 minutos, a notificação escala para o gerente geral', 'Toda alteração de margem exige justificativa gravada em log'],
      },
    ];

    userStories = [
      {
        id: 'US-01',
        title: 'Captura Instantânea de Placa e Dados',
        actor: 'Consultor de Vendas',
        description: 'Como consultor de vendas no pátio, quero apontar a câmera para a placa do cliente para que o sistema puxe todos os dados do veículo em menos de 5 segundos.',
        acceptance_criteria_gherkin: [
          'Dado que o consultor abre o leitor de placa no smartphone',
          'Quando enquadrar a placa do seminovo com boa iluminação',
          'Então o OCR deve identificar a placa e preencher modelo, ano e FIPE oficial automaticamente.',
        ],
      },
      {
        id: 'US-02',
        title: 'Vistoria Guiada de Fotos com Detecção de Avarias',
        actor: 'Consultor de Vendas',
        description: 'Como consultor, quero seguir a captura guiada de fotos para que a IA identifique arranhões e calcule o custo de reparo sem depender do avaliador chefe.',
        acceptance_criteria_gherkin: [
          'Dado que as 6 fotos padronizadas foram capturadas',
          'Quando o consultor clicar em "Processar Avaliação com IA"',
          'Então o sistema deve exibir o laudo visual com os pontos de atenção destacados em menos de 10 segundos.',
        ],
      },
      {
        id: 'US-03',
        title: 'Aprovação Instantânea de Oferta na Palma da Mão',
        actor: 'Gerente Comercial',
        description: 'Como gerente comercial, quero receber a notificação com a faixa de compra sugerida para aprovar a oferta de troca em 1 clique sem sair da minha mesa.',
        acceptance_criteria_gherkin: [
          'Dado que a IA calculou a faixa de oferta com base na FIPE e no laudo',
          'Quando o gerente clicar no botão "Aprovar Oferta" na notificação',
          'Então o consultor deve receber o valor aprovado na tela do cliente imediatamente para fechar a venda.',
        ],
      },
    ];
  } else {
    // Fallback rico padrão para outras áreas
    macroModules = blueprint.key_modules.map((m, idx) => ({
      module_number: idx + 1,
      title: m.title,
      objective: m.purpose,
      sub_features: [
        { name: `Operação Central de ${m.title}`, description: `Processamento contextualizado dos dados de ${area} com regras inteligentes.`, input_or_extraction: 'Entrada de dados operacionais' },
        { name: 'Automação & Enriquecimento por IA', description: 'Análise preditiva em tempo real com geração de recomendações de alto valor.', input_or_extraction: 'Contexto -> Decisão em lote' },
        { name: 'Sincronização & Trilha de Auditoria', description: 'Registro em banco com logs de auditoria para fins de compliance LGPD.', input_or_extraction: 'Evento -> PostgreSQL & DMS' },
      ],
      business_rules: [
        'Ações sensíveis exigem perfil com papel de liderança ou supervisor',
        'Todos os eventos registram timestamp UTC e ID do operador',
      ],
    }));

    userStories = [
      {
        id: 'US-01',
        title: 'Acesso e Operação Diária',
        actor: blueprint.target_personas[0]?.name || 'Operador',
        description: `Como ${blueprint.target_personas[0]?.name || 'operador'}, quero acessar a visão consolidada para executar tarefas com agilidade.`,
        acceptance_criteria_gherkin: [
          'Dado que o usuário está autenticado no sistema',
          'Quando acessar a tela principal',
          'Então todas as pendências prioritárias devem ser carregadas em menos de 1 segundo.',
        ],
      },
      {
        id: 'US-02',
        title: 'Enriquecimento com IA em Tempo Real',
        actor: blueprint.target_personas[0]?.name || 'Operador',
        description: `Como operador, quero que a IA sugira a melhor ação ou conteúdo para acelerar meu fechamento.`,
        acceptance_criteria_gherkin: [
          'Dado que há registros pendentes de ação',
          'Quando o operador acionar o motor de inteligência',
          'Então as sugestões contextualizadas devem ser geradas instantaneamente.',
        ],
      },
    ];
  }

  return buildCanonicalPRDFromAI(blueprint, discovery_answers, area, {
    macro_modules: macroModules,
    user_stories: userStories,
    architecture_diagram_mermaid: generateDomainMermaidDiagram(blueprint),
    raci_matrix: generateDomainRaciMatrix(blueprint, area),
    success_metrics_okrs: generateDomainOkrs(blueprint),
  });
}

function generateDomainMermaidDiagram(blueprint: MasterBlueprint): string {
  return `graph TD
  User([👤 Consultor / Operador]) -->|1. Acesso & Captura| App[📱 Frontend Next.js PWA]
  App -->|2. Chamada de API Segura| Gateway[🛡️ API Gateway / Edge Routes]
  Gateway -->|3. Validação de Sessão & RBAC| SupaAuth[(🔐 Supabase Auth)]
  Gateway -->|4. Enriquecimento & Visão| AI[🧠 Motor Multi-Agentes Claude]
  Gateway -->|5. Consulta Externa| ExtAPIs[🌐 APIs FIPE / Leilão / Detran]
  AI -->|6. Predição & Score| Gateway
  Gateway -->|7. Persistência & Trilha LGPD| DB[(💾 PostgreSQL + RLS)]
  Gateway -->|8. Push Notification| Manager([👔 Gerente / Gestor])
  DB -->|9. Webhook / Sincronização| DMS[🏢 DMS Linx / Apollo / Totvs]

  classDef primary fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff;
  classDef accent fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#fff;
  classDef ai fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#fff;
  class App,Gateway primary;
  class DB,DMS accent;
  class AI ai;`;
}

function generateDomainRaciMatrix(blueprint: MasterBlueprint, area: string): RaciItem[] {
  return [
    {
      activity: 'Captura Inicial de Dados / Fotos / Placa',
      responsible: blueprint.target_personas[0]?.name || 'Consultor Operacional',
      accountable: 'Gerente da Área',
      consulted: 'Cliente Final',
      informed: 'Avaliador Técnico / Backoffice',
    },
    {
      activity: 'Processamento & Enriquecimento por IA',
      responsible: 'Motor de IA (Claude / Edge Workers)',
      accountable: 'Líder Técnico de TI / Inovação',
      consulted: 'Consultor Operacional',
      informed: 'Gerente da Área',
    },
    {
      activity: 'Aprovação de Margem e Validação da Oferta',
      responsible: 'Gerente Comercial / Gestor',
      accountable: 'Gerente Comercial',
      consulted: 'Avaliador Chefe',
      informed: 'Consultor de Vendas',
    },
    {
      activity: 'Sincronização com DMS & Trilha de Auditoria LGPD',
      responsible: 'Webhook / Supabase Worker',
      accountable: 'DPO / Encarregado de Dados',
      consulted: 'Administrador do DMS Linx/Apollo',
      informed: 'Diretoria de Operações',
    },
  ];
}

function generateDomainOkrs(blueprint: MasterBlueprint): SuccessMetricOkr[] {
  return [
    {
      objective: 'Reduzir drasticamente o tempo de ciclo operacional e eliminar filas de atendimento',
      key_results: [
        'Diminuir o tempo de processo de 45-60 min para menos de 3 minutos por operação',
        'Atingir mais de 90% de adoção espontânea pelos consultores nos primeiros 30 dias',
        'Zero perda de negócios por tempo excessivo de espera do cliente na concessionária',
      ],
      target_timeline: '45 dias pós-lançamento',
      target_roi: 'Recuperação estimada de +R$ 500k a R$ 1.5M/mês em vendas salvas',
    },
    {
      objective: 'Elevar a taxa de conversão e a precisão da margem comercial',
      key_results: [
        'Aumentar a taxa de conversão de clientes com troca/negociação de 40% para 65%',
        'Garantir 100% dos laudos com fotos auditadas e cruzamento de bases em banco de dados',
        'Margem de erro na precificação da IA abaixo de ±2.5% em relação ao mercado real',
      ],
      target_timeline: '90 dias pós-lançamento',
      target_roi: 'Aumento de 15% na rentabilidade média por veículo negociado',
    },
    {
      objective: 'Garantir compliance e governança total com LGPD',
      key_results: [
        '100% das consultas registradas com trilha de auditoria contendo ID do operador e timestamp UTC',
        'Isolamento estrito multi-tenant garantido por Row Level Security (RLS) no PostgreSQL',
      ],
      target_timeline: 'Imediato no MVP',
      target_roi: 'Zero risco de autuação LGPD ou vazamento de dados de clientes',
    },
  ];
}
