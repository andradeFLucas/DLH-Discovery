'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { getIdeaById, updateIdea } from '@/lib/storage';
import { Idea } from '@/lib/types';
import { DISCOVERY_BLOCKS, DiscoveryQuestion } from '@/lib/discoveryQuestions';
import DiscoveryBlock from '@/components/discovery/DiscoveryBlock';
import SkipModal from '@/components/discovery/SkipModal';

export default function DiscoveryWizardPage() {
  const params = useParams();
  const router = useRouter();
  const ideaId = params.id as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inferredQuestions, setInferredQuestions] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Skip Modal State
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [questionToSkip, setQuestionToSkip] = useState<DiscoveryQuestion | null>(null);

  useEffect(() => {
    if (!ideaId) return;
    const loaded = getIdeaById(ideaId);
    if (!loaded) {
      router.push('/bymoto/submissao');
      return;
    }
    setIdea(loaded);
    setAnswers(loaded.discovery_answers || {});
    setInferredQuestions(loaded.inferred_questions || {});
  }, [ideaId, router]);

  if (!idea) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-400">
        Carregando Discovery...
      </div>
    );
  }

  const currentBlock = DISCOVERY_BLOCKS[currentBlockIndex];
  const totalBlocks = DISCOVERY_BLOCKS.length;
  const progressPercent = Math.round(((currentBlockIndex + 1) / totalBlocks) * 100);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleRequestSkip = (question: DiscoveryQuestion) => {
    setQuestionToSkip(question);
    setIsSkipModalOpen(true);
  };

  const handleConfirmSkip = () => {
    if (!questionToSkip) return;
    setInferredQuestions((prev) => ({
      ...prev,
      [questionToSkip.id]: true,
    }));
    setAnswers((prev) => ({
      ...prev,
      [questionToSkip.id]: '[A ser inferido automaticamente pela IA]',
    }));
    setIsSkipModalOpen(false);
    setQuestionToSkip(null);
  };

  const handleClearInferred = (questionId: string) => {
    setInferredQuestions((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
    setAnswers((prev) => {
      const copy = { ...prev };
      if (copy[questionId] === '[A ser inferido automaticamente pela IA]') {
        delete copy[questionId];
      }
      return copy;
    });
  };

  const saveCurrentProgress = () => {
    updateIdea(idea.id, {
      discovery_answers: answers,
      inferred_questions: inferredQuestions,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleNext = () => {
    saveCurrentProgress();
    if (currentBlockIndex < totalBlocks - 1) {
      setCurrentBlockIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Chegou ao fim do discovery: avança para a validação e geração com IA
      router.push(`/bymoto/submissao/validacao/${idea.id}`);
    }
  };

  const handlePrev = () => {
    saveCurrentProgress();
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/bymoto/submissao"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Salvar e sair para o painel
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Etapa 2: Discovery Guiado
            </span>
            <span className="text-xs text-zinc-500">· {idea.area}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white light:text-zinc-900 mt-1 line-clamp-1">
            {idea.title}
          </h1>
        </div>

        {/* Quick Save */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={saveCurrentProgress}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 light:bg-white border border-zinc-800 light:border-zinc-300 text-xs font-medium text-zinc-300 light:text-zinc-700 hover:bg-zinc-800 transition-colors"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Salvo!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Progresso</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-zinc-300 light:text-zinc-700">
            Bloco <strong className="text-blue-400">{currentBlockIndex + 1}</strong> de {totalBlocks}:{' '}
            <span className="text-zinc-400 light:text-zinc-500">{currentBlock.title}</span>
          </span>
          <span className="text-blue-400 font-bold">{progressPercent}% concluído</span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-zinc-800 light:bg-zinc-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Mini Block Navigator Tabs */}
        <div className="flex items-center justify-between gap-1 pt-1 overflow-x-auto pb-1 scrollbar-none">
          {DISCOVERY_BLOCKS.map((blk, idx) => {
            const isCompleted = idx < currentBlockIndex;
            const isCurrent = idx === currentBlockIndex;
            return (
              <button
                key={blk.id}
                onClick={() => {
                  saveCurrentProgress();
                  setCurrentBlockIndex(idx);
                }}
                className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md scale-110'
                    : isCompleted
                    ? 'bg-blue-900/40 text-blue-300 hover:bg-blue-800/60'
                    : 'bg-zinc-800/60 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                }`}
                title={`${blk.letter}: ${blk.title}`}
              >
                {blk.letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discovery Block Question Renderer */}
      <DiscoveryBlock
        block={currentBlock}
        answers={answers}
        inferredQuestions={inferredQuestions}
        onChangeAnswer={handleAnswerChange}
        onRequestSkip={handleRequestSkip}
        onClearInferred={handleClearInferred}
      />

      {/* Bottom Nav Actions */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentBlockIndex === 0}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            currentBlockIndex === 0
              ? 'opacity-40 cursor-not-allowed text-zinc-600'
              : 'text-zinc-300 light:text-zinc-700 hover:bg-zinc-800 light:hover:bg-zinc-100'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Bloco Anterior</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            {currentBlockIndex === totalBlocks - 1 ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Artefatos com IA</span>
              </>
            ) : (
              <>
                <span>Próximo Bloco</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Skip Question Modal */}
      <SkipModal
        isOpen={isSkipModalOpen}
        onClose={() => setIsSkipModalOpen(false)}
        onConfirm={handleConfirmSkip}
        questionLabel={questionToSkip?.label}
      />
    </div>
  );
}
