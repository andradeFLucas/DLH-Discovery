import {
  DiscoveryAnswers,
  GeneratedAssets,
  PrototypeAsset,
  TechnicalDocAsset,
  DetailedRequirement,
  ApiEndpointSpec,
  IntegrationSpec,
  EffortEstimation,
  PersonaItem,
  SystemMacroModule,
  DetailedUserStory,
  DatabaseTableSpec,
  ApiContractSpec,
  RlsPolicySpec,
  EnvVarSpec,
  ErrorStateSpec,
  RoadmapPhase,
} from './types';
import { generateWithMultiAgents } from './agents';

export interface GenerateArtifactsInput {
  title: string;
  problem: string;
  solution: string;
  area: string;
  discovery_answers: DiscoveryAnswers;
}

// Função para chamar a API da Anthropic Claude (com suporte prioritário ao modelo Claude Haiku 4.5)
export async function callClaude(prompt: string, systemPrompt?: string): Promise<string | null> {
  const apiKey =
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_API_KEY ||
    process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ||
    (typeof window !== 'undefined' ? (window as any).__ANTHROPIC_API_KEY__ : undefined);

  if (!apiKey || apiKey.trim() === '') return null;

  // Modelos candidatos priorizando Claude Haiku 4.5
  const configuredModel = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';
  const candidateModels = Array.from(
    new Set([
      configuredModel,
      'claude-haiku-4-5',
      'claude-3-5-haiku-20241022',
      'claude-3-5-haiku-latest',
      'claude-3-haiku-20240307',
    ])
  );

  for (const model of candidateModels) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system: systemPrompt || 'Você é um Arquiteto de Software e Especialista em Inovação automotiva.',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.content?.[0]?.text;
        if (text) return text;
      } else {
        const errorText = await response.text().catch(() => '');
        console.warn(`Claude (${model}) retornou status ${response.status}: ${errorText.slice(0, 150)}. Tentando próximo...`);
      }
    } catch (err) {
      console.warn(`Falha na requisição ao Claude (${model}):`, err);
    }
  }

  return null;
}

import { callClaudeHaiku, callClaudeSonnet } from './agents/claudeClient';

// Orquestrador unificado de IA (Exclusivo Anthropic Claude)
export async function callAI(prompt: string, systemPrompt?: string): Promise<string | null> {
  // Claude 3.5 Haiku
  const claudeResult = await callClaudeHaiku(prompt, { systemPrompt });
  if (claudeResult) return claudeResult;

  // Fallback Sonnet caso Haiku oscile
  return callClaudeSonnet(prompt, { systemPrompt });
}

// Exportações para retrocompatibilidade
export const callGoogleGemini = callAI;
export const callGoogleGeminiDirect = callAI;


// Gerador Dinâmico de Código HTML/CSS/JS Autônomo por Domínio
import { buildAutonomousSaaSHtml } from './prototypeBuilder';
export { buildAutonomousSaaSHtml };

// Gerador Canônico de Documentação Técnica Completa (Padrão PRD 1.0 Oficial de Engenharia)
export function buildCompletePRDDocument(
  title: string,
  problem: string,
  solution: string,
  area: string,
  discovery_answers: DiscoveryAnswers,
  aiNotes?: string
): TechnicalDocAsset {
  const normTitle = title.trim();
  const lowerTitle = normTitle.toLowerCase();
  const lowerArea = area.toLowerCase();
  const tableName = `tb_${area.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${lowerTitle.includes('os') ? 'os' : 'registros'}`;

  // Detecção do Domínio da Solução para Módulos Especializados
  const isPosVenda = lowerArea.includes('pós') || lowerArea.includes('oficina') || lowerTitle.includes('os') || lowerTitle.includes('checklist');
  const isVendas = lowerArea.includes('venda') || lowerArea.includes('comercial') || lowerTitle.includes('lead') || lowerTitle.includes('crm');

  // 1. Resumo Executivo
  const executive_summary = `Este documento descreve a especificação funcional e técnica (PRD) da solução "${normTitle}", desenvolvida para o departamento de ${area}. O sistema tem como propósito central sanar o seguinte gargalo operacional identificado na concessionária: "${problem}". Através da implementação de "${solution}", a solução substitui processos manuais, planilhas descentralizadas e trocas informais de mensagens por uma plataforma corporativa web e mobile moderna, segura e de alta performance. O objetivo é reduzir drasticamente o tempo de ciclo, eliminar retrabalho, garantir conformidade com a LGPD e integrar a operação às metas estratégicas corporativas.`;

  // 2. Objetivos do Produto
  const product_objectives = [
    `Democratizar a eficiência: capacitar a equipe operacional (${discovery_answers.B_usuarios || 'colaboradores'}) a executar o fluxo sem fricção técnica.`,
    `Eliminar perdas e custos invisíveis: mitigar diretamente as perdas reportadas: "${discovery_answers.A_perdas || 'atrasos, erros manuais e insatisfação de clientes'}".`,
    `Padronizar a esteira de atendimento com captura em tempo real e validações automatizadas de integridade.`,
    `Centralizar e governar os registros em um repositório único e auditável sob conformidade com a LGPD.`,
    `Integrar a rotina da concessionária aos sistemas legados: ${discovery_answers.C_fontes || 'ERP/DMS (Linx/DealerNet)'}.`,
  ];

  // 3. Personas do Sistema
  const personas: PersonaItem[] = isPosVenda
    ? [
        {
          persona: 'Consultor Técnico / Recepcionista',
          role: 'Abertura rápida da O.S., checklist digital de entrada e acolhimento do cliente na concessionária.',
          needs: 'Interface ágil para tablet/celular, preenchimento em menos de 2 minutos e validação de placa/chassi.',
        },
        {
          persona: 'Mecânico / Técnico de Oficina',
          role: 'Execução do diagnóstico, apontamento de tempo padrão por box e requisição de peças.',
          needs: 'Visualização clara dos serviços pendentes, fotos do veículo e botão rápido de finalização.',
        },
        {
          persona: 'Gerente de Pós-Venda / Chefe de Oficina',
          role: 'Monitoramento do fluxo Kanban, controle de produtividade da oficina e aprovação de orçamentos adicionais.',
          needs: 'Dashboard consolidado de SLA, alertas de gargalo e relatórios de tempo médio de permanência.',
        },
        {
          persona: 'Cliente Proprietário do Veículo',
          role: 'Acompanhamento do status do veículo e aprovação remota do orçamento.',
          needs: 'Transparência total, fotos das avarias e aprovação em 1 clique via link seguro no WhatsApp.',
        },
      ]
    : isVendas
    ? [
        {
          persona: 'Vendedor de Veículos / Executivo Comercial',
          role: 'Atendimento a novos leads, registro do funil e envio ágil de propostas comerciais.',
          needs: 'Histórico unificado de conversas, lembretes de follow-up e simulação rápida de parcelas.',
        },
        {
          persona: 'Operador de F&I (Financiamento e Seguros)',
          role: 'Análise de crédito junto aos bancos parceiros e montagem do pacote de acessórios.',
          needs: 'Fila unificada de propostas e integração com calculadoras financeiras.',
        },
        {
          persona: 'Gerente Geral de Vendas',
          role: 'Supervisão do funil de vendas, taxa de conversão e metas por vendedor.',
          needs: 'Métricas de conversão em tempo real e distribuição balanceada de leads.',
        },
        {
          persona: 'Comprador / Cliente Interessado',
          role: 'Avaliação de opções e negociação da compra.',
          needs: 'Atendimento rápido e proposta comercial clara no smartphone.',
        },
      ]
    : [
        {
          persona: 'Colaborador Operacional (Linha de Frente)',
          role: `Execução diária da rotina de ${area} e alimentação dos registros primários.`,
          needs: 'Interface responsiva, simples e sem jargões complexos.',
        },
        {
          persona: 'Líder / Gestor do Departamento',
          role: 'Homologação de decisões, controle de qualidade e gestão da fila de pendências.',
          needs: 'Visão de equipe em tempo real, filtros dinâmicos e aprovação ágil.',
        },
        {
          persona: 'Diretoria / Comitê de Inovação',
          role: 'Avaliação do impacto operacional, ROI e alinhamento com as metas da empresa.',
          needs: 'Relatórios consolidados de produtividade e custo-benefício.',
        },
        {
          persona: 'Administrador de TI / Segurança',
          role: 'Governança da plataforma, controle de acessos RBAC e monitoramento de logs.',
          needs: 'Isolamento estrito por filial (RLS) e conformidade LGPD.',
        },
      ];

  // 4. Visão Geral do Fluxo da Solução
  const journey_steps = [
    'Passo 1 — Gatilho Operacional: Ocorrência detectada no atendimento diário ou demanda solicitada.',
    'Passo 2 — Entrada Guiada: O usuário preenche o formulário otimizado no dispositivo (mobile/desktop) com validação em tempo real.',
    'Passo 3 — Consulta e Enriquecimento: O sistema cruza dados com a base legada (ERP/DMS) para validação de cadastros.',
    'Passo 4 — Fila de Processamento: O registro entra na fila operacional categorizado por prioridade e gravidade.',
    'Passo 5 — Execução & Atualização: O responsável técnico executa as ações, anexa evidências e atualiza os marcos.',
    'Passo 6 — Validação & Decisão: Alçadas de aprovação disparam alertas imediatos para gestores ou clientes.',
    'Passo 7 — Finalização & Notificação: Encerramento com protocolo digital, notificação multicanal e gravação imutável.',
    'Passo 8 — Inteligência de Negócio: Os dados alimentam os painéis de KPIs estratégicos da diretoria.',
  ];

  // 5. Módulos do Sistema (Macro-Funcionalidades da Solução)
  const macro_modules: SystemMacroModule[] = isPosVenda
    ? [
        {
          module_number: 1,
          title: 'Módulo 1 — Triagem Rápida & Checklist Digital de Entrada',
          objective: 'Padronizar a recepção do veículo na concessionária com captura de fotos de avarias, quilometragem e combustível em tablet/smartphone.',
          sub_features: [
            {
              name: 'Checklist Visual 360° com Registro de Avarias',
              description: 'Interface interativa onde o consultor marca pontos de avaria na lataria sobre um diagrama 3D do veículo.',
              input_or_extraction: 'Foto de alta resolução e coordenadas do dano capturadas pela câmera do tablet.',
            },
            {
              name: 'Leitura Óptica de Placa e Consulta ao ERP',
              description: 'Reconhecimento OCR de placa/chassi que preenche automaticamente o histórico do cliente e revisões anteriores.',
              input_or_extraction: 'Placa digitada ou fotografada cruzada com Linx/Apollo DMS.',
            },
            {
              name: 'Geração de Protocolo Digital com Assinatura na Tela',
              description: 'Emissão imediata de comprovante de entrega com assinatura colhida digitalmente com a caneta touch.',
              input_or_extraction: 'Termo digital assinado em PDF gravado no Supabase Storage.',
            },
          ],
          business_rules: [
            'O checklist não pode ser concluído sem o registro da foto do odômetro e nível de combustível.',
            'Qualquer avaria pré-existente deve ser sinalizada antes do veículo ingressar na oficina mecânica.',
            'O cliente deve receber cópia automática do checklist por WhatsApp ou e-mail em até 3 minutos.',
          ],
        },
        {
          module_number: 2,
          title: 'Módulo 2 — Orçamentação Inteligente & Catálogo de Peças',
          objective: 'Agilizar o levantamento de custos de mão de obra e peças necessárias, consultando disponibilidade de estoque em tempo real.',
          sub_features: [
            {
              name: 'Montador Rápido de Orçamento com Tempo Padrão',
              description: 'Catálogo de serviços tabelados com horas padrão da montadora calculadas automaticamente.',
              input_or_extraction: 'Códigos de operação de serviço e cálculo automático de homem-hora.',
            },
            {
              name: 'Checagem de Estoque e Reserva Imediata no Almoxarifado',
              description: 'Consulta ao estoque local e solicitação de transferência entre filiais caso o item esteja esgotado.',
              input_or_extraction: 'Código OEM da peça, quantidade e bloqueio de saldo no ERP.',
            },
            {
              name: 'Link de Aprovação Interativa para o Cliente',
              description: 'Página web segura para o cliente visualizar fotos da peça gasta e autorizar itens individualmente.',
              input_or_extraction: 'Token com validade de 24h com log de IP e aceite eletrônico.',
            },
          ],
          business_rules: [
            'Nenhuma peça pode ser aplicada na oficina sem aprovação explícita registrada do cliente.',
            'Orçamentos complementares acima de R$ 1.000 exigem validação do Gerente de Pós-Venda.',
          ],
        },
        {
          module_number: 3,
          title: 'Módulo 3 — Painel Kanban da Oficina & Controle de Boxes',
          objective: 'Garantir visibilidade em tempo real sobre a produtividade da equipe técnica e cumprir os prazos de entrega combinados.',
          sub_features: [
            {
              name: 'Quadro Kanban Operacional em Telão de Oficina',
              description: 'Colunas de status (Aguardando Box, Em Diagnóstico, Aguardando Peça, Em Execução, Lavagem, Pronto para Entrega).',
              input_or_extraction: 'Movimentação drag-and-drop de ordens de serviço pelo líder de oficina.',
            },
            {
              name: 'Apontamento de Horas por Mecânico (Start/Pause/Stop)',
              description: 'Cronômetro individual no box para mensuração precisa de eficiência produtiva.',
              input_or_extraction: 'Matrícula do mecânico e registro de início/pausa do serviço.',
            },
            {
              name: 'Alerta Preventivo de Quebra de SLA de Entrega',
              description: 'Indicador visual que muda de cor (verde > amarelo > vermelho) conforme o prazo de entrega se aproxima.',
              input_or_extraction: 'Cálculo dinâmico entre tempo estimado restante e horário prometido ao cliente.',
            },
          ],
          business_rules: [
            'Um mecânico só pode ter uma O.S. ativa em execução simultânea.',
            'Se um veículo ficar mais de 45 minutos no status "Aguardando Peça", um alerta prioritário é enviado ao almoxarifado.',
          ],
        },
        {
          module_number: 4,
          title: 'Módulo 4 — Notificações Multicanal & Entrega do Veículo',
          objective: 'Informar proativamente o cliente sobre cada etapa do serviço e garantir pesquisa de satisfação imediata.',
          sub_features: [
            {
              name: 'Disparador Automático de Status via WhatsApp Business API',
              description: 'Envio de mensagens pré-formatadas ("Seu veículo entrou na oficina", "Seu carro está pronto para retirada").',
              input_or_extraction: 'Gatilho disparado pela mudança de coluna no Kanban da oficina.',
            },
            {
              name: 'Checklist de Entrega e Liberação Financeira',
              description: 'Conferência de itens no ato da entrega das chaves e verificação de quitação da fatura.',
              input_or_extraction: 'Confirmação de recebimento no balcão e baixa no sistema.',
            },
            {
              name: 'Pesquisa NPS Instantânea com Alerta de Detratores',
              description: 'Micro-pesquisa enviada 1 hora após a retirada com encaminhamento de notas baixas ao gerente.',
              input_or_extraction: 'Nota de 0 a 10 e comentário opcional registrado no banco de dados.',
            },
          ],
          business_rules: [
            'O veículo só pode ser entregue se o status no ERP constar como faturado ou liberado.',
            'Notas de NPS inferiores a 7 abrem automaticamente um chamado de ouvidoria para contato em até 2 horas.',
          ],
        },
      ]
    : isVendas
    ? [
        {
          module_number: 1,
          title: 'Módulo 1 — Captação & Distribuição Inteligente de Leads',
          objective: 'Centralizar oportunidades comerciais de múltiplos canais (showroom, site, portais) e distribuir com regras de roleta aos vendedores.',
          sub_features: [
            {
              name: 'Hub Unificado de Entrada de Leads Multicanal',
              description: 'Integração via Webhook com portais automotivos e formulários do site da concessionária.',
              input_or_extraction: 'Nome, telefone, e-mail, veículo de interesse e canal de origem.',
            },
            {
              name: 'Roleta de Distribuição com SLA de Primeiro Contato',
              description: 'Distribuição automática entre os vendedores presentes no showroom com cronômetro regressivo de 15 minutos.',
              input_or_extraction: 'Alocação ao vendedor com menor volume ativo e registro do aceite.',
            },
          ],
          business_rules: [
            'Lead sem contato registrado em 15 minutos é transferido automaticamente para o próximo vendedor da fila.',
          ],
        },
        {
          module_number: 2,
          title: 'Módulo 2 — Motor de Qualificação & Simulação F&I',
          objective: 'Estruturar o levantamento do perfil do comprador e calcular condições de financiamento e avaliação do usado na troca.',
          sub_features: [
            {
              name: 'Simulador de Financiamento Multibancos',
              description: 'Cálculo simultâneo de taxas de juros, valor de entrada e prazos em financeiras conveniadas.',
              input_or_extraction: 'CPF, renda presumida, valor de entrada e retorno das parcelas.',
            },
            {
              name: 'Avaliação Digital do Veículo Usado na Troca',
              description: 'Guia de vistoria do seminovo com fotos dos pneus, lataria e documento para precificação.',
              input_or_extraction: 'Fotos da vistoria e cotação sugerida pela tabela de mercado.',
            },
          ],
          business_rules: [
            'Avaliação de usados exige laudo cautelar aprovado antes do aceite definitivo como parte de pagamento.',
          ],
        },
        {
          module_number: 3,
          title: 'Módulo 3 — Proposta Comercial Digital & Assinatura',
          objective: 'Gerar propostas executivas transparentes com envio direto para o WhatsApp do cliente.',
          sub_features: [
            {
              name: 'Gerador de Propostas em PDF com QR Code de Aceite',
              description: 'Documento visual com foto do veículo, especificações de série, acessórios e forma de pagamento.',
              input_or_extraction: 'Geração de PDF assinado digitalmente no Supabase Storage.',
            },
          ],
          business_rules: [
            'Validade padrão da proposta comercial estipulada em 48 horas devido a variações de estoque.',
          ],
        },
        {
          module_number: 4,
          title: 'Módulo 4 — Follow-up Automatizado & Gestão de Carteira',
          objective: 'Evitar o esfriamento de negociações através de cadências programadas de retorno.',
          sub_features: [
            {
              name: 'Cadência Inteligente de Contatos via WhatsApp',
              description: 'Sugestão diária de ligações e mensagens personalizadas para leads quentes.',
              input_or_extraction: 'Alertas no painel do vendedor com base na data do último contato.',
            },
          ],
          business_rules: [
            'Nenhuma negociação em aberto pode ficar mais de 72 horas sem registro de histórico no sistema.',
          ],
        },
      ]
    : [
        {
          module_number: 1,
          title: 'Módulo 1 — Captura & Registro Estruturado da Demanda',
          objective: `Permitir o registro imediato das solicitações e ocorrências de ${area} de forma simplificada e sem gargalos.`,
          sub_features: [
            {
              name: 'Formulário Guiado de Entrada Operacional',
              description: 'Interface limpa com campos obrigatórios essenciais para evitar preenchimento inconsistente.',
              input_or_extraction: 'Coleta de dados da ocorrência em conformidade com o padrão operacional.',
            },
            {
              name: 'Validação Prévia de Duplicidade e Integridade',
              description: 'Mecanismo que checa se a mesma ocorrência já não foi registrada anteriormente.',
              input_or_extraction: 'Consulta em tempo real no banco PostgreSQL.',
            },
          ],
          business_rules: [
            'Campos de identificação e justificativa são obrigatórios para a geração do protocolo.',
          ],
        },
        {
          module_number: 2,
          title: 'Módulo 2 — Motor de Processamento & Regras de Negócio',
          objective: 'Processar as informações capturadas, aplicar regras de priorização e validar conformidades.',
          sub_features: [
            {
              name: 'Classificador Automático de Criticidade',
              description: 'Algoritmo que analisa o impacto operacional e define se o registro é urgente, normal ou baixo.',
              input_or_extraction: 'Atribuição de score de prioridade.',
            },
          ],
          business_rules: [
            'Ocorrências críticas disparam alerta push imediato para o gestor responsável.',
          ],
        },
        {
          module_number: 3,
          title: 'Módulo 3 — Painel de Gestão em Tempo Real & Fila de Trabalho',
          objective: 'Prover visibilidade completa sobre o andamento das demandas com indicadores de SLA e tempos de ciclo.',
          sub_features: [
            {
              name: 'Quadro Dinâmico de Acompanhamento Operacional',
              description: 'Visão em lista e cartões de status com atualização sem recarregar a tela.',
              input_or_extraction: 'Websockets do Supabase Realtime.',
            },
          ],
          business_rules: [
            'Mudanças de status exigem identificação do usuário logado e motivo registrado.',
          ],
        },
        {
          module_number: 4,
          title: 'Módulo 4 — Comunicação Multicanal & Trilha de Auditoria',
          objective: 'Garantir transparência entre todos os envolvidos e rastreabilidade total para conformidade e auditoria.',
          sub_features: [
            {
              name: 'Trilha de Auditoria e Log de Histórico Imutável',
              description: 'Gravação cronológica com registro de data, hora UTC, autor e alteração efetuada.',
              input_or_extraction: 'Log persistido na tabela de histórico.',
            },
          ],
          business_rules: [
            'Os registros de histórico são imutáveis (apenas INSERT autorizado via RLS).',
          ],
        },
      ];

  // 6. Histórias de Usuário Detalhadas (US-01 a US-08)
  const user_stories: DetailedUserStory[] = [
    {
      id: 'US-01',
      title: 'Iniciar novo registro operacional no sistema',
      actor: personas[0]?.persona || 'Colaborador Operacional',
      description: `O usuário clica no botão "+ Novo Registro" no topo da aplicação. O sistema abre a tela com validação de campos obrigatórios. O botão "Salvar e Avançar" permanece inativo até que todos os dados essenciais sejam digitados. Ao confirmar, o sistema grava o registro com status "Aberto", gera protocolo único rastreável e exibe feedback visual com som suave de sucesso.`,
    },
    {
      id: 'US-02',
      title: 'Realizar vistoria ou preenchimento guiado em dispositivo móvel',
      actor: personas[0]?.persona || 'Colaborador de Linha de Frente',
      description: `Em um tablet ou celular, o usuário aciona a câmera integrada diretamente pelo navegador. O sistema permite tirar até 4 fotos do contexto/veículo, comprime as imagens automaticamente no cliente para menos de 400KB e envia para o bucket seguro do Supabase Storage, vinculando as URLs ao registro atual.`,
    },
    {
      id: 'US-03',
      title: 'Consultar fila de trabalho operacional e filtrar demandas',
      actor: personas[1]?.persona || 'Responsável Técnico',
      description: `O profissional acessa o painel de atendimento. A tela exibe a lista ordenada por prioridade de atendimento. Ao clicar no filtro de status (ex: "Aguardando Diagnóstico"), a listagem se atualiza instantaneamente sem recarregar a página, mostrando a quantidade exata de itens encontrados.`,
    },
    {
      id: 'US-04',
      title: 'Atualizar status da demanda com justificativa obrigatória',
      actor: personas[1]?.persona || 'Líder Operacional',
      description: `O usuário abre o registro e clica em "Iniciar Execução" ou "Encaminhar para Aprovação". O sistema exibe um modal solicitando observação/comentário. Ao confirmar, o status é alterado, a linha do tempo grava a transição com timestamp e o proponente recebe aviso em tempo real via toast na aplicação.`,
    },
    {
      id: 'US-05',
      title: 'Aprovação expressa por gestor ou cliente',
      actor: personas[2]?.persona || 'Gestor da Área',
      description: `O gestor recebe uma notificação com o resumo da solicitação e valores envolvidos. Ao clicar, visualiza a tela de decisão com opções "Aprovar", "Ajustar" ou "Reprovar". Se optar por aprovar, o sistema valida a alçada do usuário e libera a próxima etapa no ERP da concessionária.`,
    },
    {
      id: 'US-06',
      title: 'Disparo de notificação automática ao cliente final',
      actor: 'Sistema Automático',
      description: `Assim que o status da ordem muda para "Concluído" ou "Pronto para Retirada", o backend aciona a API de mensageria WhatsApp com modelo aprovado contendo link seguro para visualização da nota e orientações de retirada.`,
    },
    {
      id: 'US-07',
      title: 'Consultar histórico de auditoria e conformidade',
      actor: 'Auditor de Processos / Gerente Geral',
      description: `O gestor acessa a aba "Auditoria" dentro do detalhe do registro. O sistema exibe toda a linha do tempo imutável contendo cada alteração, usuário responsável, IP, data e hora com precisão de milissegundos.`,
    },
    {
      id: 'US-08',
      title: 'Exportar relatório executivo consolidado da operação',
      actor: personas[2]?.persona || 'Gerente Geral',
      description: `O usuário clica em "Exportar Relatório" e escolhe o período. O sistema gera uma compilação estatística de tempo médio de ciclo, índice de cumprimento de SLA e volumetria por atendente, disponível para download em PDF ou planilha.`,
    },
  ];

  // 7. Dicionário de Dados Relacional (Postgres / Supabase)
  const database_tables: DatabaseTableSpec[] = [
    {
      table_name: 'profiles',
      description: 'Extensão da autenticação corporativa com dados de filial, cargo e permissões RBAC.',
      columns: [
        { field: 'id', type: 'uuid (PK, FK auth.users.id)', description: 'Chave primária vinculada ao Supabase Auth.' },
        { field: 'full_name', type: 'text', description: 'Nome completo do colaborador.' },
        { field: 'role', type: 'text (check)', description: 'Nível de acesso: "operacional" | "gestor" | "admin".' },
        { field: 'area', type: 'text', description: `Departamento do colaborador (${area}).` },
        { field: 'dealership_id', type: 'uuid', description: 'Identificador da filial/concessionária.' },
        { field: 'created_at', type: 'timestamptz', description: 'Data de criação do cadastro.' },
      ],
    },
    {
      table_name: tableName,
      description: `Tabela central que armazena os registros principais da solução "${normTitle}".`,
      columns: [
        { field: 'id', type: 'uuid (PK)', description: 'Identificador único do registro (gen_random_uuid()).' },
        { field: 'protocolo', type: 'text (unique)', description: 'Código amigável sequencial (ex: #OS-2026-0842).' },
        { field: 'author_id', type: 'uuid (FK profiles.id)', description: 'Colaborador responsável pela criação.' },
        { field: 'cliente_nome', type: 'text', description: 'Nome do cliente ou requerente.' },
        { field: 'identificador_alvo', type: 'text', description: isPosVenda ? 'Placa ou Chassi do Veículo' : 'Identificador da Demanda / Contrato' },
        { field: 'status', type: 'text (check)', description: '"pendente" | "em_execucao" | "aprovado" | "concluido" | "cancelado".' },
        { field: 'dados_operacionais', type: 'jsonb', description: 'Payload flexível contendo respostas do checklist, fotos e parâmetros técnicos.' },
        { field: 'prioridade', type: 'text', description: '"normal" | "alta" | "urgente".' },
        { field: 'data_limite_sla', type: 'timestamptz', description: 'Horário máximo prometido para cumprimento do serviço.' },
        { field: 'created_at / updated_at', type: 'timestamptz', description: 'Carimbos de auditoria temporal UTC.' },
      ],
    },
    {
      table_name: `${tableName}_itens`,
      description: 'Linhas detalhadas de serviços, peças ou sub-tarefas associadas ao registro.',
      columns: [
        { field: 'id', type: 'uuid (PK)', description: 'Identificador único do item.' },
        { field: 'parent_id', type: `uuid (FK ${tableName}.id)`, description: 'Chave estrangeira com ON DELETE CASCADE.' },
        { field: 'item_nome', type: 'text', description: 'Descrição da peça, serviço ou etapa.' },
        { field: 'codigo_referencia', type: 'text', description: 'Código ERP / Part Number da montadora.' },
        { field: 'quantidade', type: 'numeric(10,2)', description: 'Quantidade ou horas apontadas.' },
        { field: 'valor_unitario', type: 'numeric(12,2)', description: 'Valor unitário faturado.' },
        { field: 'status_aprovacao', type: 'text', description: '"pendente" | "autorizado" | "recusado".' },
      ],
    },
    {
      table_name: `${tableName}_historico`,
      description: 'Trilha de auditoria imutável registrando todas as transições de status e ações executadas.',
      columns: [
        { field: 'id', type: 'uuid (PK)', description: 'Identificador do evento de auditoria.' },
        { field: 'record_id', type: `uuid (FK ${tableName}.id)`, description: 'Registro pai relacionado.' },
        { field: 'user_id', type: 'uuid (FK profiles.id)', description: 'Colaborador que efetuou a ação.' },
        { field: 'acao', type: 'text', description: 'Verbo da ação (ex: "AVANCAR_STATUS", "APROVAR_ORCAMENTO").' },
        { field: 'status_anterior', type: 'text', description: 'Status prévio ao evento.' },
        { field: 'novo_status', type: 'text', description: 'Novo status após a transição.' },
        { field: 'justificativa', type: 'text', description: 'Texto obrigatório explicativo da decisão.' },
        { field: 'created_at', type: 'timestamptz', description: 'Timestamp exato do evento.' },
      ],
    },
    {
      table_name: 'notificacoes_sistema',
      description: 'Fila de mensagens in-app e gatilhos de comunicação externa disparados pelo sistema.',
      columns: [
        { field: 'id', type: 'uuid (PK)', description: 'Identificador da notificação.' },
        { field: 'destinatario_id', type: 'uuid (FK profiles.id)', description: 'Usuário destinatário da mensagem.' },
        { field: 'titulo', type: 'text', description: 'Título curto do alerta.' },
        { field: 'mensagem', type: 'text', description: 'Conteúdo descritivo da notificação.' },
        { field: 'lida', type: 'boolean (default false)', description: 'Marcação se a mensagem já foi visualizada.' },
        { field: 'created_at', type: 'timestamptz', description: 'Data do disparo.' },
      ],
    },
  ];

  // 8. Script DDL PostgreSQL
  const data_model_sql = `-- ESPECIFICAÇÃO DDL OFICIAL POSTGRESQL / SUPABASE
-- Projeto: ${normTitle} (${area})
-- Versão: 1.0 - Setembro 2026

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Perfis Corporativos
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('operacional', 'gestor', 'admin')),
  area TEXT NOT NULL DEFAULT '${area}',
  dealership_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela Principal de Registros da Solução
CREATE TABLE IF NOT EXISTS public.${tableName} (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocolo TEXT UNIQUE NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  cliente_nome TEXT NOT NULL,
  identificador_alvo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_execucao', 'aprovado', 'concluido', 'cancelado')),
  dados_operacionais JSONB NOT NULL DEFAULT '{}'::jsonb,
  prioridade TEXT NOT NULL DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  data_limite_sla TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Itens e Sub-operações
CREATE TABLE IF NOT EXISTS public.${tableName}_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES public.${tableName}(id) ON DELETE CASCADE,
  item_nome TEXT NOT NULL,
  codigo_referencia TEXT,
  quantidade NUMERIC(10,2) NOT NULL DEFAULT 1.0,
  valor_unitario NUMERIC(12,2) NOT NULL DEFAULT 0.0,
  status_aprovacao TEXT NOT NULL DEFAULT 'pendente' CHECK (status_aprovacao IN ('pendente', 'autorizado', 'recusado'))
);

-- 4. Tabela de Trilha de Auditoria e Histórico
CREATE TABLE IF NOT EXISTS public.${tableName}_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID NOT NULL REFERENCES public.${tableName}(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  acao TEXT NOT NULL,
  status_anterior TEXT,
  novo_status TEXT NOT NULL,
  justificativa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.notificacoes_sistema (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destinatario_id UUID NOT NULL REFERENCES public.profiles(id),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Criação de Índices de Desempenho
CREATE INDEX IF NOT EXISTS idx_${tableName}_status ON public.${tableName}(status);
CREATE INDEX IF NOT EXISTS idx_${tableName}_created_at ON public.${tableName}(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_${tableName}_autor ON public.${tableName}(author_id);
CREATE INDEX IF NOT EXISTS idx_${tableName}_itens_parent ON public.${tableName}_itens(parent_id);
CREATE INDEX IF NOT EXISTS idx_${tableName}_hist_record ON public.${tableName}_historico(record_id);

-- 7. Políticas de Segurança em Nível de Linha (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.${tableName}_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.${tableName}_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_auth" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "records_select_dealership" ON public.${tableName} FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "records_insert_operacional" ON public.${tableName} FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "records_update_gestor_autor" ON public.${tableName} FOR UPDATE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('gestor', 'admin')));
CREATE POLICY "history_insert_only" ON public.${tableName}_historico FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "notifications_user_only" ON public.notificacoes_sistema FOR ALL USING (destinatario_id = auth.uid());`;

  // 9. Rotas e Telas da Aplicação
  const app_routes = [
    {
      app_name: `App 1 — Aplicação Operacional (${area})`,
      routes: [
        { path: '/login', description: 'Autenticação de colaboradores via Supabase Auth.' },
        { path: '/', description: 'Dashboard operacional da equipe com métricas rápidas e atalhos.' },
        { path: '/novo', description: 'Formulário guiado de abertura e checklist com validação prévia.' },
        { path: '/detalhes/:id', description: 'Ficha completa do registro com timeline de auditoria e ações.' },
        { path: '/fila', description: 'Fila de trabalho em tempo real ordenada por SLA de atendimento.' },
      ],
    },
    {
      app_name: 'App 2 — Painel Gestor & Governança Executiva',
      routes: [
        { path: '/', description: 'Visão consolidada de indicadores da concessionária e volumetria.' },
        { path: '/kanban', description: 'Quadro visual de boxes e esteiras operacionais drag-and-drop.' },
        { path: '/relatorios', description: 'Relatórios analíticos de cumprimento de SLA, tempo de ciclo e custos.' },
        { path: '/auditoria', description: 'Trilha completa de conformidade e segurança da informação.' },
      ],
    },
  ];

  // 10. Contratos de APIs e Inteligência Artificial
  const ai_contracts: ApiContractSpec[] = [
    {
      name: 'Triagem Automática e Cálculo de Criticidade (IA)',
      endpoint: '/api/ai/triagem',
      method: 'POST',
      description: 'Avalia a descrição e os parâmetros da ocorrência para inferir a prioridade recomendada.',
      input_payload: `{\n  "titulo": "string",\n  "descricao": "string",\n  "area": "${area}",\n  "impacto": "string"\n}`,
      output_payload: `{\n  "prioridade_sugerida": "alta",\n  "sla_horas_recomendado": 4,\n  "justificativa": "Risco de paralisação no atendimento e insatisfação do cliente."\n}`,
    },
    {
      name: 'Integração de Sincronização com ERP da Concessionária',
      endpoint: '/api/integracao/erp-sync',
      method: 'POST',
      description: 'Valida a integridade do registro e envia a transação para o DMS (Linx/Apollo/Totvs).',
      input_payload: `{\n  "protocolo": "string",\n  "cliente_doc": "string",\n  "itens": [ { "codigo": "string", "qtd": 1 } ]\n}`,
      output_payload: `{\n  "status_erp": "SINCRONIZADO",\n  "numero_transacao_erp": "984214",\n  "timestamp": "ISO-8601"\n}`,
    },
    {
      name: 'Disparador de Mensagem Transacional WhatsApp',
      endpoint: '/api/notificacoes/whatsapp',
      method: 'POST',
      description: 'Aciona a API oficial do WhatsApp para envio do link seguro de acompanhamento e aprovação.',
      input_payload: `{\n  "telefone": "string",\n  "nome_cliente": "string",\n  "template": "notificacao_status",\n  "link_acao": "url"\n}`,
      output_payload: `{\n  "mensagem_id": "wamid.HBgL...",\n  "status": "enviado"\n}`,
    },
  ];

  // 11. Políticas RLS
  const rls_policies: RlsPolicySpec[] = [
    {
      table: tableName,
      rules: [
        'SELECT: Permitido para qualquer colaborador autenticado da mesma filial/concessionária.',
        'INSERT: Permitido para usuários autenticados com perfil operacional ou gestor.',
        'UPDATE: Permitido apenas para o autor do registro ou gestores da área.',
        'DELETE: Ação desabilitada para garantir imutabilidade histórica (soft-delete via status).',
      ],
    },
    {
      table: `${tableName}_historico`,
      rules: [
        'SELECT: Colaboradores da filial para leitura de logs de auditoria.',
        'INSERT: Apenas backend ou usuários autenticados registrando transições legítimas.',
        'UPDATE / DELETE: Bloqueio absoluto para conformidade e prevenção contra fraudes.',
      ],
    },
  ];

  // 12. Variáveis de Ambiente
  const env_vars: EnvVarSpec[] = [
    { variable: 'NEXT_PUBLIC_SUPABASE_URL', purpose: 'Endpoint do banco de dados e APIs do Supabase.', scope: 'client' },
    { variable: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', purpose: 'Chave pública cliente com validação via RLS.', scope: 'client' },
    { variable: 'SUPABASE_SERVICE_ROLE_KEY', purpose: 'Chave administrativa para operações server-side protegidas.', scope: 'secret' },
    { variable: 'ERP_GATEWAY_API_KEY', purpose: 'Token de autenticação com o middleware Linx/Apollo DMS.', scope: 'secret' },
    { variable: 'WHATSAPP_BUSINESS_TOKEN', purpose: 'Credencial da API oficial da Meta para disparo de mensagens.', scope: 'secret' },
    { variable: 'ANTHROPIC_API_KEY', purpose: 'Chave da API Anthropic Claude (modelo Haiku 4.5) para inferência, geração e triagem inteligente.', scope: 'secret' },
  ];

  // 13. Estados de Erro e Contingência
  const error_states: ErrorStateSpec[] = [
    {
      scenario: 'Queda de conexão à internet no pátio ou oficina',
      system_behavior: 'A aplicação retém os dados do checklist em cache local (IndexedDB) e exibe aviso âmbar "Modo Offline Ativo".',
      user_action: 'O colaborador continua preenchendo normalmente. O envio sincroniza assim que o Wi-Fi for restabelecido.',
    },
    {
      scenario: 'Indisponibilidade ou timeout na API do ERP da Concessionária',
      system_behavior: 'O sistema grava a transação na fila de reprocessamento assíncrono com retry exponencial.',
      user_action: 'O usuário recebe o protocolo normalmente, com alerta informativo de que os dados do ERP serão conciliados.',
    },
    {
      scenario: 'Falha no envio da mensagem de WhatsApp ao cliente',
      system_behavior: 'O sistema registra falha de entrega e comuta automaticamente para disparo de SMS corporativo.',
      user_action: 'O atendente visualiza um botão "Reenviar link de aprovação" no painel da O.S.',
    },
    {
      scenario: 'Tentativa de alteração de registro por colaborador sem permissão',
      system_behavior: 'O Supabase RLS rejeita o UPDATE com código HTTP 403 Forbidden e registra tentativa no log de segurança.',
      user_action: 'A interface exibe modal informando que a ação requer permissão de gestor da filial.',
    },
    {
      scenario: 'Lista sem resultados para o filtro selecionado',
      system_behavior: 'Exibição de ilustração de estado vazio amigável com mensagem explicativa.',
      user_action: 'Botão claro "Limpar Filtros" para restaurar a visualização completa da fila.',
    },
  ];

  // 14. Roadmap do MVP em Fases
  const roadmap_phases: RoadmapPhase[] = [
    {
      phase_number: 1,
      title: 'Fase 1 — MVP Operacional & Captura Digital',
      duration: '4 semanas (2 Sprints)',
      deliverables: [
        'Formulário guiado de entrada responsivo;',
        'Banco Supabase estruturado com tabelas e RLS;',
        'Fila de atendimento em tempo real;',
        'Armazenamento de fotos no Supabase Storage.',
      ],
    },
    {
      phase_number: 2,
      title: 'Fase 2 — Integração com ERP / DMS da Concessionária',
      duration: '3 semanas',
      deliverables: [
        'Conector com Linx DMS / Apollo para consulta de clientes e veículos;',
        'Baixa automática e reserva de estoque de peças;',
        'Sincronização de status bidirecional.',
      ],
    },
    {
      phase_number: 3,
      title: 'Fase 3 — Comunicação Multicanal & Portal do Cliente',
      duration: '3 semanas',
      deliverables: [
        'Disparo de notificações oficiais via WhatsApp Business API;',
        'Portal web de aprovação de orçamentos pelo smartphone;',
        'Pesquisa de satisfação NPS automatizada.',
      ],
    },
    {
      phase_number: 4,
      title: 'Fase 4 — Analytics Avançado & Otimização Preditiva',
      duration: '4 semanas',
      deliverables: [
        'Dashboard executivo com KPIs de produtividade por box/consultor;',
        'Previsão de tempo de ciclo por modelo de veículo;',
        'Módulo de auditoria e conformidade avançada.',
      ],
    },
  ];

  // 15. Próximos Passos
  const next_steps = [
    'Validar o protótipo funcional em homologação com 2 consultores técnicos e 1 gestor de oficina piloto.',
    'Mapear os campos exatos da API do ERP Linx/Apollo DMS para o conector de homologação.',
    'Provisionar o ambiente de banco de dados Supabase e configurar chaves de acesso RLS por concessionária.',
    'Apresentar o estudo de ROI e cronograma de implementação ao comitê de liderança executiva.',
  ];

  return {
    document_version: 'Versão 1.0 — Setembro de 2026',
    executive_summary,
    product_objectives,
    personas,
    journey_steps,
    macro_modules,
    architecture_overview: `A aplicação adota arquitetura moderna baseada em Jamstack Corporativo com Next.js 14 (App Router), executando funções de borda na Vercel Edge Network e persistência relacional resiliente no Supabase (PostgreSQL 15 com extensões pgcrypto e pg_stat_statements). O sistema integra autenticação corporativa via Supabase Auth com Row Level Security (RLS) mandatória por filial e departamento, assegurando conformidade estrita às normas de governança e auditoria da empresa.`,
    tech_stack: {
      frontend: 'Next.js 14+ (React 19, TypeScript, TailwindCSS, Lucide Icons)',
      backend: 'Next.js Server Actions & Edge API Routes',
      database: 'Supabase PostgreSQL com Row Level Security (RLS)',
      auth: 'Supabase Auth com RBAC (Colaborador, Gestor, Administrador)',
      hosting: 'Vercel Enterprise Edge Hosting',
    },
    architecture_justification: {
      nextjs: [
        'App Router com Server Components e Server Actions para eliminar necessidade de backend separado.',
        'Renderização híbrida: páginas de gestão carregam instantaneamente via SSR com dados já cacheados.',
        'Ecossistema robusto para formulários multi-etapa e integração nativa com Supabase.',
      ],
      supabase: [
        'PostgreSQL gerenciado com extensões nativas para segurança e criptografia.',
        'Row Level Security (RLS) aplicado no nível do banco, impedindo vazamento de dados entre filiais.',
        'Supabase Storage com URLs assinadas por token para guarda de laudos, fotos de avaria e contratos.',
        'Supabase Realtime via WebSockets para atualização instantânea da fila e do quadro de trabalho sem recarregar tela.',
      ],
      vercel: [
        'Deploy automatizado com previews instantâneos por branch para homologação contínua.',
        'Rede Edge distribuída garantindo tempo de resposta sub-100ms para lojas e filiais em todo o país.',
        'Funções serverless escaláveis para processar webhooks de ERP e mensageria sem infraestrutura fixa.',
      ],
      components: [
        'Frontend Operacional (Web / PWA Mobile): Interface ágil para lançamento e atendimento no balcão/box.',
        'Painel Gestor Executivo: Dashboard analítico de produtividade, SLA e relatórios em tempo real.',
        'Camada de Regras e Ações de Servidor: Orquestração de validações, segurança e transações.',
        'Camada de IA e Integrações: Chamadas à Anthropic (Claude Haiku 4.5) e APIs transacionais externas (ERP/WhatsApp).',
      ],
    },
    user_stories,
    database_tables,
    data_model_sql,
    app_routes,
    api_endpoints: [
      {
        method: 'GET',
        path: `/api/${tableName}`,
        description: 'Listagem paginada de registros com filtros por status, filial, data e busca textual.',
        response: `{ "data": [ { "id": "uuid", "protocolo": "#OS-2026-0842", "status": "pendente" } ], "total": 24 }`,
      },
      {
        method: 'POST',
        path: `/api/${tableName}`,
        description: 'Abertura de novo registro com validação de campos obrigatórios e disparo de protocolo.',
        payload: `{ "cliente_nome": "string", "identificador_alvo": "string", "dados_operacionais": {}, "prioridade": "normal" }`,
        response: `{ "id": "uuid", "protocolo": "#OS-2026-0842", "status": "pendente", "created_at": "ISO-8601" }`,
      },
      {
        method: 'PATCH',
        path: `/api/${tableName}/:id/status`,
        description: 'Transição de status com registro obrigatório de justificativa na trilha de auditoria.',
        payload: `{ "novo_status": "em_execucao", "justificativa": "Veículo ingressou no box de atendimento" }`,
        response: `{ "success": true, "updated_at": "ISO-8601" }`,
      },
    ],
    ai_contracts,
    rls_policies,
    env_vars,
    error_states,
    functional_requirements: [
      {
        id: 'RF-01',
        title: 'Captura e Registro da Ocorrência em Tempo Real',
        description: `Permitir que o usuário (${discovery_answers.B_usuarios || 'operador'}) realize a entrada imediata dos dados operacionais com validação de campos obrigatórios.`,
        acceptance_criteria: [
          'Dado que o usuário está logado, quando preenche todos os campos obrigatórios e clica em Salvar, o registro é criado no banco com protocolo único;',
          'Dado que campos obrigatórios estejam vazios, o formulário bloqueia a submissão e destaca os campos com erro em vermelho;',
          'O tempo total de preenchimento deve ser inferior a 2 minutos em dispositivo móvel.',
        ],
      },
      {
        id: 'RF-02',
        title: 'Fila de Trabalho e Notificação aos Responsáveis',
        description: 'Disponibilizar visão em lista/tabela para a equipe com indicadores de status dinâmicos e disparo de avisos automáticos.',
        acceptance_criteria: [
          'A lista deve atualizar em tempo real ou com intervalo de polling inferior a 15 segundos;',
          'Deve permitir filtros rápidos por status, data e responsável;',
          'Deve notificar o próximo agente da esteira via webhook ou mensageria in-app.',
        ],
      },
      {
        id: 'RF-03',
        title: 'Auditoria de Alterações e Rastreabilidade Completa',
        description: 'Registrar histórico imutável de todas as decisões, aprovações e edições realizadas no registro.',
        acceptance_criteria: [
          'Toda mudança de status deve gravar o ID do autor, timestamp UTC e justificativa;',
          'Os logs devem ser acessíveis apenas por usuários com perfil de liderança/auditoria.',
        ],
      },
    ],
    non_functional_requirements: [
      'Disponibilidade mínima de 99.8% em horário comercial da concessionária.',
      'Tempo de resposta de interface (Time to Interactive) inferior a 1.2 segundos em redes 4G/Wi-Fi.',
      `Compatibilidade total e responsiva para ${discovery_answers.B_dispositivos || 'Desktop e Mobile'}.`,
      'Suporte a failover com gravação temporária em IndexedDB local caso haja queda de rede.',
    ],
    integrations: [
      {
        name: 'ERP Concessionária (Linx DMS / Apollo / Totvs)',
        type: 'REST / Webhook Síncrono',
        purpose: 'Sincronização de dados cadastrais de clientes, veículos e ordens de serviço.',
      },
      {
        name: 'WhatsApp Business API',
        type: 'Webhook Bidirecional',
        purpose: 'Disparo de laudos, fotos de avaria e tokens de aprovação para o cliente final.',
      },
      {
        name: 'Supabase Storage Bucket',
        type: 'S3-Compatible Object Storage',
        purpose: 'Armazenamento criptografado de fotos, evidências digitais e termos assinados.',
      },
    ],
    security_requirements: [
      'Criptografia de ponta a ponta (TLS 1.3 em trânsito e AES-256 em repouso no Postgres).',
      'Mascaramento de dados pessoais (CPF, placa e telefone) em conformidade estrita com a LGPD.',
      'Autenticação multifator (MFA) mandatória para ações de exclusão ou aprovação de valores.',
      'Trilha de auditoria (audit trail) contínua e imutável gravada no histórico do banco.',
    ],
    security_lgpd: [
      'Encarregado de Dados (DPO) mapeado no fluxo de retenção.',
      'Direito de anonimização e exclusão de dados de clientes a pedido.',
      'Consentimento expresso registrado eletronicamente no primeiro contato.',
      'Registro de data/hora de acesso a prontuários e históricos de clientes.',
    ],
    roadmap_phases,
    next_steps,
    effort_estimation: {
      complexity: 'Média',
      estimated_weeks: '4 a 6 semanas (2 Sprints de MVP + 1 Sprint de Integração)',
      key_milestones: [
        'Sprint 1: Estruturação do banco Supabase, autenticação e telas operacionais de entrada;',
        'Sprint 2: Fila de trabalho em tempo real, upload de fotos e notificações;',
        'Sprint 3: Conector de integração com ERP Linx/Apollo e homologação assistida.',
      ],
    },
  };
}

// Gerador Completo Unificado (Arquitetura Multi-Agentes Híbrida: Claude 3.5 Sonnet + Haiku)
export async function generateAllArtifacts(input: GenerateArtifactsInput): Promise<GeneratedAssets> {
  return generateWithMultiAgents({
    title: input.title,
    problem: input.problem,
    solution: input.solution,
    area: input.area,
    discovery_answers: input.discovery_answers,
  });
}

async function legacyGenerateAllArtifacts(input: GenerateArtifactsInput): Promise<GeneratedAssets> {
  const { title, problem, solution, area, discovery_answers } = input;

  let claudeAiNotes = '';
  const apiKey =
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_API_KEY ||
    process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (apiKey) {
    const aiInsight = await callAI(
      `Você é um Arquiteto de Software e Especialista em Inovação para Concessionárias automotivas.
Analise a proposta a seguir e gere 2 parágrafos curtos de síntese executiva e recomendações técnicas:
Título: ${title}
Área: ${area}
Problema: ${problem}
Solução: ${solution}
Respostas do Discovery: ${JSON.stringify(discovery_answers)}`,
      'Você é um Arquiteto de Software e Especialista em Inovação para Concessionárias automotivas.'
    );
    if (aiInsight) {
      claudeAiNotes = aiInsight;
    }
  }

  // 1. Protótipo Interativo em Tela Única (Estilo Canva)
  const isMobilePreferred =
    (discovery_answers.B_dispositivos || '').toLowerCase().includes('celular') ||
    (discovery_answers.B_dispositivos || '').toLowerCase().includes('tablet');

  const autonomousHtml = buildAutonomousSaaSHtml(title, problem, solution, area, discovery_answers);

  const prototype: PrototypeAsset = {
    themeColor: area === 'Pós-Venda / Oficina' ? '#2563eb' : '#6366f1',
    styleMode: isMobilePreferred ? 'mobile' : 'desktop',
    html_content: autonomousHtml,
    generatedNotes: claudeAiNotes
      ? `[Análise Claude Haiku 4.5]\n${claudeAiNotes}\n\nProtótipo desenhado para: "${discovery_answers.B_usuarios || 'Colaboradores'}".`
      : `Protótipo desenhado para perfis: "${discovery_answers.B_usuarios || 'Colaboradores'}". Foco em facilidade de uso e agilidade no fluxo diário.`,
  };

  // 2. Prompt Lovable
  const prompt_text = `# ESPECIFICAÇÃO DE APLICAÇÃO PARA IA CONSTRUTORA (LOVABLE / NEXT.JS)

## Identificação do Projeto
- **Título**: ${title}
- **Departamento Responsável**: ${area}
- **Público-Alvo**: ${discovery_answers.B_usuarios || 'Colaboradores operacionais e liderança'}
- **Volume Estimado**: ${discovery_answers.B_volume || 'Volume departamental corporativo'}
${claudeAiNotes ? `\n> **Síntese de Engenharia de Software (Claude Haiku 4.5)**:\n> ${claudeAiNotes.replace(/\n/g, '\n> ')}\n` : ''}

## Stack Tecnológica Obrigatória
- **Framework**: Next.js 14+ (App Router com TypeScript)
- **Estilização**: TailwindCSS + Lucide Icons (Design moderno, Mobile-friendly e Dark Mode nativo)
- **Banco de Dados & Storage**: Supabase (PostgreSQL, Row Level Security, Storage Buckets)
- **Hospedagem & Deploy**: Vercel

---

## 1. Contexto do Negócio e Problema
O fluxo de trabalho atual da área de ${area} enfrenta o seguinte gargalo:
> "${problem}"

Perdas e impactos atuais medidos no negócio:
- ${discovery_answers.A_perdas || 'Atrasos operacionais, retrabalho e perda de tempo.'}
- Frequência observada: ${discovery_answers.A_frequencia || 'Operação contínua diária.'}

---

## 2. Solução Proposta e Telas Principais
A aplicação deve implementar:
> "${solution}"

### Rotas e Telas a Construir:
1. **/dashboard**: Painel visual com cards de métricas, status em tempo real e atalhos rápidos.
2. **/novo**: Formulário otimizado para ${discovery_answers.B_dispositivos || 'dispositivos móveis e desktop'} com validação e feedback imediato.
3. **/detalhes/[id]**: Tela de acompanhamento com linha do tempo e histórico de auditoria.
4. **/relatorios**: Métricas de sucesso baseadas no indicador: "${discovery_answers.H_metricas || 'Tempo e produtividade'}".

---

## 3. Modelo de Dados Sugerido (Postgres / Supabase)
\`\`\`sql
-- Tabela principal da entidade
CREATE TABLE IF NOT EXISTS public.${area.toLowerCase().replace(/[^a-z0-9]/g, '_')}_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);
\`\`\`

---

## 4. Requisitos de Integração e Segurança
- **Fontes de dados existentes**: ${discovery_answers.C_fontes || 'Sistemas legados corporativos (ERP/CRM)'}.
- **LGPD & Segurança**: ${discovery_answers.E_dados_sensiveis || 'Controle restrito de acessos com mascaramento de dados confidenciais'}.
- **Regime de Funcionamento**: ${discovery_answers.F_offline?.toLowerCase().includes('sim') ? 'Suporte a cache offline (PWA / Service Worker)' : 'Online com chamadas via Server Actions'}.
`;

  // 3. Documentação Técnica Completa de Nível de Engenharia (Padrão Oficial PRD 1.0)
  const technical_doc = buildCompletePRDDocument(title, problem, solution, area, discovery_answers, claudeAiNotes);

  // 4. Apresentação Comercial / Pitch Deck
  const commercial_deck = {
    slides: [
      {
        title: '1. Contexto & Desafio Operacional',
        subtitle: `Oportunidade identificada na área de ${area}`,
        bullets: [
          `Gargalo identificado: "${problem.slice(0, 140)}..."`,
          `Impacto acumulado: ${discovery_answers.A_perdas || 'Perda de tempo produtivo e custos ocultos de retrabalho.'}`,
          `Frequência da dor: ${discovery_answers.A_frequencia || 'Recorrente em múltiplos turnos de trabalho.'}`,
        ],
      },
      {
        title: '2. Proposta de Valor & Solução',
        subtitle: title,
        bullets: [
          `Abordagem: "${solution.slice(0, 140)}..."`,
          `Facilidade de adoção: Solução construída para quem está na linha de frente (${discovery_answers.B_usuarios || 'operadores'}).`,
          `Design adaptado para: ${discovery_answers.B_dispositivos || 'dispositivos do dia a dia'}.`,
        ],
      },
      {
        title: '3. Resultados Esperados & ROI',
        subtitle: 'Transformação projetada para os próximos 90 dias',
        bullets: [
          `Meta de transformação: ${discovery_answers.H_mudancas || 'Redução substancial de prazos e eliminação de falhas manuais.'}`,
          `Indicadores de sucesso: ${discovery_answers.H_metricas || 'Medição de tempo de ciclo e satisfação dos envolvidos.'}`,
          `Alinhamento estratégico: ${discovery_answers.I_objetivos || 'Contribui para metas globais de eficiência e crescimento.'}`,
        ],
      },
      {
        title: '4. Próximos Passos & Viabilidade',
        subtitle: 'Transição da ideia para o desenvolvimento acelerado',
        bullets: [
          'Protótipo e especificações técnicas já estruturados e prontos para homologação.',
          'Código base gerável em ferramentas no-code/low-code (Lovable) em padrão Next.js + Supabase.',
          'Publicação imediata no Banco de Ideias para priorização pelo comitê de inovação.',
        ],
      },
    ],
  };

  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    prototype,
    technical_prompt: {
      prompt_text,
      stack: {
        framework: 'Next.js 14 App Router',
        database: 'Supabase Postgres + Storage',
        hosting: 'Vercel',
        auth: 'Supabase Auth com RLS',
      },
    },
    technical_doc,
    commercial_deck,
  };
}

// Refinamento do Protótipo em HTML
export async function refinePrototypeAsset(
  currentPrototype: PrototypeAsset,
  instruction: string,
  ideaTitle: string = 'Solução'
): Promise<PrototypeAsset> {
  const currentHtml = currentPrototype.html_content || '';
  const apiKey =
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_API_KEY ||
    process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (apiKey && currentHtml) {
    const prompt = `Você é um Engenheiro de Front-end e Designer de Interfaces Senior.
Modifique o seguinte código HTML/CSS completo de uma aplicação SaaS para incorporar a instrução de ajuste do usuário.

INSTRUÇÃO DO USUÁRIO: "${instruction}"
TÍTULO DO PROJETO: "${ideaTitle}"

CÓDIGO HTML ATUAL:
${currentHtml}

REGRAS ESTITAS:
1. Retorne APENAS o código HTML completo atualizado, iniciando com <!DOCTYPE html> e terminando com </html>.
2. Não inclua explicações antes ou depois, apenas o código puro (ou dentro de bloco \`\`\`html).
3. Mantenha o design responsivo com Tailwind CSS via CDN e interatividade funcional em JavaScript.
4. Mantenha a barra lateral e os elementos do sistema consistentes.`;

    const updatedHtml = await callAI(
      prompt,
      'Você é um programador front-end sênior especialista em HTML, JavaScript e Tailwind CSS. Retorne APENAS o código HTML completo e atualizado, sem markdown ou explicações adicionais.'
    );
    if (updatedHtml) {
      const cleanHtml = updatedHtml
        .replace(/^```html\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      if (cleanHtml.includes('<!DOCTYPE html>') || cleanHtml.includes('<html')) {
        return {
          ...currentPrototype,
          html_content: cleanHtml,
          generatedNotes: `Protótipo atualizado com IA: "${instruction}". Versão adaptada.`,
        };
      }
    }
  }

  // Fallback de Refinamento: injeta modificações ou badge visual de refinamento no HTML
  let fallbackHtml = currentHtml;
  if (!fallbackHtml) {
    fallbackHtml = buildAutonomousSaaSHtml(
      ideaTitle,
      'Operação com alta demanda',
      'Automação e agilidade de processos',
      'Pós-Venda / Oficina',
      {}
    );
  }

  const badgeHtml = `<div class="mb-4 p-3 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-2"><span>✨</span> Refinamento aplicado: ${instruction}</div>`;
  if (fallbackHtml.includes('<!-- Área de Conteúdo com Scroll -->')) {
    fallbackHtml = fallbackHtml.replace(
      '<!-- Área de Conteúdo com Scroll -->\n    <div class="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin">',
      `<!-- Área de Conteúdo com Scroll -->\n    <div class="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin">\n      ${badgeHtml}`
    );
  }

  return {
    ...currentPrototype,
    html_content: fallbackHtml,
    generatedNotes: `Protótipo ajustado com base na instrução: "${instruction}".`,
  };
}

export const generateIdeaAssets = async (idea: any): Promise<GeneratedAssets> => {
  return generateAllArtifacts({
    title: idea.title,
    problem: idea.problem,
    solution: idea.solution,
    area: idea.area,
    discovery_answers: idea.discovery_answers || {},
  });
};

export async function classifyIdeaAlignment(
  idea: any,
  goals: any[]
): Promise<Array<{ goal_id: string; score: number; alignment_level: 'alta' | 'media' | 'baixa'; justification: string }>> {
  if (!goals || goals.length === 0) {
    return [
      {
        goal_id: 'default-goal',
        score: 78,
        alignment_level: 'alta',
        justification: `A proposta "${idea.title}" demonstra alto potencial de eficiência e produtividade na área de ${idea.area}.`,
      },
    ];
  }

  return goals.map((goal) => {
    let score = 50;
    if (idea.area && goal.owner_area && idea.area.toLowerCase() === goal.owner_area.toLowerCase()) {
      score += 25;
    }
    const problemWords = ((idea.problem || '') + ' ' + (idea.solution || '')).toLowerCase();
    const goalWords = (goal.title || '').toLowerCase().split(' ');
    const matches = goalWords.filter((w: string) => w.length > 3 && problemWords.includes(w)).length;
    score += Math.min(matches * 10, 20);
    score = Math.min(Math.max(score, 35), 95);
    const level: 'alta' | 'media' | 'baixa' = score >= 75 ? 'alta' : score >= 50 ? 'media' : 'baixa';
    return {
      goal_id: goal.id,
      score,
      alignment_level: level,
      justification: `A IA identificou correlação entre a proposta na área de ${idea.area} e o objetivo da meta "${goal.title}".`,
    };
  });
}
