import { Profile, Goal, Idea, GoalAlignment, Evaluation, NotificationItem } from './types';

export const DEMO_PROFILES: Profile[] = [
  {
    id: 'usr-colab-1',
    full_name: 'João Silva',
    role: 'colaborador',
    area: 'Pós-venda',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'usr-eval-1',
    full_name: 'Mariana Costa',
    role: 'avaliador',
    area: 'Operações & Comitê',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'usr-admin-1',
    full_name: 'Carlos Mendes',
    role: 'admin',
    area: 'TI & Estratégia',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    created_at: '2026-08-01T10:00:00Z',
  },
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'Reduzir tempo médio de OS em 20%',
    description: 'Acelerar o ciclo total de passagem de veículos pela oficina, eliminando esperas manuais de aprovação de peças e laudos.',
    indicator: 'Horas médias por Ordem de Serviço concluída',
    owner_area: 'Pós-venda',
    deadline: '2026-12-31',
    created_by: 'usr-admin-1',
    created_at: '2026-08-10T14:00:00Z',
  },
  {
    id: 'goal-2',
    title: 'Aumentar conversão de orçamentos de peças em 15%',
    description: 'Agilizar o envio e aprovação interativa de orçamentos diretamente para o cliente final via WhatsApp e canal web.',
    indicator: 'Taxa de conversão de orçamentos gerados (%)',
    owner_area: 'Peças',
    deadline: '2026-11-30',
    created_by: 'usr-admin-1',
    created_at: '2026-08-10T14:15:00Z',
  },
  {
    id: 'goal-3',
    title: 'Digitalizar 100% dos checklists de entrada de oficina',
    description: 'Substituir pranchetas de papel por checklist fotográfico digital com detecção de avarias antes da entrada do carro.',
    indicator: '% de veículos com vistoria digital e fotos arquivadas',
    owner_area: 'Operações',
    deadline: '2026-10-31',
    created_by: 'usr-admin-1',
    created_at: '2026-08-12T09:30:00Z',
  },
  {
    id: 'goal-4',
    title: 'Redução de custos operacionais e retrabalho em TI e Backoffice',
    description: 'Automatizar tarefas repetitivas de conciliação de dados entre ERP e planilhas paralelas.',
    indicator: 'Horas economizadas por colaborador/mês',
    owner_area: 'TI',
    deadline: '2027-01-31',
    created_by: 'usr-admin-1',
    created_at: '2026-08-15T11:00:00Z',
  },
];

export const INITIAL_IDEAS: Idea[] = [
  {
    id: 'idea-os-express',
    author_id: 'usr-colab-1',
    author_name: 'João Silva',
    author_area: 'Pós-venda',
    title: 'Checklist Fotográfico e Aprovação Instantânea de OS na Oficina',
    problem: 'Hoje o cliente chega na oficina e o consultor anota avarias em papel. A aprovação de orçamento de peças leva até 4 horas porque o cliente não atende telefone e as fotos ficam perdidas no WhatsApp pessoal do mecânico.',
    solution: 'Criar um webapp rápido para tablet/celular onde o consultor fotografa o carro na recepção, marca avarias num modelo 3D/interativo e gera um link seguro de WhatsApp para o cliente aprovar com 1 clique.',
    area: 'Pós-venda',
    status: 'em_avaliacao',
    discovery_answers: {
      A_frequencia: 'Acontece todo dia com mais de 35 veículos atendidos diariamente.',
      A_perdas: 'Perdemos em média 2h por carro esperando o cliente aprovar, ocupando elevador da oficina à toa.',
      B_usuarios: 'Consultores técnicos de pós-venda, mecânicos chefes e o próprio cliente final pelo link.',
      B_volume: 'Cerca de 25 consultores simultâneos e 400 clientes por mês.',
      B_dispositivos: 'Celular e Tablet para os consultores; celular para o cliente.',
      C_fontes: 'Sim, depende do cadastro da placa e chassi no ERP Linx/Apollo da concessionária.',
      C_qualidade: 'O cadastro no ERP é confiável, mas as fotos hoje ficam bagunçadas em celular particular.',
      C_novas_informacoes: 'Sim, fotos com carimbo de data/hora, avarias marcadas e assinatura digital do cliente.',
      D_tempo_real: 'Precisa atualizar na hora que o cliente clicar em aprovar para liberar as peças no estoque.',
      E_dados_sensiveis: 'Sim, nome, placa e telefone do cliente (necessário consentimento LGPD na tela de aprovação).',
      E_permissoes: 'Mecânico só vê o que precisa consertar; consultor vê valores; cliente vê resumo com fotos.',
      F_formato: 'Webapp responsivo moderno que roda no navegador do tablet sem precisar instalar nada pesado.',
      F_offline: 'Sim, a oficina tem pontos cegos de Wi-Fi perto do pátio de lavagem, então salvar rascunho offline seria ideal.',
      G_passo_a_passo: 'Consultor recebe cliente com prancheta de papel -> tira foto com celular pessoal -> digita no ERP -> liga pro cliente -> se cliente não atende, carro fica parado.',
      G_gargalo: 'Atraso na resposta do cliente e perda das fotos comprovando que o risco já existia.',
      H_mudancas: 'Tempo de aprovação cair de 4 horas para 25 minutos. Zero reclamações de avarias indevidas.',
      H_metricas: 'Redução do tempo de permanência da OS e aumento de 20% em peças adicionais aprovadas.',
      I_objetivos: 'Crescer faturamento de peças e reduzir tempo de OS em 20%.',
    },
    assets: {
      version: 1,
      lastUpdated: '2026-09-08T15:30:00Z',
      prototype: {
        themeColor: '#2563eb',
        styleMode: 'mobile',
        screens: [
          {
            id: 'scr-1',
            name: 'Recepção e Vistoria Rápida',
            description: 'Tela inicial do consultor com leitura de placa e captura de fotos de avarias.',
            type: 'mobile',
            elements: [
              { type: 'header', label: 'Vistoria Express - Placa BRA2E19' },
              { type: 'alert', label: 'Veículo identificado no ERP: Corolla Cross XRE 2024' },
              { type: 'input', label: 'Quilometragem atual', value: '34.250 km' },
              { type: 'metric_card', label: 'Fotos Capturadas', value: '4 fotos anexadas' },
              { type: 'button', label: 'Adicionar Foto de Avaria', variant: 'primary' },
              { type: 'button', label: 'Gerar Orçamento Rápido', variant: 'success' },
            ],
          },
          {
            id: 'scr-2',
            name: 'Aprovação do Cliente (Link WhatsApp)',
            description: 'Visão simples e transparente enviada ao cliente com itens, fotos e botão de aprovação.',
            type: 'mobile',
            elements: [
              { type: 'header', label: 'Olá Mariana, revise o laudo do seu veículo' },
              { type: 'badge', label: 'Troca de Pastilhas Dianteiras - R$ 480,00' },
              { type: 'badge', label: 'Filtro de Ar Condicionado - R$ 95,00' },
              { type: 'alert', label: 'Item de segurança: Pastilhas com desgaste crítico (foto anexada)' },
              { type: 'button', label: 'Aprovar Orçamento Completo (R$ 575,00)', variant: 'success' },
            ],
          },
          {
            id: 'scr-3',
            name: 'Painel da Oficina (Tempo Real)',
            description: 'Quadro Kanban dos elevadores atualizado instantaneamente quando o cliente aprova.',
            type: 'dashboard',
            elements: [
              { type: 'metric_card', label: 'Veículos Aguardando Peças', value: '3' },
              { type: 'metric_card', label: 'Tempo Médio de Resposta', value: '18 min' },
              { type: 'table', label: 'Fila de Liberação Imediata', details: ['BRA2E19 - Aprovado há 2 min', 'XYZ9876 - Em vistoria', 'KLP4321 - Aguardando cliente'] },
            ],
          },
        ],
      },
      technical_prompt: {
        framework: 'Next.js 14 App Router',
        database: 'Supabase Postgres + Storage',
        hosting: 'Vercel',
        auth: 'Supabase Auth com RLS por perfil',
        prompt_text: `# PROMPT PARA FERRAMENTA CONSTRUTORA (LOVABLE / NEXT.JS)
## Nome do Projeto: OS Express - Vistoria e Aprovação Ágil de Oficina
### Visão Geral
Construa uma aplicação web responsiva (Mobile First) utilizando Next.js (App Router), TypeScript, TailwindCSS e Supabase (Postgres, Auth e Storage). A ferramenta digitaliza a entrada de veículos na oficina mecânica e acelera a aprovação de orçamentos enviando laudo fotográfico seguro via WhatsApp.

### Modelo de Dados Recomendado (Supabase Postgres)
1. **inspections** (id uuid pk, vehicle_plate text, km int, status text, customer_phone text, token uuid unique, created_at timestamptz)
2. **inspection_photos** (id uuid pk, inspection_id uuid fk, photo_url text, tag text, notes text)
3. **quote_items** (id uuid pk, inspection_id uuid fk, description text, price numeric, is_approved boolean)

### Telas e Fluxos Principais
1. **/nova-vistoria**: Consultor insere placa, digita km, anexa até 6 fotos com preview instantâneo e marca serviços sugeridos.
2. **/laudo/[token]**: Página pública e segura acessada pelo cliente via celular. Exibe fotos das avarias com zoom, valores discriminados e botão de aceite digital sob termos LGPD.
3. **/oficina/kanban**: Painel do chefe de oficina mostrando status dos carros em tempo real via Supabase Realtime.

### Requisitos Técnicos
- Armazenamento de fotos no bucket seguro Supabase Storage com compressão client-side em WebP.
- Suporte a cache offline local com Service Worker para evitar perda de dados em pontos cegos da oficina.
- Responsividade total e alto contraste visual para uso em ambientes industriais de oficina.`,
      },
      technical_doc: {
        functional_requirements: [
          'Captura e compressão instantânea de fotos do veículo na recepção.',
          'Geração de token de acesso criptografado com validade de 48h para envio por link de WhatsApp.',
          'Interface de aceite pelo cliente com registro do IP, timestamp e consentimento LGPD.',
          'Sincronização em tempo real com o painel Kanban da oficina assim que aprovado.',
        ],
        non_functional_requirements: [
          'Carregamento da página de aprovação do cliente em menos de 1.5s em redes 4G.',
          'Armazenamento otimizado de imagens no Supabase Storage em formato WebP reduzindo consumo de banda.',
          'Disponibilidade de 99.9% com funcionamento resiliente a oscilações de Wi-Fi.',
        ],
        data_model_summary: [
          'Entidade Inspection: vinculada ao consultor e placa do veículo.',
          'Entidade InspectionDamage: armazena coordenadas de toque na imagem ou avaria.',
          'Entidade QuoteApproval: histórico imutável com data, IP e assinatura digital.',
        ],
        integrations: [
          'API do ERP da Concessionária para consulta de dados cadastrais da placa e chassi.',
          'API Oficial WhatsApp Business / Z-API para disparo automatizado de notificação com o laudo.',
        ],
        security_requirements: [
          'Conformidade estrita com a LGPD: número de telefone e placa mascarados no link público.',
          'Políticas de RLS do Supabase garantindo que consultores vejam apenas dados da sua filial.',
        ],
      },
      commercial_deck: {
        slides: [
          {
            title: '1. O Problema: Gargalo Invisível na Oficina',
            bullets: [
              'Veículos passam até 4 horas parados ocupando elevadores mecânicos aguardando retorno do cliente.',
              'Comunicação telefônica ineficiente e fotos de avarias espalhadas em aparelhos particulares.',
              'Risco de contestação jurídica e queixas de avarias preexistentes não comprovadas.',
            ],
          },
          {
            title: '2. A Solução: OS Express com Aceite 1-Clique',
            bullets: [
              'Vistoria 100% digital com smartphone ou tablet em menos de 3 minutos.',
              'Envio imediato de laudo fotográfico transparente e interativo via WhatsApp.',
              'Cliente aprova itens e valores na palma da mão com um único toque.',
            ],
          },
          {
            title: '3. Impacto no Negócio e Retorno (ROI)',
            bullets: [
              'Redução imediata de 65% no tempo de espera e ociosidade de elevadores.',
              'Aumento estimado de 18% no faturamento de peças preventivas pela clareza do laudo fotográfico.',
              'Zero custos com impressão de formulários físicos e pranchetas.',
            ],
          },
          {
            title: '4. Indicadores de Sucesso em 90 Dias',
            bullets: [
              'Tempo médio de resposta do cliente reduzido de 240min para 22min.',
              'NPS da oficina elevado em +14 pontos.',
              'Mais de 1.200 laudos arquivados com histórico digital auditável.',
            ],
          },
        ],
      },
    },
    submitted_at: '2026-09-08T15:35:00Z',
    created_at: '2026-09-08T15:00:00Z',
    updated_at: '2026-09-08T15:35:00Z',
  },
  {
    id: 'idea-catalogo-ia',
    author_id: 'usr-colab-1',
    author_name: 'João Silva',
    author_area: 'Pós-venda',
    title: 'Assistente Inteligente de Compatibilidade de Peças por Foto',
    problem: 'Mecânicos e balconistas perdem até 20 minutos buscando códigos de peças equivalentes em manuais desatualizados quando um cliente traz uma peça danificada sem código visível.',
    solution: 'IA de visão computacional que analisa a foto da peça danificada e sugere instantaneamente o código OEM e o saldo em estoque.',
    area: 'Peças',
    status: 'aprovada',
    discovery_answers: {
      A_frequencia: 'Ocorre mais de 15 vezes ao dia no balcão de peças.',
      A_perdas: 'Filas no balcão e vendas perdidas para autopeças paralelas vizinhas.',
      B_usuarios: 'Balconistas de peças e mecânicos da concessionária.',
      B_volume: '40 usuários ativos na rede de lojas.',
      B_dispositivos: 'Celulares e computadores de balcão.',
      C_fontes: 'Catálogo de peças e sistema de estoque Linx.',
      C_qualidade: 'Base de dados consolidada com mais de 30 mil SKUs.',
      C_novas_informacoes: 'Banco de fotos de peças para treinamento contínuo.',
      D_tempo_real: 'Resposta visual em menos de 3 segundos.',
      E_dados_sensiveis: 'Não envolve dados pessoais, apenas peças e estoque.',
      E_permissoes: 'Acesso para equipe de peças e gerência.',
      F_formato: 'Módulo web rápido e intuitivo.',
      F_offline: 'Não necessita offline.',
      G_passo_a_passo: 'Balconista mede e procura em catálogos em PDF página por página.',
      G_gargalo: 'Demora e risco de encomendar código com compatibilidade incorreta.',
      H_mudancas: 'Tempo de consulta reduzido para 5 segundos.',
      H_metricas: 'Aumento de 15% nas vendas de balcão.',
      I_objetivos: 'Aumentar conversão de orçamentos de peças em 15%.',
    },
    submitted_at: '2026-09-07T11:00:00Z',
    created_at: '2026-09-07T10:30:00Z',
    updated_at: '2026-09-07T14:20:00Z',
  },
];

export const INITIAL_ALIGNMENTS: GoalAlignment[] = [
  {
    id: 'align-1',
    idea_id: 'idea-os-express',
    goal_id: 'goal-1',
    goal_title: 'Reduzir tempo médio de OS em 20%',
    adherence_score: 92.5,
    adherence_label: 'alta',
    justification: 'A solução elimina diretamente o maior gargalo de tempo na oficina (espera de aprovação de orçamento pelo cliente), atacando diretamente o indicador central da meta.',
    created_at: '2026-09-08T15:36:00Z',
  },
  {
    id: 'align-2',
    idea_id: 'idea-os-express',
    goal_id: 'goal-3',
    goal_title: 'Digitalizar 100% dos checklists de entrada de oficina',
    adherence_score: 88.0,
    adherence_label: 'alta',
    justification: 'Substitui integralmente o processo analógico de prancheta por fotos digitais com carimbo de auditoria.',
    created_at: '2026-09-08T15:36:00Z',
  },
  {
    id: 'align-3',
    idea_id: 'idea-catalogo-ia',
    goal_id: 'goal-2',
    goal_title: 'Aumentar conversão de orçamentos de peças em 15%',
    adherence_score: 95.0,
    adherence_label: 'alta',
    justification: 'Permite identificar e orçar peças imediatamente no balcão, reduzindo desistências e aumentando fechamentos de venda.',
    created_at: '2026-09-07T11:05:00Z',
  },
];

export const INITIAL_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-1',
    idea_id: 'idea-catalogo-ia',
    evaluator_id: 'usr-eval-1',
    evaluator_name: 'Mariana Costa',
    decision: 'aprovada',
    comment: 'Excelente iniciativa com aderência máxima à meta de peças. Recomendo avançar imediatamente para prototipagem no Lovable.',
    created_at: '2026-09-07T14:20:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'usr-colab-1',
    idea_id: 'idea-catalogo-ia',
    type: 'status_change',
    title: 'Ideia Aprovada!',
    message: 'Sua ideia "Assistente Inteligente de Compatibilidade de Peças por Foto" foi APROVADA pelo comitê avaliador.',
    read: false,
    created_at: '2026-09-07T14:21:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'usr-colab-1',
    idea_id: 'idea-os-express',
    type: 'goal_classified',
    title: 'Aderência Estratégica Calculada',
    message: 'A IA identificou Alta Aderência (92.5%) com a meta "Reduzir tempo médio de OS em 20%".',
    read: true,
    created_at: '2026-09-08T15:36:05Z',
  },
];
