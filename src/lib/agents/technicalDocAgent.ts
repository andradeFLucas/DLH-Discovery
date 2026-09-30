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
} from '../types';
import { MasterBlueprint } from './orchestrator';
import { callClaudeHaiku } from './claudeClient';

export interface TechnicalDocAgentInput {
  blueprint: MasterBlueprint;
  discovery_answers: DiscoveryAnswers;
  area: string;
}

/**
 * Agente 2: Especialista em Arquitetura de Software e PRD Oficial (Claude 3.5 Haiku)
 * Constrói o documento de engenharia completo, cobrindo modelos de banco, APIs, RLS e integrações DMS.
 */
export async function runTechnicalDocAgent(
  input: TechnicalDocAgentInput
): Promise<TechnicalDocAsset> {
  const { blueprint, discovery_answers, area } = input;

  const systemPrompt = `Você é um Arquiteto de Software Líder e Especialista em Engenharia de Software para ecossistemas automotivos.
Sua missão é enriquecer e validar a especificação de engenharia (PRD) de uma nova aplicação para concessionárias, baseando-se no Master Blueprint.
Retorne um JSON com recomendações aprofundadas de arquitetura, tabelas de banco PostgreSQL e endpoints REST.
Retorne SOMENTE o JSON válido, sem blocos markdown.`;

  const userPrompt = `Gere os complementos de arquitetura para o PRD com base no Blueprint:
- Título: "${blueprint.project_title}"
- Domínio: "${blueprint.domain_category}"
- Gargalo Operacional: "${blueprint.operational_bottleneck.metric}"
- Entidades do Banco: ${blueprint.database_entities_needed.join(', ')}
- Respostas Técnicas: Fontes de Dados: "${discovery_answers.C_fontes || 'DMS Linx/DealerNet'}", Segurança: "${discovery_answers.C_seguranca || 'LGPD e RBAC'}"

Formato esperado:
{
  "architecture_summary": "Visão técnica de microsserviços e integração",
  "custom_endpoints": [
    { "path": "/api/v1/recurso", "method": "POST", "desc": "Descrição" }
  ],
  "critical_risks": ["Risco 1", "Risco 2"]
}`;

  let aiTechnicalNotes = '';
  const aiResult = await callClaudeHaiku(userPrompt, { systemPrompt, maxTokens: 2048 });
  if (aiResult) {
    aiTechnicalNotes = aiResult;
  }

  return buildEnrichedTechnicalPRD(blueprint, discovery_answers, area, aiTechnicalNotes);
}

/**
 * Montador Canônico do PRD com Tipagem Rígida e Arquitetura Completa
 */
function buildEnrichedTechnicalPRD(
  blueprint: MasterBlueprint,
  discovery_answers: DiscoveryAnswers,
  area: string,
  aiNotes?: string
): TechnicalDocAsset {
  const normTitle = blueprint.project_title;
  const lowerArea = area.toLowerCase();
  const domain = blueprint.domain_category;

  const tableName = `tb_${area.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${domain}`;

  // 1. Resumo Executivo
  const executive_summary = `Este documento formaliza a Especificação Técnica e Funcional de Engenharia (PRD 1.0) para a solução "${normTitle}", alocada ao departamento de ${area}. A solução foi arquitetada para mitigar diretamente o gargalo: "${blueprint.core_problem_statement}". Por meio de "${blueprint.solution_concept}", o sistema digitaliza o fluxo ponta a ponta, oferecendo tempos de resposta em milissegundos, total rastreabilidade, compliance com a LGPD e integração com o ecossistema DMS/ERP da concessionária.`;

  // 2. Objetivos do Produto
  const product_objectives = [
    `Eliminar o gargalo operacional: "${blueprint.operational_bottleneck.metric}" - ${blueprint.operational_bottleneck.impact}.`,
    `Acelerar a produtividade diária em: ${blueprint.business_roi_projections.time_saved_per_day}.`,
    `Garantir compliance e rastreabilidade: registro unificado de transações com logs de auditoria e controle de acesso por papel (RBAC).`,
    `Integrar a operação aos sistemas legados e DMS da rede (${discovery_answers.C_fontes || 'Linx DMS, Apollo, NBS ou Totvs'}).`,
  ];

  // 3. Personas
  const personas: PersonaItem[] = blueprint.target_personas.map((p) => ({
    persona: p.name,
    role: p.role,
    needs: p.primary_pain,
  }));

  if (personas.length === 1) {
    personas.push({
      persona: 'Gestor / Gerente Departamental',
      role: 'Governança, acompanhamento de SLAs operacionais e validação de relatórios.',
      needs: 'Dashboard consolidado em tempo real, visualização de métricas e controle de acessos da equipe.',
    });
  }

  // 4. Módulos do Sistema
  const macro_modules: SystemMacroModule[] = blueprint.key_modules.map((m, idx) => ({
    module_number: idx + 1,
    title: m.title,
    objective: m.purpose,
    sub_features: [
      { name: 'Entrada de Dados & Validação', description: 'Validação de campos obrigatórios e higienização em tempo real.' },
      { name: 'Processamento Automatizado', description: 'Regras de negócio específicas e cruzamento automatizado de informações.' },
      { name: 'Disparo de Ações & Alertas', description: 'Notificação operacional imediata via interface e mensageria.' },
    ],
    business_rules: [
      'Somente usuários autenticados com perfis habilitados podem alterar o status do registro.',
      'Todas as interações são salvas com timestamp UTC e id do operador responsável.',
    ],
  }));

  // 5. Histórias de Usuário
  const user_stories: DetailedUserStory[] = [
    {
      id: 'US-01',
      title: 'Acesso e Visualização Operacional',
      actor: personas[0]?.persona || 'Colaborador Operacional',
      description: `Como ${personas[0]?.persona || 'colaborador'}, desejo visualizar rapidamente as pendências do dia para priorizar o atendimento mais urgente.`,
    },
    {
      id: 'US-02',
      title: 'Execução de Ação com IA',
      actor: personas[0]?.persona || 'Colaborador Operacional',
      description: `Como ${personas[0]?.persona || 'colaborador'}, desejo acionar a inteligência da plataforma para acelerar tarefas repetitivas e reduzir meu tempo gasto.`,
    },
    {
      id: 'US-03',
      title: 'Governança e Auditoria',
      actor: 'Gerente da Área',
      description: `Como gerente, desejo consultar o histórico completo de transações e exportar relatórios para auditar o fluxo com segurança.`,
    },
  ];

  // 6. Modelo de Banco de Dados
  const database_tables: DatabaseTableSpec[] = [
    {
      table_name: tableName,
      description: `Armazena as entidades centrais da solução ${normTitle}.`,
      columns: [
        { field: 'id', type: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()', description: 'Identificador único' },
        { field: 'tenant_id', type: 'VARCHAR(50) NOT NULL', description: 'Identificador da concessionária/loja' },
        { field: 'operator_id', type: 'UUID NOT NULL', description: 'Usuário responsável pelo registro' },
        { field: 'title_or_ref', type: 'VARCHAR(255) NOT NULL', description: 'Título, placa, cliente ou referência do registro' },
        { field: 'status', type: "VARCHAR(30) DEFAULT 'ativo'", description: 'Estado atual do fluxo' },
        { field: 'metadata_payload', type: 'JSONB DEFAULT \'{}\'', description: 'Dados específicos do contexto e IA' },
        { field: 'created_at', type: 'TIMESTAMPTZ DEFAULT NOW()', description: 'Data/hora de criação' },
        { field: 'updated_at', type: 'TIMESTAMPTZ DEFAULT NOW()', description: 'Data/hora de modificação' },
      ],
    },
    {
      table_name: `${tableName}_audit_logs`,
      description: 'Trilha de auditoria para fins de compliance LGPD e histórico de operações.',
      columns: [
        { field: 'id', type: 'BIGSERIAL PRIMARY KEY', description: 'Identificador do evento' },
        { field: 'record_id', type: 'UUID NOT NULL', description: 'Referência ao registro' },
        { field: 'actor_id', type: 'UUID NOT NULL', description: 'Quem realizou a ação' },
        { field: 'action_type', type: 'VARCHAR(50) NOT NULL', description: 'Ex: CRIACAO, ATUALIZACAO, DISPARO_IA' },
        { field: 'created_at', type: 'TIMESTAMPTZ DEFAULT NOW()', description: 'Horário do log' },
      ],
    },
  ];

  const data_model_sql = `-- Schema DDL Oficial para PostgreSQL / Supabase
CREATE TABLE IF NOT EXISTS ${tableName} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(50) NOT NULL,
    operator_id UUID NOT NULL,
    title_or_ref VARCHAR(255) NOT NULL,
    status VARCHAR(30) DEFAULT 'ativo',
    metadata_payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_${tableName}_tenant ON ${tableName}(tenant_id);
CREATE INDEX IF NOT EXISTS idx_${tableName}_status ON ${tableName}(status);

-- Trilha de Auditoria
CREATE TABLE IF NOT EXISTS ${tableName}_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    record_id UUID NOT NULL REFERENCES ${tableName}(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  // 7. APIs
  const api_endpoints: ApiEndpointSpec[] = [
    {
      method: 'GET',
      path: `/api/v1/${tableName.replace('tb_', '')}`,
      description: 'Lista registros paginados com suporte a filtros por status e busca textual.',
      payload: 'Query params: ?page=1&limit=20&status=ativo&search=termo',
      response: '{ "data": [...], "pagination": { "page": 1, "total": 120 } }',
    },
    {
      method: 'POST',
      path: `/api/v1/${tableName.replace('tb_', '')}`,
      description: 'Cria novo registro e dispara regras automáticas de validação e IA.',
      payload: '{ "title_or_ref": "...", "metadata_payload": { ... } }',
      response: '{ "id": "uuid", "status": "criado", "created_at": "timestamp" }',
    },
    {
      method: 'PATCH',
      path: `/api/v1/${tableName.replace('tb_', '')}/:id`,
      description: 'Atualiza o status ou dados do registro e grava log de auditoria.',
      payload: '{ "status": "concluido", "notes": "..." }',
      response: '{ "id": "uuid", "updated_at": "timestamp" }',
    },
  ];

  const ai_contracts: ApiContractSpec[] = [
    {
      name: 'Contrato de Geração Contextual de IA',
      endpoint: '/api/ai/process-item',
      method: 'POST',
      description: 'Dispara a IA para enriquecer o registro com sugestões ou mensagens personalizadas.',
      input_payload: '{\n  "record_id": "uuid",\n  "context_text": "...",\n  "lead_or_client_info": { ... }\n}',
      output_payload: '{\n  "suggested_action": "...",\n  "generated_content": "...",\n  "confidence_score": 0.96\n}',
    },
  ];

  // 8. Segurança e RLS
  const rls_policies: RlsPolicySpec[] = [
    {
      table: tableName,
      rules: [
        'ENABLE ROW LEVEL SECURITY;',
        `CREATE POLICY tenant_isolation_policy ON ${tableName} FOR ALL USING (tenant_id = current_setting('app.current_tenant', true));`,
        `CREATE POLICY operator_access_policy ON ${tableName} FOR SELECT USING (auth.uid() IS NOT NULL);`,
      ],
    },
  ];

  const env_vars: EnvVarSpec[] = [
    { variable: 'NEXT_PUBLIC_SUPABASE_URL', purpose: 'URL base da instância Supabase', scope: 'Client & Server' },
    { variable: 'SUPABASE_SERVICE_ROLE_KEY', purpose: 'Chave administrativa com bypass de RLS para workers', scope: 'Server-Only' },
    { variable: 'ANTHROPIC_API_KEY', purpose: 'Chave de integração com Claude 3.5 Sonnet/Haiku', scope: 'Server-Only' },
  ];

  const error_states: ErrorStateSpec[] = [
    {
      scenario: 'Falha de Conectividade com o DMS / ERP',
      system_behavior: 'Armazena requisição em fila local (Outbox Pattern) com retry exponencial.',
      user_action: 'Exibe indicador visual discreto de "Sincronização em fila". Operação não é interrompida.',
    },
    {
      scenario: 'Limite ou Queda na API da IA',
      system_behavior: 'Aciona imediatamente o motor local de templates sem retornar erro 500.',
      user_action: 'Exibe mensagem amigável e permite a edição manual dos dados sem travar a tela.',
    },
  ];

  const roadmap_phases: RoadmapPhase[] = [
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
  ];

  const effort_estimation: EffortEstimation = {
    complexity: 'Média',
    estimated_weeks: '4 a 6 semanas para rollout pleno',
    key_milestones: [
      'Sprint 1: Schema de banco de dados e APIs REST',
      'Sprint 2: Front-end interativo e integração de IA com Claude',
      'Sprint 3: Homologação com os operadores reais e DMS',
    ],
  };

  return {
    document_version: '1.0.0-PROD',
    executive_summary,
    product_objectives,
    personas,
    journey_steps: [
      '1. Identificação da demanda ou chegada do cliente',
      '2. Captura ágil das informações na interface',
      '3. Enriquecimento automatizado por IA',
      '4. Disparo da ação de valor e registro auditado no banco',
    ],
    macro_modules,
    architecture_overview: `A aplicação adota arquitetura moderna baseada em Next.js (App Router) com TypeScript no front-end, integrada a um backend serverless e banco PostgreSQL com Supabase. O processamento de inteligência artificial é isolado na camada de serviços com Claude 3.5.`,
    tech_stack: {
      frontend: 'Next.js 14+ (App Router, TypeScript, Vanilla CSS/TailwindCSS)',
      backend: 'Next.js Route Handlers (Edge & Node.js Runtime)',
      database: 'PostgreSQL 15+ (com RLS via Supabase)',
      auth: 'Supabase Auth com RBAC e JWT',
      hosting: 'Vercel Edge Network',
    },
    architecture_justification: {
      nextjs: ['Renderização híbrida de altíssimo desempenho', 'Rotas de API nativas com zero complexidade de infraestrutura'],
      supabase: ['PostgreSQL robusto com Row Level Security por concessionária', 'Trilhas de auditoria e webhooks em tempo real'],
      vercel: ['Deploy contínuo e escalabilidade global com baixa latência'],
      components: ['Design system modular e acessível em qualquer dispositivo'],
    },
    user_stories,
    database_tables,
    data_model_sql,
    data_model_summary: [
      `Tabela principal: ${tableName} com chaves para isolamento multi-tenant.`,
      `Auditoria: ${tableName}_audit_logs gravando todas as operações para conformidade LGPD.`,
    ],
    api_endpoints,
    ai_contracts,
    rls_policies,
    env_vars,
    error_states,
    functional_requirements: [
      'O sistema deve autenticar usuários com diferentes permissões (Operador, Supervisor, Gestor).',
      'O sistema deve permitir busca instantânea por placa, cliente ou código identificador.',
      'O sistema deve processar sugestões de IA com tempo de resposta inferior a 3 segundos.',
    ],
    non_functional_requirements: [
      'Tempo de carregamento inicial (LCP) inferior a 1.2 segundos.',
      'Disponibilidade mínima de 99.8% em horário comercial da concessionária.',
      'Criptografia TLS 1.3 em trânsito e AES-256 em repouso.',
    ],
    integrations: [
      { name: 'DMS Linx / DealerNet / Apollo', type: 'REST/SOAP API', purpose: 'Sincronização de clientes, veículos e ordens' },
      { name: 'WhatsApp Business API / Mensageria', type: 'Webhook REST', purpose: 'Envio de notificações e follow-ups diretos ao cliente' },
      { name: 'Anthropic Claude API', type: 'REST (HTTPS)', purpose: 'Motor cognitivo para síntese e geração de mensagens' },
    ],
    security_requirements: [
      'Isolamento estrito entre lojas através de Row Level Security (RLS).',
      'Mascaramento de dados sensíveis de clientes (CPF, telefone) conforme política LGPD.',
      'Log imutável de todas as ações de exclusão ou edição.',
    ],
    security_lgpd: [
      'Consentimento explícito registrado para contatos de follow-up.',
      'Direito de revogação e exclusão de dados mediante solicitação.',
    ],
    roadmap_phases,
    next_steps: [
      'Configurar schema PostgreSQL no Supabase.',
      'Realizar teste de carga no endpoint de geração com Claude.',
      'Apresentar protótipo para a equipe operacional piloto.',
    ],
    effort_estimation,
  };
}
