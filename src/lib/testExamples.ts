export interface TestExample {
  id: string;
  badge: string;
  title: string;
  area: string;
  problem: string;
  solution: string;
  answers: Record<string, string>;
}

export const TEST_EXAMPLES: TestExample[] = [
  {
    id: 'followup-noticias',
    badge: 'Comercial & Vendas (Seu Exemplo)',
    title: 'Assistente IA de Notícias e Follow-up Comercial',
    area: 'Vendas de Veículos Novos',
    problem:
      'Hj para eu ter uma lead qualificado eu mando noticias para ele com base no que conversamos, por exemplo, ele quer comprar um caminhão e convesamos com isso e ele falou que está muito caro, e eu vejo uma noticia, aumento do dolar vai atingir aumentado os valores dos caminhoes nas concessionarias, eu mando isso para ele com uma mensagem de follow up, para ele não achar que eu to só cobrando ele, mas ele sentir que eu entendi o que ele precisa e a dor dele, só que pra isso com qualdiade, não consigo fazer para minhar carteira toda que tem amsi 200 leads, eu só consigo fazer com 15.',
    solution:
      'A minha ideia é um sistema que eu consiga colocar os meus leads e um resumo da conversa que eu tive com ele, e uma IA me ajudar a achar noticias que casem com o resumo, ou seja, a IA faz a parte de procurar noticias para mim e já escreve a mensagem personalizada com CTA para ele responder, sem ser algo chato. O sistema terá um painel com todos os clientes, menu de "mensagens frescas" atualizadas semanalmente com notícias de no máximo 30 dias, botão de "procurar notícias" sob demanda e atuação proativa como assistente do vendedor.',
    answers: {
      A_frequencia:
        'Hoje afeta todo o time comercial diariamente, pois todos precisam gerir ativamente a carteira de mais de 200 contatos.',
      A_perdas:
        'A empresa deixa de ganhar. Hoje fecho cerca de R$ 1 milhão por mês trabalhando só 15 leads. Com o sistema permitindo trabalhar 100 leads com qualidade, temos mais de R$ 5 milhões em potencial de vendas adicionais.',
      B_usuarios:
        'Time comercial (consultores de vendas de veículos/caminhões) e gerentes comerciais.',
      B_volume:
        'Cerca de 20 vendedores utilizando diariamente e simultaneamente na concessionária.',
      B_dispositivos:
        'Computador na mesa de negociação e celular/tablet para atendimento em trânsito e salão de vendas.',
      C_fontes:
        'Informações dispersas atualmente entre conversas de WhatsApp, planilhas no Excel e CRM corporativo.',
      C_qualidade:
        'As informações estão desorganizadas e descentralizadas, cada vendedor anota de um jeito diferente.',
      C_novas_informacoes:
        'Sim: histórico de conversas com clientes, empresas onde trabalham, resumos de interesses e notícias correlacionadas.',
      D_tempo_real:
        'Não precisa ser tempo real segundo a segundo; atualização periódica semanal das notícias e mensagens em lote é ideal.',
      E_dados_sensiveis:
        'Apenas dados básicos de contato: nome do cliente, telefone/WhatsApp e e-mail corporativo.',
      E_permissoes:
        'Cada vendedor visualiza exclusivamente a sua carteira de leads; o gerente geral tem visão consolidada de toda a equipe.',
      F_formato:
        'Aplicação web separada e dedicada, moderna e rápida, com interface limpa para o vendedor.',
      F_offline:
        'Possibilidade de registrar resumos em modo offline temporário caso a internet oscile, sincronizando ao reconectar.',
      G_passo_a_passo:
        '1. Buscar conversas antigas com o cliente\n2. Relembrar o que o cliente deseja e suas objeções\n3. Buscar notícias na internet sobre o mercado\n4. Filtrar a notícia que melhor se enquadra\n5. Redigir mensagem personalizada de follow-up com a notícia',
      G_gargalo:
        'O tempo excessivo gasto pesquisando notícias relevantes na internet e combinando com o perfil de cada cliente.',
      H_mudancas:
        'Aumento comprovado de 10% nas conversões de vendas e 100% da carteira de leads recebendo nutrição de valor no mês.',
      H_metricas:
        'Redução de horas de trabalho manual por vendedor, taxa de resposta dos leads ao follow-up e volume de propostas geradas.',
      I_objetivos:
        'Conecta diretamente com a meta estratégica de aumento de faturamento em vendas e digitalização do processo comercial.',
    },
  },
  {
    id: 'checkin-oficina',
    badge: 'Pós-Venda & Oficina',
    title: 'Check-in Expresso e Orçamento Transparente por WhatsApp',
    area: 'Pós-Venda / Oficina',
    problem:
      'Clientes enfrentam filas longas na recepção da oficina de manhã. Os consultores anotam avarias e pedidos em pranchetas de papel, gerando retrabalho na digitação do ERP e atraso de mais de 3 horas para o cliente aprovar orçamentos adicionais por telefone, travando os elevadores.',
    solution:
      'Totem de autoatendimento e webapp integrado ao WhatsApp: o cliente faz pré-checkin informando a quilometragem e barulhos suspeitos. O consultor técnico recebe a ordem de serviço no tablet, grava um vídeo de 15 segundos mostrando a peça desgastada e envia no WhatsApp do cliente com botão seguro de aprovação em 1 clique.',
    answers: {
      A_frequencia:
        'Mais de 45 veículos atendidos por dia na oficina da concessionária, com pico crítico entre 07h30 e 09h30.',
      A_perdas:
        'Perdemos cerca de 40 minutos por veículo na recepção e mais de 2 horas de elevador parado aguardando aprovação telefônica de orçamento, gerando reclamações no SAC e ociosidade da equipe mecânica.',
      B_usuarios:
        'Consultores técnicos de pós-venda, mecânicos chefes de oficina e o próprio cliente final pelo WhatsApp.',
      B_volume:
        'Cerca de 15 consultores e chefes de oficina simultâneos, atendendo mais de 900 clientes por mês.',
      B_dispositivos:
        'Tablets robustos para os consultores no pátio e smartphone (via WhatsApp/web) para o cliente final.',
      C_fontes:
        'ERP da concessionária (Linx / Apollo) com histórico de passagens do veículo, placa e cadastro de clientes.',
      C_qualidade:
        'O cadastro básico no ERP é confiável, mas o checklist de entrada em papel costuma ser incompleto ou perder fotos.',
      C_novas_informacoes:
        'Sim: fotos e vídeos de vistoria com carimbo de data/hora, itens adicionais aprovados digitalmente e assinatura eletrônica.',
      D_tempo_real:
        'Sim, a aprovação do orçamento precisa refletir em tempo real para o mecânico liberar ou iniciar a montagem no elevador.',
      E_dados_sensiveis:
        'Placa do chassi, modelo do veículo, nome e telefone do proprietário (exige conformidade com LGPD).',
      E_permissoes:
        'Mecânicos visualizam apenas a lista de serviços a executar; consultores gerenciam orçamentos; gerente visualiza ticket médio e tempo de pátio.',
      F_formato:
        'Aplicação web responsiva com interface otimizada para tablets na oficina e páginas leves de aprovação no celular do cliente.',
      F_offline:
        'Fundamental ter cache offline no tablet para permitir vistorias no subsolo ou lavador onde o Wi-Fi oscila.',
      G_passo_a_passo:
        '1. Recepção do cliente com prancheta de papel\n2. Vistoria visual manual\n3. Digitação dos dados no ERP no computador de mesa\n4. Diagnóstico do mecânico\n5. Ligação para o cliente negociar orçamento adicional\n6. Liberação do serviço',
      G_gargalo:
        'O tempo de espera na ligação telefônica para o cliente aprovar peças adicionais e a digitação manual de papéis.',
      H_mudancas:
        'Fila da manhã zerada (atendimento em menos de 5 minutos por carro), aumento de 25% na taxa de aprovação de orçamentos e elevadores 100% produtivos.',
      H_metricas:
        'Tempo médio de passagem na recepção, taxa de aprovação de orçamentos extras e nota de satisfação pós-venda (NPS).',
      I_objetivos:
        'Alinhado com a meta corporativa de aumentar a retenção de clientes de pós-venda e elevar o ticket médio de serviços.',
    },
  },
  {
    id: 'avaliacao-seminovos',
    badge: 'Seminovos & Troca',
    title: 'Avaliador Instantâneo de Seminovos na Troca com IA',
    area: 'Seminovos',
    problem:
      'Quando um cliente quer dar seu carro usado na troca por um zero km, a avaliação demora mais de 45 minutos porque depende da disponibilidade do avaliador chefe. O cliente fica impaciente, desiste da compra do veículo novo ou busca propostas na concorrência.',
    solution:
      'Aplicativo inteligente no qual o vendedor fotografa a placa e 6 ângulos pré-definidos do veículo. A IA faz leitura da placa (OCR), consulta a tabela FIPE, cruza histórico de sinistro/leilão e gera em menos de 3 minutos uma faixa sugerida de precificação de compra e margem estimada, enviando para validação instantânea do gerente.',
    answers: {
      A_frequencia:
        'Acontece em mais de 60% das negociações de veículos novos e seminovos, cerca de 25 avaliações diárias por loja.',
      A_perdas:
        'Perdemos cerca de 3 a cada 10 vendas potenciais porque o cliente não quer esperar a avaliação física demorada e vai à concorrência.',
      B_usuarios:
        'Consultores de vendas de novos/seminovos, avaliadores de pátio e gerentes comerciais.',
      B_volume:
        'Cerca de 25 vendedores e 3 gestores utilizando simultaneamente ao longo do dia.',
      B_dispositivos:
        'Smartphones dos vendedores (Android e iOS) para fotografar e consultar no pátio da concessionária.',
      C_fontes:
        'Bases de dados da FIPE, API de consulta veicular (leilão/sinistro) e histórico de estoque de seminovos da concessionária.',
      C_qualidade:
        'Dados da FIPE e APIs são confiáveis, mas o histórico de revisões e estado de conservação dependem de fotos com boa iluminação.',
      C_novas_informacoes:
        'Fotos periciais do carro, histórico de avarias identificadas por visão computacional, valor ofertado e margem prevista.',
      D_tempo_real:
        'Sim, a resposta da pré-avaliação deve sair em até 3 minutos enquanto o cliente ainda está tomando café na concessionária.',
      E_dados_sensiveis:
        'Placa, Renavam e CPF do proprietário do veículo usado para consulta de débitos e multas.',
      E_permissoes:
        'Vendedor visualiza a faixa de valor sugerida para negociação; avaliador técnico pode ajustar itens; gerente aprova a margem final.',
      F_formato:
        'Webapp progressivo (PWA) de alta velocidade, acessível tanto no celular do vendedor quanto no navegador da mesa.',
      F_offline:
        'Permite fotografar os veículos no pátio aberto mesmo se o sinal 4G/Wi-Fi cair, sincronizando a análise ao reconectar.',
      G_passo_a_passo:
        '1. Vendedor leva o cliente para ver o carro novo\n2. Cliente pede avaliação do usado\n3. Vendedor procura o avaliador que está ocupado no pátio\n4. Avaliador faz checklist manual de 20 minutos\n5. Consulta sistemas lentos de sinistro\n6. Retorna o valor depois de quase 1 hora',
      G_gargalo:
        'A lentidão de depender de uma única pessoa física (avaliador chefe) para fazer a precificação inicial.',
      H_mudancas:
        'Tempo de avaliação reduzido de 45 minutos para menos de 4 minutos, dobrando a taxa de fechamento de negócios na primeira visita.',
      H_metricas:
        'Taxa de conversão de clientes com troca, tempo médio de avaliação e margem de revenda dos seminovos captados.',
      I_objetivos:
        'Alinhado diretamente com as metas da diretoria de girar o estoque de seminovos com alta margem e acelerar a venda de veículos novos.',
    },
  },
];
