'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  Code2,
  FileText,
  Presentation,
  Building2,
  User,
  Calendar,
  Sparkles,
  HelpCircle,
  FileSearch,
  MessageSquare
} from 'lucide-react';
import { getIdeaById } from '@/lib/storage';
import { Idea } from '@/lib/types';
import InteractivePrototype from '@/components/artifacts/InteractivePrototype';
import LovablePromptViewer from '@/components/artifacts/LovablePromptViewer';
import TechnicalDocViewer from '@/components/artifacts/TechnicalDocViewer';
import PitchDeckViewer from '@/components/artifacts/PitchDeckViewer';
import { IdeaDetailSkeleton } from '@/components/ui/Skeleton';

export default function DetalheIdeiaColaboradorPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params.id as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [activeTab, setActiveTab] = useState<'prototype' | 'lovable' | 'techdoc' | 'pitch' | 'discovery'>('prototype');

  useEffect(() => {
    if (!ideaId) return;
    const loaded = getIdeaById(ideaId);
    if (!loaded) {
      router.push('/bymoto/submissao');
      return;
    }
    setIdea(loaded);
  }, [ideaId, router]);

  if (!idea) {
    return <IdeaDetailSkeleton />;
  }

  const getStatusDisplay = (status: Idea['status']) => {
    switch (status) {
      case 'aprovada':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          title: 'Ideia Aprovada pelo Comitê',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          desc: 'Parabéns! Sua proposta foi aprovada para desenvolvimento ou inclusão no roadmap de inovação.',
        };
      case 'reprovada':
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          title: 'Ideia Não Aprovada neste Ciclo',
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          desc: 'Agradecemos sua submissão. Veja abaixo as considerações e orientações enviadas pelos avaliadores.',
        };
      case 'standby':
        return {
          icon: <Clock className="w-5 h-5 text-amber-400" />,
          title: 'Ideia em Standby / Banco de Oportunidades',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          desc: 'A proposta tem mérito, mas aguarda alinhamento com os próximos ciclos orçamentários ou técnicos.',
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-blue-400" />,
          title: 'Ideia em Avaliação pelo Comitê',
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          desc: 'Sua proposta está sob análise dos gestores e do comitê executivo de inovação.',
        };
    }
  };

  const statusInfo = getStatusDisplay(idea.status);
  const assets = idea.assets;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div>
        <Link
          href="/bymoto/submissao"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para minhas propostas
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 light:bg-zinc-100 text-zinc-300 light:text-zinc-700">
                {idea.area}
              </span>
              <span className="text-xs text-zinc-500">
                Submetida em {new Date(idea.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-zinc-900">
              {idea.title}
            </h1>
            <p className="text-xs text-zinc-400">
              Autor: <strong className="text-zinc-200 light:text-zinc-800">{idea.author_name}</strong>
            </p>
          </div>

          {/* Status Badge Tag */}
          <div className={`p-4 rounded-2xl border ${statusInfo.bg} flex items-start gap-3 max-w-md`}>
            {statusInfo.icon}
            <div className="text-xs">
              <div className="font-bold">{statusInfo.title}</div>
              <div className="opacity-90 mt-0.5 leading-relaxed">{statusInfo.desc}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Parecer do Comitê (Se houver avaliação realizada) */}
      {idea.evaluation?.comments && (
        <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/80 light:bg-amber-50/40 border border-zinc-700 light:border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 light:text-amber-700 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            Parecer do Comitê Avaliador
          </div>
          <p className="text-sm text-zinc-200 light:text-zinc-800 leading-relaxed italic">
            &ldquo;{idea.evaluation.comments}&rdquo;
          </p>
          <div className="text-[11px] text-zinc-500 pt-1">
            Avaliador:{' '}
            <strong className="text-zinc-300 light:text-zinc-700">
              {idea.evaluation.evaluator_name || 'Comitê Executivo'}
            </strong>{' '}
            · Decisão registrada em{' '}
            {idea.evaluation.evaluated_at
              ? new Date(idea.evaluation.evaluated_at).toLocaleDateString('pt-BR')
              : 'Recente'}
          </div>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/80 light:bg-zinc-100 border border-zinc-800 light:border-zinc-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('prototype')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'prototype'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Protótipo</span>
        </button>

        <button
          onClick={() => setActiveTab('lovable')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'lovable'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Prompt Lovable</span>
        </button>

        <button
          onClick={() => setActiveTab('techdoc')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'techdoc'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Doc Técnica</span>
        </button>

        <button
          onClick={() => setActiveTab('pitch')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'pitch'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600'
          }`}
        >
          <Presentation className="w-3.5 h-3.5" />
          <span>Pitch Executivo</span>
        </button>

        <button
          onClick={() => setActiveTab('discovery')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'discovery'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600'
          }`}
        >
          <FileSearch className="w-3.5 h-3.5" />
          <span>Discovery Original</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === 'prototype' && assets?.prototype && (
          <InteractivePrototype prototype={assets.prototype} ideaTitle={idea.title} />
        )}

        {activeTab === 'lovable' && assets?.technical_prompt && (
          <LovablePromptViewer promptAsset={assets.technical_prompt} />
        )}

        {activeTab === 'techdoc' && assets?.technical_doc && (
          <TechnicalDocViewer docAsset={assets.technical_doc} ideaTitle={idea.title} />
        )}

        {activeTab === 'pitch' && assets?.commercial_deck && (
          <PitchDeckViewer deckAsset={assets.commercial_deck} ideaTitle={idea.title} />
        )}

        {/* Discovery Original Tab */}
        {activeTab === 'discovery' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white light:text-zinc-900">
                Respostas do Discovery da Proposta
              </h3>
              <p className="text-xs text-zinc-400 light:text-zinc-500">
                Informações fornecidas pelo autor e inferências automáticas geradas pela IA.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Problema Declarado
                </span>
                <p className="text-sm text-zinc-200 light:text-zinc-800 leading-relaxed">
                  {idea.problem}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Solução Sugerida
                </span>
                <p className="text-sm text-zinc-200 light:text-zinc-800 leading-relaxed">
                  {idea.solution}
                </p>
              </div>
            </div>

            {/* Respostas do questionário */}
            <div className="space-y-4 pt-4 border-t border-zinc-800 light:border-zinc-200">
              <h4 className="text-sm font-bold text-zinc-200 light:text-zinc-800">
                Perguntas Específicas do Discovery
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(idea.discovery_answers || {}).map(([key, val]) => {
                  const isInferred = idea.inferred_questions?.[key];
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-2xl bg-zinc-950/40 light:bg-zinc-50 border border-zinc-800/80 light:border-zinc-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-semibold text-blue-400">
                          {key}
                        </span>
                        {isInferred && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Inferido
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 light:text-zinc-700 leading-relaxed">
                        {val}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
