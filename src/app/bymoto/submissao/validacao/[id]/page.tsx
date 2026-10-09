'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Edit3,
  Send,
  Layers,
  Code2,
  FileText,
  Presentation,
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { getIdeaById, updateIdea, getGoals, createNotification } from '@/lib/storage';
import { Idea, GeneratedAssets, PrototypeAsset } from '@/lib/types';
import { refinePrototypeAsset, classifyIdeaAlignment } from '@/lib/gemini';
import InteractivePrototype from '@/components/artifacts/InteractivePrototype';
import LovablePromptViewer from '@/components/artifacts/LovablePromptViewer';
import TechnicalDocViewer from '@/components/artifacts/TechnicalDocViewer';
import PitchDeckViewer from '@/components/artifacts/PitchDeckViewer';
import Modal from '@/components/ui/Modal';

const LOADING_MESSAGES = [
  'Analisando o desafio e as respostas do Discovery...',
  'Estruturando arquitetura e componentes de front-end...',
  'Desenhando wireframes e fluxo de navegação do protótipo...',
  'Formatando requisitos funcionais e mapeamento de banco de dados...',
  'Redigindo prompt técnico para Lovable / Next.js...',
  'Consolidando estimativas de ROI e slides para apresentação da diretoria...',
  'Finalizando os 4 artefatos estruturados...',
];

export default function ValidacaoPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params.id as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [activeTab, setActiveTab] = useState<'prototype' | 'lovable' | 'techdoc' | 'pitch'>('prototype');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Refine Modal
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  // Submit Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  // Carregar e se não tiver assets, disparar geração inicial
  useEffect(() => {
    if (!ideaId) return;
    const loaded = getIdeaById(ideaId);
    if (!loaded) {
      router.push('/bymoto/submissao');
      return;
    }
    setIdea(loaded);

    if (!loaded.assets) {
      generateAssets(loaded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId, router]);

  // Rotação de mensagens durante a geração
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const generateAssets = async (targetIdea: Idea) => {
    setIsGenerating(true);
    setGenerationError(null);

    const basePayload = {
      title: targetIdea.title,
      problem: targetIdea.problem,
      solution: targetIdea.solution,
      area: targetIdea.area,
      discovery_answers: targetIdea.discovery_answers || {},
    };

    // Cada estágio é uma requisição independente (limite de tempo próprio no servidor).
    const callStage = async (stage: string, extra: Record<string, unknown> = {}) => {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...basePayload, stage, ...extra }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(
          errBody?.details ||
            (res.status === 504
              ? `Tempo limite excedido no estágio "${stage}".`
              : `Falha no estágio "${stage}" (HTTP ${res.status}).`),
        );
      }
      return res.json();
    };

    try {
      const blueprint = await callStage('blueprint');
      const [prototype, technical_doc, commercial_deck] = await Promise.all([
        callStage('prototype', { blueprint }),
        callStage('technical_doc', { blueprint }),
        callStage('pitch', { blueprint }),
      ]);

      const generated = {
        prototype,
        technical_doc,
        commercial_deck,
        version: 1,
        lastUpdated: new Date().toISOString(),
      };
      const updated = updateIdea(targetIdea.id, { assets: generated });
      if (updated) setIdea(updated);
    } catch (err) {
      console.error('Falha na geração dos artefatos por IA:', err);
      setGenerationError(
        `Não foi possível gerar os artefatos com IA agora. ${
          err instanceof Error ? err.message : ''
        } Suas respostas do Discovery foram preservadas; clique em tentar novamente.`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefinePrototype = async () => {
    if (!idea || !idea.assets?.prototype || !refineFeedback.trim()) return;
    setIsRefining(true);
    try {
      let updatedProto: PrototypeAsset;
      try {
        const res = await fetch('/api/ai/refine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPrototype: idea.assets.prototype,
            instruction: refineFeedback.trim(),
            ideaTitle: idea.title,
          }),
        });
        if (res.ok) {
          updatedProto = await res.json();
        } else {
          updatedProto = await refinePrototypeAsset(idea.assets.prototype, refineFeedback, idea.title);
        }
      } catch {
        updatedProto = await refinePrototypeAsset(idea.assets.prototype, refineFeedback, idea.title);
      }

      const newAssets: GeneratedAssets = {
        ...idea.assets,
        prototype: updatedProto,
      };
      const updated = updateIdea(idea.id, { assets: newAssets });
      if (updated) {
        setIdea(updated);
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 5000);
      }
      setIsRefineModalOpen(false);
      setRefineFeedback('');
    } catch (err) {
      console.error('Erro ao refinar protótipo:', err);
      setGenerationError('Não foi possível ajustar o protótipo agora. Tente novamente em instantes.');
      setIsRefineModalOpen(false);
    } finally {
      setIsRefining(false);
    }
  };

  const handleConfirmAndSend = async () => {
    if (!idea) return;
    setIsSubmittingFinal(true);

    try {
      // 1. Alinhar com as metas cadastradas
      const goals = getGoals();
      const alignments = await classifyIdeaAlignment(idea, goals);

      // Calcular média de aderência
      let totalScore = 0;
      let highestCategory: 'alta' | 'media' | 'baixa' = 'baixa';

      if (alignments.length > 0) {
        totalScore = Math.round(
          alignments.reduce((acc, a) => acc + a.score, 0) / alignments.length
        );
        const hasAlta = alignments.some((a) => a.alignment_level === 'alta');
        const hasMedia = alignments.some((a) => a.alignment_level === 'media');
        highestCategory = hasAlta ? 'alta' : hasMedia ? 'media' : 'baixa';
      }

      // 2. Atualizar ideia para 'em_avaliacao'
      const updated = updateIdea(idea.id, {
        status: 'em_avaliacao',
        evaluation: {
          strategic_alignment: highestCategory,
          strategic_score: totalScore || 75,
          strategic_feedback:
            alignments.length > 0
              ? alignments[0].justification
              : 'Proposta com bom potencial de eficiência operacional.',
        },
      });

      // 3. Notificações in-app
      createNotification({
        user_id: 'colaborador-1',
        title: 'Proposta enviada com sucesso!',
        message: `Sua ideia "${idea.title}" foi encaminhada para análise do comitê avaliador.`,
        idea_id: idea.id,
      });

      createNotification({
        user_id: 'gestor-1',
        title: 'Nova ideia submetida para avaliação',
        message: `${idea.author_name} submeteu a ideia "${idea.title}" na área de ${idea.area}.`,
        idea_id: idea.id,
      });

      setIsSubmitModalOpen(false);
      router.push(`/bymoto/submissao/ideia/${idea.id}`);
    } catch (err) {
      console.error('Erro ao submeter ideia:', err);
      setGenerationError('Não foi possível enviar a proposta ao comitê agora. Tente novamente.');
      setIsSubmitModalOpen(false);
      setIsSubmittingFinal(false);
    }
  };

  if (!idea) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-zinc-300 light:text-zinc-600">
        Carregando proposta...
      </div>
    );
  }

  // TELA DE ERRO: geração inicial falhou e não há artefatos
  if (!isGenerating && generationError && !idea.assets) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
          <AlertCircle className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white light:text-zinc-900">Falha ao gerar os artefatos</h2>
          <p className="text-sm text-zinc-300 light:text-zinc-600 leading-relaxed">{generationError}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/bymoto/submissao/discovery/${idea.id}`}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 light:hover:bg-zinc-200 text-zinc-200 light:text-zinc-800 transition-colors"
          >
            Revisar Discovery
          </Link>
          <button
            type="button"
            onClick={() => generateAssets(idea)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950 light:focus:ring-offset-white"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // TELA DE CARREGAMENTO DINÂMICO
  if (isGenerating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-6 animate-in fade-in">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 animate-pulse">
            <Sparkles className="w-10 h-10 animate-spin text-blue-400" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white light:text-zinc-900">
            A IA está estruturando sua solução
          </h2>
          <p className="text-sm text-zinc-400 light:text-zinc-600 min-h-[44px] flex items-center justify-center transition-all duration-300">
            {LOADING_MESSAGES[loadingMsgIndex]}
          </p>
        </div>

        {/* Progress Bar Animation */}
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full animate-indeterminate" />
        </div>

        <p className="text-xs text-zinc-500">
          Isso leva cerca de 5 a 10 segundos para gerar protótipo, prompt, doc técnica e pitch deck.
        </p>
      </div>
    );
  }

  const assets = idea.assets;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/bymoto/submissao/discovery/${idea.id}`}
              className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Editar Discovery
            </Link>
            <span className="text-xs text-zinc-600">·</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Etapa 3: Validação da Proposta
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white light:text-zinc-900">
            {idea.title}
          </h1>
          <p className="text-xs text-zinc-400 light:text-zinc-500">
            Área: <strong className="text-zinc-200 light:text-zinc-800">{idea.area}</strong> · Proponente:{' '}
            <strong className="text-zinc-200 light:text-zinc-800">{idea.author_name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Botão de Refinar Protótipo */}
          <button
            type="button"
            onClick={() => setIsRefineModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 light:hover:bg-zinc-200 text-xs font-semibold text-zinc-200 light:text-zinc-800 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Ajustar Protótipo</span>
          </button>

          {/* Botão Confirmar e Enviar */}
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>Confirmar e Enviar Proposta</span>
          </button>
        </div>
      </div>

      {/* Selo de Atualizado Agora */}
      {justUpdated && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>Protótipo atualizado com sucesso com base nas suas orientações!</span>
        </div>
      )}

      {/* Banner de erro (ação falhou, mas há artefatos) */}
      {generationError && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 light:text-red-800 flex items-start gap-2 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="flex-1">{generationError}</span>
          <button
            type="button"
            onClick={() => setGenerationError(null)}
            className="font-semibold underline hover:no-underline shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          >
            Dispensar
          </button>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/80 light:bg-zinc-100 border border-zinc-800 light:border-zinc-200 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('prototype')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'prototype'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600 hover:bg-zinc-800/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Protótipo Interativo</span>
        </button>

        <button
          onClick={() => setActiveTab('techdoc')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'techdoc'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600 hover:bg-zinc-800/40'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. Documentação Técnica</span>
        </button>

        <button
          onClick={() => setActiveTab('pitch')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pitch'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600 hover:bg-zinc-800/40'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>3. Apresentação Executiva</span>
        </button>

        {assets?.technical_prompt && (
          <button
            onClick={() => setActiveTab('lovable')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'lovable'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 light:text-zinc-600 hover:bg-zinc-800/40'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Prompt Lovable (Legado)</span>
          </button>
        )}
      </div>

      {/* Tab Content Display */}
      {assets && (
        <div className="space-y-6">
          {activeTab === 'prototype' && assets.prototype && (
            <InteractivePrototype
              prototype={assets.prototype}
              ideaTitle={idea.title}
              onUpdatePrototype={(newProto) => {
                if (!idea || !idea.assets) return;
                const newAssets = { ...idea.assets, prototype: newProto };
                const updated = updateIdea(idea.id, { assets: newAssets });
                if (updated) setIdea(updated);
              }}
            />
          )}

          {activeTab === 'lovable' && assets.technical_prompt && (
            <LovablePromptViewer promptAsset={assets.technical_prompt} />
          )}

          {activeTab === 'techdoc' && assets.technical_doc && (
            <TechnicalDocViewer docAsset={assets.technical_doc} ideaTitle={idea.title} />
          )}

          {activeTab === 'pitch' && assets.commercial_deck && (
            <PitchDeckViewer deckAsset={assets.commercial_deck} ideaTitle={idea.title} />
          )}
        </div>
      )}

      {/* Modal de Ajuste/Refinamento do Protótipo (US-05) */}
      <Modal
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        dismissible={!isRefining}
        title="Como você quer ajustar o protótipo?"
        description="Diga o que gostaria de alterar no visual, telas ou elementos da solução. A IA irá reprocessar os wireframes mantendo a estrutura da proposta."
        size="md"
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Refinamento com IA
        </p>

        <label htmlFor="refine-feedback" className="sr-only">
          Instruções de ajuste do protótipo
        </label>
        <textarea
          id="refine-feedback"
          rows={4}
          value={refineFeedback}
          onChange={(e) => setRefineFeedback(e.target.value)}
          placeholder="Ex: Adicione um botão para envio de fotos pelo WhatsApp; ou inclua uma etapa de assinatura digital na tela de checkout..."
          className="w-full rounded-xl bg-zinc-900 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 p-4 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setIsRefineModalOpen(false)}
            disabled={isRefining}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 light:text-zinc-600 hover:text-white light:hover:text-zinc-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleRefinePrototype}
            disabled={!refineFeedback.trim() || isRefining}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950 light:focus:ring-offset-white ${
              refineFeedback.trim() && !isRefining
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                : 'bg-zinc-800 light:bg-zinc-200 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isRefining ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>Ajustando com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Regenerar Protótipo</span>
              </>
            )}
          </button>
        </div>
      </Modal>

      {/* Modal de Confirmação de Envio */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        dismissible={!isSubmittingFinal}
        title="Confirmar envio para o Comitê?"
        size="sm"
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
          <Send className="w-3.5 h-3.5" aria-hidden="true" /> Submissão Final
        </p>
        <p className="text-xs text-zinc-400 light:text-zinc-600 leading-relaxed">
          Ao confirmar, a proposta passará para o status <strong>Em Avaliação</strong> e será classificada
          automaticamente frente às metas estratégicas da empresa.
        </p>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(false)}
            disabled={isSubmittingFinal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 light:text-zinc-600 hover:text-white light:hover:text-zinc-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Revisar mais
          </button>
          <button
            type="button"
            onClick={handleConfirmAndSend}
            disabled={isSubmittingFinal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950 light:focus:ring-offset-white"
          >
            {isSubmittingFinal ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>Processando envio...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Confirmar e Submeter</span>
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
