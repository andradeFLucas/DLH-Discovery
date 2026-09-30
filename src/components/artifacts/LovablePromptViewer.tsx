'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink, Code2, Cpu, Database, Server } from 'lucide-react';
import { TechnicalPromptAsset } from '@/lib/types';

interface LovablePromptViewerProps {
  promptAsset: TechnicalPromptAsset;
}

export default function LovablePromptViewer({ promptAsset }: LovablePromptViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptAsset.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 light:bg-zinc-50 rounded-2xl border border-zinc-800 light:border-zinc-200 overflow-hidden shadow-xl">
      {/* Header com Metadados da Stack */}
      <div className="p-4 bg-zinc-900/90 light:bg-white border-b border-zinc-800 light:border-zinc-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white light:text-zinc-900 flex items-center gap-2">
              Prompt Técnico para IA Construtora (ex: Lovable / Bolt / Cursor)
            </h3>
            <p className="text-xs text-zinc-400 light:text-zinc-500">
              Engenharia de prompt estruturada no nível de software engineer, pronta para geração de código
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-purple-600 hover:bg-purple-500 text-white active:scale-95'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copiado para Área de Transferência!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar Prompt para Lovable
            </>
          )}
        </button>
      </div>

      {/* Badges da Stack Padrão */}
      <div className="px-4 py-2.5 bg-zinc-900/40 light:bg-zinc-100 border-b border-zinc-800/80 light:border-zinc-200 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-semibold text-zinc-500 uppercase mr-1">Stack do Produto:</span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 light:bg-white border border-zinc-700/60 light:border-zinc-300 text-zinc-300 light:text-zinc-800">
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Next.js 14 App Router</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 light:bg-white border border-zinc-700/60 light:border-zinc-300 text-zinc-300 light:text-zinc-800">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Supabase (Postgres/RLS/Storage)</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 light:bg-white border border-zinc-700/60 light:border-zinc-300 text-zinc-300 light:text-zinc-800">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span>Deploy na Vercel</span>
        </div>
      </div>

      {/* Visualizador do Texto do Prompt */}
      <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-zinc-300 light:text-zinc-800 leading-relaxed whitespace-pre-wrap selection:bg-purple-500/30">
        {promptAsset.prompt_text}
      </div>

      {/* Rodapé informativo */}
      <div className="p-3 bg-zinc-900/60 light:bg-white border-t border-zinc-800 light:border-zinc-200 text-xs text-zinc-500 flex items-center justify-between">
        <span>Basta colar este prompt diretamente no Lovable.dev ou ferramenta compatível.</span>
        <a
          href="https://lovable.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px] font-semibold"
        >
          Abrir Lovable <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
