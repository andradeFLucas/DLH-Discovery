'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Code2,
  FileText,
  Presentation,
  FileSearch,
  Sparkles,
  Building2,
  User,
  ShieldCheck,
  Target,
  MessageSquare
} from 'lucide-react';
import { getIdeaById, evaluateIdea, getActiveProfile, getGoals } from '@/lib/storage';
import { Idea, Goal } from '@/lib/types';
import InteractivePrototype from '@/components/artifacts/InteractivePrototype';
import LovablePromptViewer from '@/components/artifacts/LovablePromptViewer';
import TechnicalDocViewer from '@/components/artifacts/TechnicalDocViewer';
import PitchDeckViewer from '@/components/artifacts/PitchDeckViewer';
import DecisionModal from '@/components/evaluation/DecisionModal';
import { IdeaDetailSkeleton } from '@/components/ui/Skeleton';

export default function DetalheAvaliacaoBancoPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params.id as string;
  const activeProfile = getActiveProfile();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<'prototype' | 'lovable' | 'techdoc' | 'pitch' | 'discovery'>('prototype');

  // Decision Modal State
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<'aprovada' | 'reprovada' | 'standby'>('aprovada');

  const loadData = () => {
    if (!ideaId) return;
    const loaded = getIdeaById(ideaId);
    if (!loaded) {
      router.push('/bymoto/banco');
      return;
    }
    setIdea(loaded);
    setGoals(getGoals());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-sync', loadData);
    return () => window.removeEventListener('storage-sync', loadData);
  }, [ideaId, router]);

  if (!idea) {
    return <IdeaDetailSkeleton />;
  }

  const handleOpenDecision = (type: 'aprovada' | 'reprovada' | 'standby') => {
    setDecisionType(type);
    setIsDecisionModalOpen(true);
  };

  const handleConfirmDecision = (comment: string) => {
    evaluateIdea(
      idea.id,
      decisionType,
      activeProfile.full_name || activeProfile.name || 'Avaliador',
      comment,
      idea.evaluation?.strategic_score || 80
    );
    setIsDecisionModalOpen(false);
    loadData();
  };

  const assets = idea.assets;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 animate-in fade-in">
      {/* Back to bank */}
      <div>
        <Link
          href="/bymoto/banco"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o Banco de Ideias
        </Link>

        {/* Top Evaluation Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-zinc-900/70 light:bg-white border border-zinc-800 light:border-zinc-200 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 light:bg-zinc-100 text-zinc-300 light:text-zinc-700">
                  {idea.area}
                </span>
                <span className="text-xs text-zinc-500">
                  Submetida em {new Date(idea.created_at).toLocaleDateString('pt-BR')} por{' '}
                  <strong className="text-zinc-300 light:text-zinc-800">{idea.author_name}</strong>
                </span>

                {idea.evaluation?.strategic_alignment && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                    Score: {idea.evaluation.strategic_score}% · Aderência {idea.evaluation.strategic_alignment.toUpperCase()}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-zinc-900 leading-snug">
                {idea.title}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 light:text-zinc-600 leading-relaxed max-w-4xl">
                {idea.problem}
              </p>
            </div>

            {/* Deliberation Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 bg-zinc-950/60 light:bg-zinc-100 p-2.5 rounded-2xl border border-zinc-800/80 light:border-zinc-200">
              <button
                type="button"
                onClick={() => handleOpenDecision('aprovada')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  idea.status === 'aprovada'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-900 light:bg-white text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aprovar</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenDecision('standby')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  idea.status === 'standby'
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-900 light:bg-white text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Standby</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenDecision('reprovada')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  idea.status === 'reprovada'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-900 light:bg-white text-red-400 hover:bg-red-500/20 border border-red-500/30'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Reprovar</span>
              </button>
            </div>
          </div>

          {/* Parecer registrado no comitê */}
          {idea.evaluation?.comments && (
            <div className="p-4 rounded-2xl bg-zinc-950/80 light:bg-amber-50/50 border border-zinc-800 light:border-amber-200 text-xs text-zinc-300 light:text-zinc-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-400 light:text-amber-700 uppercase tracking-wider text-[11px]">
                <MessageSquare className="w-3.5 h-3.5" />
                Parecer Registrado pelo Avaliador
              </div>
              <p className="italic leading-relaxed">&ldquo;{idea.evaluation.comments}&rdquo;</p>
              <div className="text-[10px] text-zinc-500 pt-0.5">
                Por {idea.evaluation.evaluator_name || 'Comitê Executivo'} · Status atual:{' '}
                <strong className="capitalize">{idea.status}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/80 light:bg-zinc-100 border border-zinc-800 light:border-zinc-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('prototype')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'prototype'
              ? 'bg-indigo-600 text-white shadow-md'
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
              ? 'bg-indigo-600 text-white shadow-md'
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
              ? 'bg-indigo-600 text-white shadow-md'
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
              ? 'bg-indigo-600 text-white shadow-md'
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
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600'
          }`}
        >
          <FileSearch className="w-3.5 h-3.5" />
          <span>Discovery</span>
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

        {/* Discovery Tab */}
        {activeTab === 'discovery' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white light:text-zinc-900">
                Respostas Completas do Discovery
              </h3>
              <p className="text-xs text-zinc-400 light:text-zinc-500">
                Auditoria das informações preenchidas pelo autor e inferências automáticas.
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

            <div className="space-y-4 pt-4 border-t border-zinc-800 light:border-zinc-200">
              <h4 className="text-sm font-bold text-zinc-200 light:text-zinc-800">
                Perguntas e Inferências
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
                        <span className="text-[11px] font-mono font-semibold text-indigo-400">
                          {key}
                        </span>
                        {isInferred && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Inferido pela IA
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

      {/* Decision Modal com justificativa obrigatória para reprovação */}
      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        decision={decisionType}
        onConfirm={handleConfirmDecision}
        ideaTitle={idea.title}
      />
    </div>
  );
}
