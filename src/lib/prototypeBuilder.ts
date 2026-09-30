import { DiscoveryAnswers } from './types';

export function buildAutonomousSaaSHtml(
  title: string,
  problem: string,
  solution: string,
  area: string,
  discovery_answers: DiscoveryAnswers = {}
): string {
  const combinedText = `${title} ${solution} ${problem} ${area}`.toLowerCase();

  // Detecção Inteligente do Domínio de Negócio da Ideia
  const isSalesFollowup = /lead|noticia|notícia|follow|venda|comercial|prospect|crm|cliente|carteira|mensagem|wpp|whatsapp|caminh|frotist/i.test(combinedText);
  const isWorkshop = /oficina|pos-venda|pós-venda|revis|mecanic|check-in|checkin|elevador|peca|peça|ordem de serv|os\b/i.test(combinedText);
  const isTradeIn = /seminov|usado|troca|fipe|avali|laudo|perici/i.test(combinedText);
  const isGamification = /gamif|fideliz|ponto|recompensa|club|voucher/i.test(combinedText);

  if (isSalesFollowup) {
    return buildSalesFollowupHtml(title, problem, solution, area, discovery_answers);
  }
  if (isWorkshop) {
    return buildWorkshopHtml(title, problem, solution, area, discovery_answers);
  }
  if (isTradeIn) {
    return buildTradeInHtml(title, problem, solution, area, discovery_answers);
  }
  if (isGamification) {
    return buildGamificationHtml(title, problem, solution, area, discovery_answers);
  }

  // Fallback Genérico Customizado
  return buildGeneralSaaSHtml(title, problem, solution, area, discovery_answers);
}

export function buildDomainAwarePrototypeHtml(idea: {
  title: string;
  problem: string;
  solution: string;
  area: string;
  discovery_answers: DiscoveryAnswers;
}): string {
  return buildAutonomousSaaSHtml(idea.title, idea.problem, idea.solution, idea.area, idea.discovery_answers);
}

// ============================================================================
// 1. PROTÓTIPO: ASSISTENTE IA DE NOTÍCIAS & FOLLOW-UP COMERCIAL (CRM LEADS)
// ============================================================================
function buildSalesFollowupHtml(
  title: string,
  problem: string,
  solution: string,
  area: string,
  discovery_answers: DiscoveryAnswers
): string {
  const userProfile = discovery_answers.B_usuarios || 'Consultor Comercial';
  const bottleneck = discovery_answers.G_gargalo || 'Pesquisar notícias na internet manualmente para mais de 200 leads';

  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | DealerHub Sales AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          colors: {
            brand: '#2563eb',
          }
        }
      }
    };
  </script>
  <style>
    body { font-family: 'Inter', sans-serif; }
    .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex antialiased selection:bg-blue-600 selection:text-white">

  <!-- Sidebar Lateral -->
  <aside class="w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col shrink-0 hidden md:flex">
    <div class="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/20">
        AI
      </div>
      <div>
        <div class="font-extrabold text-sm tracking-tight text-white">DealerHub <span class="text-blue-400">Sales</span></div>
        <div class="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Radar de Notícias</div>
      </div>
    </div>

    <!-- Navegação em Abas -->
    <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
      <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1">Operação Comercial</div>
      
      <button type="button" onclick="switchView('radar', this)" id="btn-tab-radar" class="tab-btn w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-600/20 text-blue-400 font-semibold text-xs border border-blue-500/30 transition-all text-left">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
        <span>Leads & Notícias Casadas</span>
        <span class="ml-auto bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full" id="sidebarBadgeCount">3 Novos</span>
      </button>

      <button type="button" onclick="switchView('mensagens', this)" id="btn-tab-mensagens" class="tab-btn w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium text-xs transition-all text-left border border-transparent">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
        <span>Mensagens Frescas (Semana)</span>
        <span class="ml-auto bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">Prontas</span>
      </button>

      <button type="button" onclick="switchView('noticias', this)" id="btn-tab-noticias" class="tab-btn w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium text-xs transition-all text-left border border-transparent">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
        <span>Radar de Notícias (30 dias)</span>
        <span class="ml-auto bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">24 feeds</span>
      </button>

      <div class="pt-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1">Inteligência & CRM</div>
      <button type="button" onclick="searchLiveNews()" class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium text-xs transition-all text-left">
        <svg class="w-4 h-4 shrink-0 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span>Sincronizar Notícias com IA</span>
      </button>
    </nav>

    <!-- Usuário Rodapé -->
    <div class="p-4 border-t border-slate-800/80">
      <div class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
        <div class="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-300 font-bold flex items-center justify-center text-xs">
          VD
        </div>
        <div class="overflow-hidden flex-1">
          <div class="text-xs font-bold text-white truncate">${userProfile}</div>
          <div class="text-[10px] text-slate-400 truncate">Carteira Ativa: 200 Leads</div>
        </div>
      </div>
    </div>
  </aside>

  <!-- Conteúdo Principal -->
  <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
    <!-- Topbar -->
    <header class="h-16 bg-slate-900/80 border-b border-slate-800/80 px-6 flex items-center justify-between gap-4 shrink-0">
      <div class="flex items-center gap-3">
        <h1 class="text-base font-extrabold text-white tracking-tight truncate max-w-md">${title}</h1>
        <span class="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Assistente IA Ativo
        </span>
      </div>

      <div class="flex items-center gap-3">
        <div class="relative hidden sm:block">
          <input type="text" id="searchInput" onkeyup="filterLeads()" placeholder="Buscar lead, empresa ou notícia..." class="w-60 pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all">
          <svg class="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        <button type="button" onclick="openLeadModal()" class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>+ Adicionar Lead & Resumo</span>
        </button>
      </div>
    </header>

    <!-- Área de Conteúdo -->
    <div class="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin">
      
      <!-- ============================================== -->
      <!-- ABA 1: RADAR DE LEADS & NOTÍCIAS CASADAS       -->
      <!-- ============================================== -->
      <div id="view-radar" class="tab-content active space-y-6">
        <!-- Banner de Contexto Operacional -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/20 flex items-start gap-3">
          <div class="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div class="text-xs text-slate-300 leading-relaxed flex-1">
            <span class="font-bold text-white">Objetivo:</span> ${solution}
            <div class="mt-1 text-[11px] text-slate-400">Gargalo eliminado pela IA: <strong class="text-slate-300">${bottleneck}</strong></div>
          </div>
        </div>

        <!-- 4 Cards de Métricas e KPIs Comerciais -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-semibold text-slate-400">Leads na Carteira</div>
              <div class="text-2xl font-extrabold text-white mt-0.5 font-mono" id="kpiLeads">200</div>
              <div class="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">100% cobertos com IA</div>
            </div>
            <div class="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-semibold text-slate-400">Notícias Mapeadas (30d)</div>
              <div class="text-2xl font-extrabold text-white mt-0.5 font-mono" id="kpiNews">24</div>
              <div class="text-[10px] text-blue-400 flex items-center gap-1 mt-1 font-semibold">Valor, AutoData, Frotas</div>
            </div>
            <div class="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-semibold text-slate-400">Mensagens Prontas com CTA</div>
              <div class="text-2xl font-extrabold text-white mt-0.5 font-mono" id="kpiReady">18</div>
              <div class="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">Prontas p/ WhatsApp</div>
            </div>
            <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-[11px] font-semibold text-slate-400">Potencial em Negociação</div>
              <div class="text-2xl font-extrabold text-amber-300 mt-0.5 font-mono">R$ 5,2M</div>
              <div class="text-[10px] text-amber-400 flex items-center gap-1 mt-1 font-semibold">↑ +R$ 4M vs método manual</div>
            </div>
            <div class="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
        </div>

        <!-- Tabela Principal de Leads & Notícias Casadas -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div class="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-bold text-white flex items-center gap-2">
                <span>Leads com Sugestão de Follow-up com Notícia</span>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-mono" id="leadRowCount">3 prioridades hoje</span>
              </h2>
              <p class="text-xs text-slate-400 mt-0.5">A IA combinou o histórico de conversa com notícias dos últimos 30 dias</p>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" onclick="searchLiveNews()" class="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                <span>Procurar Notícias Novas</span>
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs" id="leadsTable">
              <thead class="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th class="py-3 px-4">Lead / Empresa</th>
                  <th class="py-3 px-4">Resumo da Conversa Anterior</th>
                  <th class="py-3 px-4">Notícia Casada pela IA (≤ 30 dias)</th>
                  <th class="py-3 px-4">Mensagem de Follow-up com CTA</th>
                  <th class="py-3 px-4 text-right">Ação Rápida</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60" id="leadsTableBody">
                <!-- Lead 1 -->
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-white">Marcos Vinicius</div>
                    <div class="text-[11px] text-blue-400">TransLima Logística (5 Caminhões)</div>
                    <div class="text-[10px] text-slate-500 font-mono">(11) 98722-1044</div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-300 max-w-xs">
                    Quer comprar 2 cavalos mecânicos novos, mas reclamou que o preço está alto e decidiu esperar.
                  </td>
                  <td class="py-3.5 px-4 max-w-xs">
                    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div class="font-semibold text-amber-300 text-[11px]">"Alta do dólar deve encarecer caminhões 0km em até 7% a partir do próximo mês"</div>
                      <div class="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>Valor Econômico</span>
                        <span class="font-mono text-emerald-400">Há 3 dias</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-200 max-w-sm">
                    <div class="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] leading-relaxed">
                      "Olá Marcos, tudo bem? Vi essa matéria sobre o impacto do dólar nos caminhões no próximo mês e lembrei da nossa conversa. Se fecharmos o faturamento esta semana consigo segurar a tabela antiga para os seus 2 cavalos. Quer dar uma olhada na proposta antes que vire o mês?"
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-right space-y-1">
                    <button type="button" onclick="sendWhatsApp('Marcos Vinicius', 'TransLima')" class="w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all">
                      <span>Enviar Wpp 🚀</span>
                    </button>
                    <button type="button" onclick="regenerateMessage(this)" class="w-full px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors">
                      Regerar com IA 🤖
                    </button>
                  </td>
                </tr>

                <!-- Lead 2 -->
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-white">Roberto Fontes</div>
                    <div class="text-[11px] text-blue-400">Agropecuária Vale Verde</div>
                    <div class="text-[10px] text-slate-500 font-mono">(19) 99182-3301</div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-300 max-w-xs">
                    Interesse em caminhão semipesado para escoamento de grãos, preocupado com prazo de entrega para a safra.
                  </td>
                  <td class="py-3.5 px-4 max-w-xs">
                    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div class="font-semibold text-amber-300 text-[11px]">"Safra recorde de grãos projeta alta de 22% na demanda de frete rodoviário no Centro-Oeste"</div>
                      <div class="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>Canal Rural</span>
                        <span class="font-mono text-emerald-400">Há 5 dias</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-200 max-w-sm">
                    <div class="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] leading-relaxed">
                      "Fala Roberto, tudo bem? Saiu essa estimativa de safra recorde e a demanda por fretes vai explodir. Temos 1 unidade a pronta-entrega no pátio para você não perder o pico da colheita. Consigo segurar até amanhã, podemos alinhar?"
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-right space-y-1">
                    <button type="button" onclick="sendWhatsApp('Roberto Fontes', 'Vale Verde')" class="w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all">
                      <span>Enviar Wpp 🚀</span>
                    </button>
                    <button type="button" onclick="regenerateMessage(this)" class="w-full px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors">
                      Regerar com IA 🤖
                    </button>
                  </td>
                </tr>

                <!-- Lead 3 -->
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-white">Carla Dias</div>
                    <div class="text-[11px] text-blue-400">Expresso Metropolitano</div>
                    <div class="text-[10px] text-slate-500 font-mono">(11) 97600-4499</div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-300 max-w-xs">
                    Quer renovar furgões urbanos de entrega rápida, focado em custo de consumo de combustível e manutenção.
                  </td>
                  <td class="py-3.5 px-4 max-w-xs">
                    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div class="font-semibold text-amber-300 text-[11px]">"Novos motores Euro 6 comprovam redução média de 11% no consumo em ciclo urbano"</div>
                      <div class="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>Automotive Business</span>
                        <span class="font-mono text-emerald-400">Há 9 dias</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-slate-200 max-w-sm">
                    <div class="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] leading-relaxed">
                      "Olá Carla! Vi este comparativo recente de consumo dos motores novos para entregas urbanas. Pelo tamanho da sua frota a economia em diesel paga mais da metade da parcela do leasing. Quer que eu simule os números exatos para o seu trajeto?"
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-right space-y-1">
                    <button type="button" onclick="sendWhatsApp('Carla Dias', 'Expresso Metropolitano')" class="w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all">
                      <span>Enviar Wpp 🚀</span>
                    </button>
                    <button type="button" onclick="regenerateMessage(this)" class="w-full px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors">
                      Regerar com IA 🤖
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- ABA 2: MENSAGENS FRESCAS DA SEMANA             -->
      <!-- ============================================== -->
      <div id="view-mensagens" class="tab-content space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-extrabold text-white">Disparo Proativo Sugerido pela IA</h2>
            <p class="text-xs text-slate-400">Notificações semanais organizadas por relevância para você enviar em 1 clique</p>
          </div>
          <button type="button" onclick="showToast('Todas as mensagens da semana foram enfileiradas no WhatsApp!')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all">
            Disparar Todos Prioritários ⚡
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold">Marcos Vinicius (Caminhões Pesados)</span>
              <span class="text-[10px] text-slate-400 font-mono">Alta afinidade (96%)</span>
            </div>
            <p class="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              "Olá Marcos! Vi essa matéria sobre a alta do dólar nos caminhões e lembrei da sua cotação. Garanto o preço antigo se faturarmos até sexta. Vamos fechar?"
            </p>
            <div class="flex justify-end gap-2">
              <button type="button" onclick="sendWhatsApp('Marcos Vinicius', 'TransLima')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">Enviar WhatsApp</button>
            </div>
          </div>

          <div class="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-xs font-bold">Roberto Fontes (Agropecuária)</span>
              <span class="text-[10px] text-slate-400 font-mono">Alta afinidade (91%)</span>
            </div>
            <p class="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              "Fala Roberto! Saiu a projeção da safra recorde e a demanda por fretes. Temos a pronta-entrega para não perder a colheita. Vamos alinhar?"
            </p>
            <div class="flex justify-end gap-2">
              <button type="button" onclick="sendWhatsApp('Roberto Fontes', 'Vale Verde')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">Enviar WhatsApp</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- ABA 3: RADAR DE NOTÍCIAS DO SETOR              -->
      <!-- ============================================== -->
      <div id="view-noticias" class="tab-content space-y-6">
        <div>
          <h2 class="text-base font-extrabold text-white">Feed Curado de Notícias Automotivas & Logística</h2>
          <p class="text-xs text-slate-400">Filtradas automaticamente nos últimos 30 dias por relevância comercial</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <span class="text-[10px] font-bold text-blue-400 font-mono uppercase">Câmbio & Economia · Há 3 dias</span>
              <h3 class="font-bold text-sm text-white mt-1">Alta do dólar deve encarecer caminhões 0km em até 7% a partir do próximo mês</h3>
              <p class="text-xs text-slate-400 mt-2">Montadoras alertam sobre repasse de custos de componentes importados para a tabela oficial.</p>
            </div>
            <button type="button" onclick="showToast('Notícia associada a 4 leads com objeção de preço!')" class="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200">
              Casar com Leads da Carteira (4)
            </button>
          </div>

          <div class="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <span class="text-[10px] font-bold text-emerald-400 font-mono uppercase">Agronegócio · Há 5 dias</span>
              <h3 class="font-bold text-sm text-white mt-1">Safra recorde de grãos projeta alta de 22% na demanda de frete rodoviário</h3>
              <p class="text-xs text-slate-400 mt-2">Expectativa de gargalo logístico no escoamento para os portos de Santos e Paranaguá.</p>
            </div>
            <button type="button" onclick="showToast('Notícia associada a 6 leads do setor agropecuário!')" class="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200">
              Casar com Leads da Carteira (6)
            </button>
          </div>

          <div class="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <span class="text-[10px] font-bold text-purple-400 font-mono uppercase">Tecnologia & Motores · Há 9 dias</span>
              <h3 class="font-bold text-sm text-white mt-1">Novos motores Euro 6 comprovam redução média de 11% no consumo em ciclo urbano</h3>
              <p class="text-xs text-slate-400 mt-2">Relatório de telemetria aponta retorno do investimento acelerado em frotas urbanas.</p>
            </div>
            <button type="button" onclick="showToast('Notícia associada a 5 frotistas urbanos!')" class="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200">
              Casar com Leads da Carteira (5)
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- ============================================== -->
  <!-- MODAL: ADICIONAR NOVO LEAD & RESUMO DA CONVERSA-->
  <!-- ============================================== -->
  <div id="leadModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 hidden">
    <div class="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          Novo Lead para Nutrição com IA
        </h3>
        <button type="button" onclick="closeLeadModal()" class="text-slate-400 hover:text-white text-xs">✕</button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="text-[11px] font-bold text-slate-300">Nome do Contato</label>
          <input type="text" id="modalInputNome" placeholder="Ex: Cláudio Silveira" class="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="text-[11px] font-bold text-slate-300">Empresa / Segmento / Veículo Desejado</label>
          <input type="text" id="modalInputEmpresa" placeholder="Ex: Transportadora Rápido Sol (3 Caminhões Pesados)" class="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="text-[11px] font-bold text-slate-300">Resumo da Conversa Recente & Objeções</label>
          <textarea id="modalInputResumo" rows="3" placeholder="Ex: Conversou ontem, quer trocar frota mas achou juros do financiamento pesados..." class="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" onclick="closeLeadModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">Cancelar</button>
        <button type="button" onclick="saveNewLead()" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-1.5">
          <span>Salvar & Casar com Notícia IA</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none">
    <div class="px-4 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-xs shadow-2xl flex items-center gap-2 border border-blue-400/40">
      <span>✨</span>
      <span id="toastMsg">Operação executada!</span>
    </div>
  </div>

  <script>
    function showToast(msg) {
      const toast = document.getElementById('toast');
      document.getElementById('toastMsg').innerText = msg;
      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
      }, 3000);
    }

    function switchView(viewId, btn) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      const activeContent = document.getElementById('view-' + viewId);
      if (activeContent) activeContent.classList.add('active');

      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('bg-blue-600/20', 'text-blue-400', 'font-semibold', 'border-blue-500/30');
        b.classList.add('text-slate-400', 'font-medium', 'border-transparent');
      });

      if (btn) {
        btn.classList.add('bg-blue-600/20', 'text-blue-400', 'font-semibold', 'border-blue-500/30');
        btn.classList.remove('text-slate-400', 'font-medium', 'border-transparent');
      }
    }

    function openLeadModal() {
      document.getElementById('leadModal').classList.remove('hidden');
    }

    function closeLeadModal() {
      document.getElementById('leadModal').classList.add('hidden');
    }

    function sendWhatsApp(nome, empresa) {
      showToast('🚀 Mensagem copiada e pronta para envio no WhatsApp para ' + nome + ' (' + empresa + ')!');
    }

    function regenerateMessage(btn) {
      const tr = btn.closest('tr');
      const msgDiv = tr.querySelector('td:nth-child(4) div');
      msgDiv.innerHTML = '<span class="text-blue-400 animate-pulse">🤖 IA reescrevendo com novo CTA e tom consultivo...</span>';
      setTimeout(() => {
        msgDiv.innerHTML = '"Olá! Passando para compartilhar esse estudo do setor com você. Essa nova projeção pode impactar o valor de revenda da sua frota atual. Tem 5 minutos amanhã para avaliarmos juntos?"';
        showToast('Nova mensagem de follow-up gerada com sucesso pela IA!');
      }, 1200);
    }

    function searchLiveNews() {
      showToast('🔍 IA rastreando os principais portais automotivos e de transporte dos últimos 30 dias...');
      setTimeout(() => {
        showToast('✅ 4 novas notícias de mercado identificadas e correlacionadas aos seus leads!');
      }, 1800);
    }

    function saveNewLead() {
      const nome = document.getElementById('modalInputNome').value || 'Novo Lead Interessado';
      const empresa = document.getElementById('modalInputEmpresa').value || 'Transportadora / Frota Regional';
      const resumo = document.getElementById('modalInputResumo').value || 'Interesse em renovação de caminhões, analisando fluxo de caixa.';

      const tbody = document.getElementById('leadsTableBody');
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-800/30 transition-colors bg-blue-500/10 animate-pulse';
      tr.innerHTML = \`
        <td class="py-3.5 px-4">
          <div class="font-bold text-white">\${nome}</div>
          <div class="text-[11px] text-blue-400">\${empresa}</div>
          <div class="text-[10px] text-slate-500 font-mono">(11) 9\${Math.floor(1000 + Math.random() * 9000)}-\${Math.floor(1000 + Math.random() * 9000)}</div>
        </td>
        <td class="py-3.5 px-4 text-slate-300 max-w-xs">\${resumo}</td>
        <td class="py-3.5 px-4 max-w-xs">
          <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div class="font-semibold text-amber-300 text-[11px]">"Nova rodada de crédito do BNDES anuncia juros subsidiados para renovação de frotas"</div>
            <div class="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Agência Brasil</span>
              <span class="font-mono text-emerald-400">Publicado Hoje</span>
            </div>
          </div>
        </td>
        <td class="py-3.5 px-4 text-slate-200 max-w-sm">
          <div class="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] leading-relaxed">
            "Olá \${nome}, tudo bem? Acabou de sair a linha de crédito especial do BNDES com taxa reduzida. Enquadra perfeitamente no que conversamos ontem para a \${empresa}. Vamos simular as parcelas?"
          </div>
        </td>
        <td class="py-3.5 px-4 text-right space-y-1">
          <button type="button" onclick="sendWhatsApp('\${nome}', '\${empresa}')" class="w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all">
            <span>Enviar Wpp 🚀</span>
          </button>
          <button type="button" onclick="regenerateMessage(this)" class="w-full px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors">
            Regerar com IA 🤖
          </button>
        </td>
      \`;
      tbody.prepend(tr);
      closeLeadModal();

      setTimeout(() => tr.classList.remove('animate-pulse'), 2000);
      showToast('Lead ' + nome + ' cadastrado e notícia correlacionada com sucesso!');
    }

    function filterLeads() {
      const input = document.getElementById('searchInput');
      const filter = input.value.toLowerCase();
      const rows = document.getElementById('leadsTableBody').getElementsByTagName('tr');
      for (let i = 0; i < rows.length; i++) {
        const text = rows[i].innerText.toLowerCase();
        rows[i].style.display = text.includes(filter) ? '' : 'none';
      }
    }
  </script>
</body>
</html>`;
}

// ============================================================================
// 2. PROTÓTIPO: OFICINA & PÓS-VENDA EXPRESS COM WHATSAPP
// ============================================================================
function buildWorkshopHtml(
  title: string,
  problem: string,
  solution: string,
  area: string,
  discovery_answers: DiscoveryAnswers
): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | DealerHub Oficina Express</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex antialiased">
  <aside class="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-4 hidden md:block">
    <div class="flex items-center gap-3 px-2">
      <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white">OF</div>
      <div>
        <div class="font-bold text-sm text-white">Oficina Express</div>
        <div class="text-[10px] text-slate-400 font-mono">Pós-Venda Digital</div>
      </div>
    </div>
    <nav class="space-y-1">
      <div class="px-3 py-2 rounded-xl bg-blue-600/20 text-blue-400 text-xs font-semibold">📋 Fila de Check-in</div>
      <div class="px-3 py-2 rounded-xl text-slate-400 text-xs hover:bg-slate-800">📸 Vistoria & Vídeos IA</div>
      <div class="px-3 py-2 rounded-xl text-slate-400 text-xs hover:bg-slate-800">⚙️ Orçamentos WhatsApp</div>
    </nav>
  </aside>

  <main class="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
    <header class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div>
        <h1 class="text-lg font-bold text-white">${title}</h1>
        <p class="text-xs text-slate-400">Recepção de veículos em tempo real e orçamentos via WhatsApp</p>
      </div>
      <button onclick="alert('Novo checklist iniciado no tablet do consultor!')" class="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md">
        + Novo Check-in de Veículo
      </button>
    </header>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Veículos no Pátio</div>
        <div class="text-2xl font-bold font-mono text-white mt-1">18</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Tempo Médio Recepção</div>
        <div class="text-2xl font-bold font-mono text-emerald-400 mt-1">4.2 min</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Aprovações WhatsApp</div>
        <div class="text-2xl font-bold font-mono text-blue-400 mt-1">84%</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Elevadores Ocupados</div>
        <div class="text-2xl font-bold font-mono text-amber-400 mt-1">8 / 10</div>
      </div>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
      <div class="p-4 border-b border-slate-800 font-bold text-xs text-white">Veículos em Check-in e Vistoria</div>
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
          <tr>
            <th class="p-3">Placa / Modelo</th>
            <th class="p-3">Cliente</th>
            <th class="p-3">Check-in</th>
            <th class="p-3">Diagnóstico com Vídeo</th>
            <th class="p-3">Orçamento Extra</th>
            <th class="p-3 text-right">Ação WhatsApp</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr>
            <td class="p-3 font-bold text-white">BRA-2E19 (Corolla Cross)</td>
            <td class="p-3 text-slate-300">Carlos Eduardo Mendes</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">Concluído (08:15)</span></td>
            <td class="p-3 text-blue-400">▶ Vídeo 15s gravado (Pastilha gasta)</td>
            <td class="p-3 font-mono font-bold text-white">R$ 480,00</td>
            <td class="p-3 text-right">
              <button onclick="alert('Orçamento com link de 1 clique reenviado no WhatsApp de Carlos!')" class="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs">Aprovado pelo Cliente ✅</button>
            </td>
          </tr>
          <tr>
            <td class="p-3 font-bold text-white">XYZ-9876 (Compass Turbo)</td>
            <td class="p-3 text-slate-300">Mariana Silveira</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">Em vistoria no pátio</span></td>
            <td class="p-3 text-slate-400">Gravando diagnóstico...</td>
            <td class="p-3 font-mono font-bold text-white">R$ 320,00</td>
            <td class="p-3 text-right">
              <button onclick="alert('Link de aprovação com vídeo enviado para o WhatsApp de Mariana!')" class="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs">Enviar Orçamento 🚀</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</body>
</html>`;
}

// ============================================================================
// 3. PROTÓTIPO: AVALIADOR DE SEMINOVOS COM IA & FIPE
// ============================================================================
function buildTradeInHtml(
  title: string,
  problem: string,
  solution: string,
  area: string,
  discovery_answers: DiscoveryAnswers
): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <title>${title} | DealerHub Avaliação Seminovos</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex antialiased">
  <aside class="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-4 hidden md:block">
    <div class="flex items-center gap-3 px-2">
      <div class="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white">SN</div>
      <div>
        <div class="font-bold text-sm text-white">Avaliador Seminovos</div>
        <div class="text-[10px] text-slate-400 font-mono">IA & Tabela FIPE</div>
      </div>
    </div>
    <nav class="space-y-1">
      <div class="px-3 py-2 rounded-xl bg-purple-600/20 text-purple-300 text-xs font-semibold">🔍 Avaliações na Troca</div>
      <div class="px-3 py-2 rounded-xl text-slate-400 text-xs hover:bg-slate-800">📸 Laudos com Fotos IA</div>
      <div class="px-3 py-2 rounded-xl text-slate-400 text-xs hover:bg-slate-800">📈 Histórico de Leilão</div>
    </nav>
  </aside>

  <main class="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
    <header class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div>
        <h1 class="text-lg font-bold text-white">${title}</h1>
        <p class="text-xs text-slate-400">Precificação instantânea em 3 minutos para fechamento de vendas</p>
      </div>
      <button onclick="alert('Iniciando leitura de placa via OCR da câmera do celular!')" class="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md">
        + Avaliar Carro na Troca
      </button>
    </header>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Avaliações Hoje</div>
        <div class="text-2xl font-bold font-mono text-white mt-1">22</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Tempo Médio</div>
        <div class="text-2xl font-bold font-mono text-emerald-400 mt-1">3.4 min</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Margem Projetada</div>
        <div class="text-2xl font-bold font-mono text-blue-400 mt-1">15.2%</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Conversão na Troca</div>
        <div class="text-2xl font-bold font-mono text-purple-400 mt-1">68%</div>
      </div>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow">
      <div class="p-4 border-b border-slate-800 font-bold text-xs text-white">Carros Avaliados no Pátio Hoje</div>
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
          <tr>
            <th class="p-3">Veículo / Placa</th>
            <th class="p-3">Km / Avarias</th>
            <th class="p-3">Tabela FIPE</th>
            <th class="p-3">Score IA</th>
            <th class="p-3">Oferta Sugerida</th>
            <th class="p-3 text-right">Aprovação Gerente</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr>
            <td class="p-3 font-bold text-white">HB20 1.0 Comfort 2022 (BRA-4G21)</td>
            <td class="p-3 text-slate-300">42.000 km · 1 retoque leve no para-choque</td>
            <td class="p-3 font-mono text-slate-300">R$ 68.500</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">9.4 (Excelente)</span></td>
            <td class="p-3 font-mono font-bold text-emerald-400">R$ 56.000 - R$ 58.500</td>
            <td class="p-3 text-right">
              <button onclick="alert('Oferta de R$ 57.500 aprovada para proposta no carro zero km!')" class="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs">Aprovar Oferta ✅</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</body>
</html>`;
}

// ============================================================================
// 4. PROTÓTIPO: GAMIFICAÇÃO & FIDELIDADE (DEALER CLUB)
// ============================================================================
function buildGamificationHtml(
  title: string,
  problem: string,
  solution: string,
  area: string,
  discovery_answers: DiscoveryAnswers
): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <title>${title} | DealerHub Club</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex antialiased">
  <main class="flex-1 p-6 space-y-6">
    <header class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div>
        <h1 class="text-lg font-bold text-white">${title}</h1>
        <p class="text-xs text-slate-400">${solution}</p>
      </div>
      <button onclick="alert('Lançamento de pontos efetuado!')" class="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md">
        + Lançar Pontos de Fidelidade
      </button>
    </header>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Pontos em Circulação</div>
        <div class="text-2xl font-bold font-mono text-white mt-1">428.500</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Clientes no Clube</div>
        <div class="text-2xl font-bold font-mono text-purple-400 mt-1">1.420</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Retenção de Pós-Garantia</div>
        <div class="text-2xl font-bold font-mono text-emerald-400 mt-1">68.4%</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Vouchers Resgatados</div>
        <div class="text-2xl font-bold font-mono text-amber-400 mt-1">312</div>
      </div>
    </div>
  </main>
</body>
</html>`;
}

// ============================================================================
// 5. PROTÓTIPO: SISTEMA SAAS GERAL CUSTOMIZADO
// ============================================================================
function buildGeneralSaaSHtml(
  title: string,
  problem: string,
  solution: string,
  area: string,
  discovery_answers: DiscoveryAnswers
): string {
  const userProfile = discovery_answers.B_usuarios || 'Colaboradores & Gestores';
  const bottleneck = discovery_answers.G_gargalo || 'Processos manuais e lentidão operacional';

  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <title>${title} | DealerHub Operations</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex antialiased">
  <main class="flex-1 p-6 space-y-6">
    <header class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div>
        <div class="text-[10px] font-mono text-blue-400 uppercase tracking-wider">${area}</div>
        <h1 class="text-lg font-bold text-white mt-0.5">${title}</h1>
      </div>
      <button onclick="alert('Registro operacional criado!')" class="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md">
        + Nova Ação Operacional
      </button>
    </header>

    <div class="p-4 rounded-2xl bg-slate-900 border border-blue-500/20 text-xs text-slate-300">
      <strong class="text-white">Desafio:</strong> ${problem}<br/>
      <strong class="text-white mt-1 block">Solução:</strong> ${solution}
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Status Operacional</div>
        <div class="text-xl font-bold font-mono text-emerald-400 mt-1">Ativo</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Usuários Atendidos</div>
        <div class="text-xl font-bold font-mono text-white mt-1">${userProfile}</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Gargalo Mitigado</div>
        <div class="text-xs font-medium text-slate-300 mt-1 truncate">${bottleneck}</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Eficiência Projetada</div>
        <div class="text-xl font-bold font-mono text-blue-400 mt-1">+35%</div>
      </div>
    </div>
  </main>
</body>
</html>`;
}
