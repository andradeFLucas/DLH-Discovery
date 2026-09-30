export type UserRole = 'colaborador' | 'avaliador' | 'admin';

export type IdeaStatus = 'rascunho' | 'em_avaliacao' | 'aprovada' | 'reprovada' | 'standby';

export type AdherenceLabel = 'alta' | 'media' | 'baixa';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  area: string;
  avatar_url?: string;
  created_at: string;
  name?: string;
  department?: string;
}

export interface DiscoveryAnswers {
  // Bloco A - Sobre o problema
  A_frequencia?: string;
  A_perdas?: string;
  // Bloco B - Sobre quem vai usar
  B_usuarios?: string;
  B_volume?: string;
  B_dispositivos?: string;
  // Bloco C - Sobre informações e sistemas
  C_fontes?: string;
  C_qualidade?: string;
  C_novas_informacoes?: string;
  // Bloco D - Urgência
  D_tempo_real?: string;
  // Bloco E - Segurança e Acesso
  E_dados_sensiveis?: string;
  E_permissoes?: string;
  // Bloco F - Formato da Solução
  F_formato?: string;
  F_offline?: string;
  // Bloco G - Processo Atual
  G_passo_a_passo?: string;
  G_gargalo?: string;
  // Bloco H - Resultado Esperado
  H_mudancas?: string;
  H_metricas?: string;
  // Bloco I - Alinhamento Estratégico
  I_objetivos?: string;
  // Flags para respostas puladas / inferidas
  _inferred_fields?: string[];
  [key: string]: any;
}

export interface PrototypeScreen {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'form' | 'list' | 'analytics' | 'workflow' | 'mobile';
  elements: Array<{
    type: 'header' | 'metric_card' | 'input' | 'button' | 'table' | 'chart' | 'alert' | 'badge';
    label: string;
    value?: string;
    variant?: string;
    details?: string[];
  }>;
}

export interface PrototypeAsset {
  screens?: PrototypeScreen[];
  html_content?: string;
  image_url?: string;
  themeColor?: string;
  styleMode?: 'desktop' | 'mobile';
  generatedNotes?: string;
}

export type UserProfile = Profile;

export interface TechnicalPromptAsset {
  prompt_text: string;
  stack?: {
    framework: string;
    database: string;
    hosting: string;
    auth: string;
  };
  framework?: string;
  database?: string;
  hosting?: string;
  auth?: string;
}

export interface DetailedRequirement {
  id: string;
  title: string;
  description: string;
  acceptance_criteria: string[];
}

export interface ApiEndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  payload?: string;
  response?: string;
}

export interface IntegrationSpec {
  name: string;
  type: string;
  purpose: string;
}

export interface EffortEstimation {
  complexity: 'Baixa' | 'Média' | 'Alta';
  estimated_weeks: string;
  key_milestones: string[];
}

export interface PersonaItem {
  persona: string;
  role: string;
  needs: string;
}

export interface MacroModuleSubFeature {
  name: string;
  description: string;
  input_or_extraction?: string;
}

export interface SystemMacroModule {
  module_number: number;
  title: string;
  objective: string;
  sub_features: MacroModuleSubFeature[];
  business_rules: string[];
}

export interface DetailedUserStory {
  id: string;
  title: string;
  actor: string;
  description: string;
  acceptance_criteria_gherkin?: string[];
}

export interface RaciItem {
  activity: string;
  responsible: string; // Quem executa
  accountable: string; // Quem aprova/responde
  consulted: string;   // Quem é consultado
  informed: string;    // Quem é informado
}

export interface SuccessMetricOkr {
  objective: string;
  key_results: string[];
  target_timeline: string;
  target_roi: string;
}

export interface DatabaseColumnSpec {
  field: string;
  type: string;
  description: string;
}

export interface DatabaseTableSpec {
  table_name: string;
  description: string;
  columns: DatabaseColumnSpec[];
}

export interface ApiContractSpec {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  input_payload?: string;
  output_payload: string;
}

export interface RlsPolicySpec {
  table: string;
  rules: string[];
}

export interface EnvVarSpec {
  variable: string;
  purpose: string;
  scope: string;
}

export interface ErrorStateSpec {
  scenario: string;
  system_behavior: string;
  user_action: string;
}

export interface RoadmapPhase {
  phase_number: number;
  title: string;
  duration: string;
  deliverables: string[];
}

export interface TechnicalDocAsset {
  // 1. Capa e Resumo
  document_version?: string;
  executive_summary?: string;
  product_objectives?: string[];
  success_metrics_okrs?: SuccessMetricOkr[];
  raci_matrix?: RaciItem[];

  // 2. Personas e Fluxo
  personas?: PersonaItem[];
  journey_steps?: string[];

  // 3. Macro-Funcionalidades (Módulos do Sistema da Solução)
  macro_modules?: SystemMacroModule[];

  // 4. Arquitetura e Stack
  architecture_overview?: string;
  architecture_diagram_mermaid?: string;
  tech_stack?: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
  };
  architecture_justification?: {
    nextjs: string[];
    supabase: string[];
    vercel: string[];
    components: string[];
  };

  // 5. Histórias de Usuário
  user_stories?: DetailedUserStory[];

  // 6. Anexo Técnico de Implementação
  database_tables?: DatabaseTableSpec[];
  data_model_sql?: string;
  data_model_summary?: string[];
  app_routes?: {
    app_name: string;
    routes: { path: string; description: string }[];
  }[];
  api_endpoints?: ApiEndpointSpec[];
  ai_contracts?: ApiContractSpec[];
  rls_policies?: RlsPolicySpec[];
  env_vars?: EnvVarSpec[];
  error_states?: ErrorStateSpec[];

  // 7. Requisitos Legados (Compatibilidade)
  functional_requirements: (string | DetailedRequirement)[];
  non_functional_requirements: string[];
  integrations: (string | IntegrationSpec)[];
  security_requirements: string[];
  security_lgpd?: string[];

  // 8. Roadmap e Próximos Passos
  roadmap_phases?: RoadmapPhase[];
  next_steps?: string[];
  effort_estimation?: EffortEstimation;
}

export interface SlideItem {
  title: string;
  subtitle?: string;
  bullets: string[];
  iconType?: string;
}

export interface CommercialDeckAsset {
  slides: SlideItem[];
}

export interface GeneratedAssets {
  prototype?: PrototypeAsset;
  technical_prompt?: TechnicalPromptAsset;
  technical_doc?: TechnicalDocAsset;
  commercial_deck?: CommercialDeckAsset;
  version?: number;
  lastUpdated?: string;
}

export interface Idea {
  id: string;
  author_id: string;
  author_name: string;
  author_area: string;
  title: string;
  problem: string;
  solution: string;
  area: string;
  status: IdeaStatus;
  discovery_answers: DiscoveryAnswers;
  inferred_questions?: Record<string, boolean>;
  assets?: GeneratedAssets;
  evaluation?: {
    strategic_alignment?: AdherenceLabel;
    strategic_score?: number;
    strategic_feedback?: string;
    comments?: string;
    evaluator_name?: string;
    evaluated_at?: string;
  };
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  indicator: string;
  owner_area: string;
  target_value?: string;
  responsible?: string;
  deadline?: string | null;
  created_by: string;
  created_at: string;
}

export interface GoalAlignment {
  id: string;
  idea_id: string;
  goal_id: string;
  goal_title: string;
  adherence_score: number;
  adherence_label: AdherenceLabel;
  justification: string;
  created_at: string;
}

export interface Evaluation {
  id: string;
  idea_id: string;
  evaluator_id: string;
  evaluator_name: string;
  decision: 'aprovada' | 'reprovada' | 'standby';
  comment?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  idea_id?: string;
  type: 'status_change' | 'goal_classified' | 'idea_submitted' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
