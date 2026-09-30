'use client';

import React, { useState, useMemo } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Code2,
  RefreshCw,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { PrototypeAsset } from '@/lib/types';
import { buildAutonomousSaaSHtml } from '@/lib/gemini';

interface InteractivePrototypeProps {
  prototype: PrototypeAsset;
  onUpdatePrototype?: (newProto: PrototypeAsset) => void;
  canEdit?: boolean;
  ideaTitle?: string;
}

export default function InteractivePrototype({
  prototype,
  onUpdatePrototype,
  canEdit = true,
  ideaTitle = 'Aplicação Corporativa',
}: InteractivePrototypeProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Estados de Refinamento com IA
  const [showRefineInput, setShowRefineInput] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refineSuccess, setRefineSuccess] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  // Garante que haja conteúdo HTML rico mesmo em ideias criadas anteriormente
  const htmlContent = useMemo(() => {
    let content = prototype.html_content;
    
    // Se o conteúdo estiver vazio ou corrompido, regera
    if (
      !content ||
      content.trim().length < 100 ||
      content.includes('/_next/') ||
      content.includes('DealerHub Banco de Ideias')
    ) {
      content = buildAutonomousSaaSHtml(
        ideaTitle,
        'Gargalo operacional no fluxo de atendimento',
        'Plataforma digital integrada para aceleração de processos',
        'Operações',
        {}
      );
    }

    // Script de segurança estrito para impedir que qualquer clique ou link navegue o iframe ou espelhe o app pai
    const antiMirrorScript = `
  <script>
    (function() {
      // Bloqueia qualquer tentativa de navegação externa ou descarregamento da página
      window.onbeforeunload = function() { return false; };
      
      // Intercepta todos os cliques em links no iframe para evitar recarregar a URL pai
      document.addEventListener('click', function(e) {
        var a = e.target.closest('a');
        if (a) {
          e.preventDefault();
          e.stopPropagation();
          var href = a.getAttribute('href');
          if (href && href.startsWith('#') && href.length > 1) {
            try {
              var target = document.querySelector(href);
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            } catch(err) {}
          }
        }
      }, true);

      // Previne submissão padrão de formulários
      document.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();
      }, true);
    })();
  </script>
`;

    if (content.includes('</head>')) {
      return content.replace('</head>', antiMirrorScript + '</head>');
    }
    return antiMirrorScript + content;
  }, [prototype.html_content, ideaTitle]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleRefineWithAi = async () => {
    if (!refinePrompt.trim() || isRefining) return;
    setIsRefining(true);
    setRefineError(null);
    setRefineSuccess(false);

    try {
      const res = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPrototype: prototype,
          instruction: refinePrompt.trim(),
          ideaTitle,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || 'Erro ao refinar protótipo.');
      }

      const updatedProto: PrototypeAsset = await res.json();
      if (onUpdatePrototype) {
        onUpdatePrototype(updatedProto);
      }
      setRefinePrompt('');
      setRefineSuccess(true);
      setIframeKey((prev) => prev + 1);
      setTimeout(() => setRefineSuccess(false), 4000);
    } catch (err: any) {
      console.error('Erro ao refinar protótipo:', err);
      setRefineError(err.message || 'Falha na comunicação com a IA.');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div
      className={`space-y-4 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 flex flex-col'
          : 'relative'
      }`}
    >
      {/* Top Canva Control Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-white border border-zinc-800 light:border-zinc-200 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: Info */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white light:text-zinc-900">
                Protótipo 'Canva' em HTML/CSS Interativo
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Tela Única de Sistema
              </span>
            </div>
            <p className="text-xs text-zinc-400 light:text-zinc-500">
              Aplicação SaaS simulada com layout corporativo, sidebar, formulários e ações com feedback em tempo real.
            </p>
          </div>
        </div>

        {/* Right: Viewport & Canva Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Viewport Selector */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-950 light:bg-zinc-100 border border-zinc-800 light:border-zinc-200 text-xs">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewport === 'desktop'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Visualização Desktop Completa"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => setViewport('tablet')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewport === 'tablet'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Visualização Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setViewport('mobile')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewport === 'mobile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Visualização Mobile (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Reload Iframe */}
          <button
            onClick={handleReload}
            title="Recarregar tela do protótipo"
            className="p-2 rounded-xl bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 text-zinc-300 light:text-zinc-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Copiar Código HTML */}
          <button
            onClick={handleCopyCode}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 text-zinc-200 light:text-zinc-800'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>HTML Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar HTML</span>
              </>
            )}
          </button>

          {/* Ajustar com IA (se canEdit) */}
          {canEdit && (
            <button
              onClick={() => setShowRefineInput(!showRefineInput)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showRefineInput
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 text-blue-400 light:text-blue-600'
              }`}
              title="Ajustar protótipo enviando instrução para a IA"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ajustar com IA</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 text-zinc-200 light:text-zinc-800 transition-colors"
            title={isFullscreen ? 'Sair da tela cheia' : 'Modo Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Caixa de Refinamento com IA */}
      {showRefineInput && canEdit && (
        <div className="p-4 rounded-2xl bg-zinc-900 border border-blue-500/30 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white">Refinar Protótipo Visual com IA</h4>
            </div>
            <span className="text-[11px] text-zinc-400">
              Descreva o ajuste desejado para a interface
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRefineWithAi()}
              placeholder="Ex: Altere os botões para verde esmeralda e adicione um gráfico de conversão..."
              disabled={isRefining}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleRefineWithAi}
              disabled={isRefining || !refinePrompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0"
            >
              {isRefining ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Atualizando Tela...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Aplicar Ajuste</span>
                </>
              )}
            </button>
          </div>

          {refineSuccess && (
            <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />
              <span>Protótipo atualizado com sucesso pela IA!</span>
            </div>
          )}

          {refineError && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
              {refineError}
            </div>
          )}
        </div>
      )}

      {/* Canva Display Canvas */}
      <div
        className={`w-full flex items-center justify-center transition-all bg-slate-950/80 p-2 sm:p-4 rounded-3xl border border-zinc-800 shadow-2xl ${
          isFullscreen ? 'flex-1 min-h-0' : 'h-[650px] sm:h-[720px]'
        }`}
      >
        <div
          className={`h-full transition-all duration-300 flex flex-col rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 ${
            viewport === 'desktop'
              ? 'w-full'
              : viewport === 'tablet'
              ? 'w-[768px] max-w-full'
              : 'w-[390px] max-w-full rounded-[40px] border-4 border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.8)]'
          }`}
        >
          {/* Simulated Browser Bar */}
          <div className="h-9 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-4 py-0.5 rounded-full border border-slate-800/80 truncate max-w-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>https://app.dealerhub.com/sistema</span>
            </div>

            <div className="text-[10px] text-slate-500 font-mono hidden sm:block">
              {viewport.toUpperCase()}
            </div>
          </div>

          {/* Iframe Sandbox */}
          <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-950">
            <iframe
              key={iframeKey}
              srcDoc={htmlContent}
              title="Protótipo Visual Interativo"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-modals allow-forms"
            />
          </div>
        </div>
      </div>

      {/* Rodapé informativo */}
      {prototype.generatedNotes && (
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 text-xs text-zinc-400 light:text-zinc-600 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed whitespace-pre-line">{prototype.generatedNotes}</div>
        </div>
      )}
    </div>
  );
}
