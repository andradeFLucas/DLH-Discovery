export interface DiscoveryQuestion {
  id: string;
  label: string;
  placeholder: string;
  example: string;
  aiExtraction: string;
}

export interface DiscoveryBlockInfo {
  id: string;
  letter: string;
  title: string;
  description: string;
  questions: DiscoveryQuestion[];
}

export const DISCOVERY_BLOCKS: DiscoveryBlockInfo[] = [
  {
    id: 'block-a',
    letter: 'A',
    title: 'Sobre o Problema',
    description: 'Compreensão da gravidade, impacto de negócio e frequência da dor.',
    questions: [
      {
        id: 'A_frequencia',
        label: 'Quantas pessoas ou clientes são afetados por esse problema hoje? Com que frequência isso acontece?',
        placeholder: 'Ex: Mais de 30 clientes por dia; acontece todo início de mês...',
        example: 'ex: Acontece todo dia na recepção de veículos com mais de 25 clientes.',
        aiExtraction: 'Frequência e escala do problema — ajuda a priorizar e dimensionar a solução.',
      },
      {
        id: 'A_perdas',
        label: 'O que a empresa perde hoje por causa desse problema?',
        placeholder: 'Ex: Tempo perdido, dinheiro, retrabalho, reclamações no SAC...',
        example: 'ex: Perdemos cerca de 2 horas por cliente e geramos retrabalho para 3 pessoas.',
        aiExtraction: 'Impacto de negócio e justificativa de ROI para a apresentação comercial.',
      },
    ],
  },
  {
    id: 'block-b',
    letter: 'B',
    title: 'Sobre Quem Vai Usar a Solução',
    description: 'Perfil de usuário, volume de acessos e dispositivos preferidos.',
    questions: [
      {
        id: 'B_usuarios',
        label: 'Quem vai usar essa solução no dia a dia?',
        placeholder: 'Ex: Mecânicos, consultores de vendas, recepcionistas, gestores...',
        example: 'ex: Consultores técnicos e o próprio cliente final.',
        aiExtraction: 'Perfil de usuário e nível de familiaridade com sistemas — orienta o design do protótipo.',
      },
      {
        id: 'B_volume',
        label: 'Mais ou menos quantas pessoas vão usar essa solução simultaneamente ou por mês?',
        placeholder: 'Ex: 15 pessoas da filial ao mesmo tempo, cerca de 400 por mês...',
        example: 'ex: Cerca de 20 consultores ao mesmo tempo na loja.',
        aiExtraction: 'Volume de usuários simultâneos — dimensiona arquitetura e capacidade.',
      },
      {
        id: 'B_dispositivos',
        label: 'As pessoas vão acessar de computador, celular, tablet ou qualquer um desses?',
        placeholder: 'Ex: Celular e tablet na oficina, computador no caixa...',
        example: 'ex: Celular e tablet para agilidade no pátio.',
        aiExtraction: 'Requisitos de front-end (responsivo, mobile first, desktop).',
      },
    ],
  },
  {
    id: 'block-c',
    letter: 'C',
    title: 'Sobre Informações e Sistemas Já Usados',
    description: 'Integrações necessárias, maturidade de dados e novas entidades.',
    questions: [
      {
        id: 'C_fontes',
        label: 'Essa ideia depende de alguma informação que já existe em algum sistema da empresa? Qual?',
        placeholder: 'Ex: ERP Linx/Apollo, CRM Salesforce, planilhas no Excel, WhatsApp...',
        example: 'ex: Depende dos dados do veículo e cliente já cadastrados no ERP.',
        aiExtraction: 'Fontes de dados existentes e necessidade de integração com sistemas legados.',
      },
      {
        id: 'C_qualidade',
        label: 'Essa informação já está organizada e confiável, ou costuma vir bagunçada/incompleta?',
        placeholder: 'Ex: Dados cadastrais são bons, mas observações vêm desorganizadas...',
        example: 'ex: O cadastro é confiável, mas as fotos ficam soltas no WhatsApp particular.',
        aiExtraction: 'Qualidade e maturidade dos dados — nível de esforço de tratamento necessário.',
      },
      {
        id: 'C_novas_informacoes',
        label: 'A ideia vai gerar informações novas que precisam ficar guardadas?',
        placeholder: 'Ex: Fotos de avarias, histórico de aprovação, registro com data e hora...',
        example: 'ex: Sim, fotos vistoriadas com carimbo de horário e assinatura digital.',
        aiExtraction: 'Necessidade de banco de dados e modelagem de entidades.',
      },
    ],
  },
  {
    id: 'block-d',
    letter: 'D',
    title: 'Sobre Urgência da Informação',
    description: 'Regime de processamento em tempo real versus atualizações periódicas.',
    questions: [
      {
        id: 'D_tempo_real',
        label: 'A informação precisa aparecer na hora (tempo real), ou pode ser atualizada uma vez por dia?',
        placeholder: 'Ex: Na hora exata que o cliente aprovar / Pode ser um lote diário à noite...',
        example: 'ex: Na hora exata, para o mecânico já iniciar o reparo no elevador.',
        aiExtraction: 'Define se a solução precisa de processamento em tempo real (Websockets) ou em lote (batch).',
      },
    ],
  },
  {
    id: 'block-e',
    letter: 'E',
    title: 'Sobre Segurança e Acesso',
    description: 'Tratamento de dados pessoais (LGPD) e níveis de autorização.',
    questions: [
      {
        id: 'E_dados_sensiveis',
        label: 'Essa solução vai lidar com dados sensíveis de clientes (CPF, telefone, placa, pagamentos)?',
        placeholder: 'Ex: Nome e telefone para envio de link; dados de cartão...',
        example: 'ex: Sim, telefone celular e placa do veículo (requer conformidade LGPD).',
        aiExtraction: 'Necessidade de tratamento de dados pessoais (LGPD) e controles de segurança.',
      },
      {
        id: 'E_permissoes',
        label: 'Todo mundo pode ver as mesmas coisas ou precisa ter níveis diferentes de acesso?',
        placeholder: 'Ex: Mecânico só vê ordem de serviço; gerente vê custos e margem...',
        example: 'ex: Níveis diferentes: mecânico vê serviço; gerente vê relatórios financeiros.',
        aiExtraction: 'Requisitos de permissões e perfis de acesso (Row Level Security).',
      },
    ],
  },
  {
    id: 'block-f',
    letter: 'F',
    title: 'Sobre o Formato da Solução',
    description: 'Standalone versus integrado, e necessidade de suporte offline.',
    questions: [
      {
        id: 'F_formato',
        label: 'Você imagina essa solução como uma tela nova separada, ou algo dentro de um sistema existente?',
        placeholder: 'Ex: Um aplicativo/site próprio e independente...',
        example: 'ex: Uma aplicação web moderna e rápida, acessível pelo navegador.',
        aiExtraction: 'Define se será um produto standalone ou uma extensão de sistema existente.',
      },
      {
        id: 'F_offline',
        label: 'Existe algum local sem internet estável onde essa solução precisa funcionar?',
        placeholder: 'Ex: No pátio de lavagem e no subsolo o sinal cai...',
        example: 'ex: Sim, salvar rascunho temporário caso o Wi-Fi oscile no pátio da oficina.',
        aiExtraction: 'Necessidade de funcionamento offline e sincronização posterior.',
      },
    ],
  },
  {
    id: 'block-g',
    letter: 'G',
    title: 'Sobre o Processo Atual',
    description: 'Mapeamento do fluxo de trabalho e identificação precisa do gargalo.',
    questions: [
      {
        id: 'G_passo_a_passo',
        label: 'Hoje, sem essa solução, como esse trabalho é feito? Descreva o passo a passo.',
        placeholder: 'Ex: Passo 1: Recebo em papel; Passo 2: Digito no sistema; Passo 3: Ligo...',
        example: 'ex: O consultor anota em prancheta de papel, fotografa com celular próprio e digita no ERP.',
        aiExtraction: 'Mapeamento do fluxo atual — base fundamental para desenhar a nova solução.',
      },
      {
        id: 'G_gargalo',
        label: 'Qual parte desse processo mais trava, atrasa ou gera reclamação?',
        placeholder: 'Ex: Ficar esperando o cliente responder ou papel sumir...',
        example: 'ex: Atraso de horas para o cliente aprovar o orçamento e elevadores ficarem ocupados.',
        aiExtraction: 'Identificação do gargalo principal a ser resolvido pela aplicação.',
      },
    ],
  },
  {
    id: 'block-h',
    letter: 'H',
    title: 'Sobre o Resultado Esperado',
    description: 'Transformação projetada em 3 meses e indicadores chave de sucesso.',
    questions: [
      {
        id: 'H_mudancas',
        label: 'Se essa ideia der certo, o que vai estar diferente daqui a 3 meses? Como saberá que funcionou?',
        placeholder: 'Ex: Reduzir tempo de espera de 4h para 20min; zero papel na oficina...',
        example: 'ex: Tempo de aprovação cair para menos de 30 minutos e fim do papel na oficina.',
        aiExtraction: 'Indicadores de sucesso e proposta de valor para a apresentação comercial.',
      },
      {
        id: 'H_metricas',
        label: 'Quais métricas você acompanharia para comprovar o sucesso?',
        placeholder: 'Ex: Horas de elevador ocupado, nota de satisfação (NPS), volume de orçamentos...',
        example: 'ex: Tempo médio de OS concluída e índice de satisfação do cliente.',
        aiExtraction: 'Métricas de negócio para justificar priorização e investimento.',
      },
    ],
  },
  {
    id: 'block-i',
    letter: 'I',
    title: 'Sobre Alinhamento Estratégico',
    description: 'Conexão com os objetivos de negócio da empresa.',
    questions: [
      {
        id: 'I_objetivos',
        label: 'Você acha que essa ideia se conecta com algum objetivo maior da empresa hoje?',
        placeholder: 'Ex: Reduzir custos, acelerar atendimento, bater meta de peças, digitalizar a empresa...',
        example: 'ex: Conecta diretamente com a meta de reduzir tempo de OS e aumentar faturamento de pós-venda.',
        aiExtraction: 'Sinal inicial para a IA cruzar e calcular aderência às metas estratégicas.',
      },
    ],
  },
];
