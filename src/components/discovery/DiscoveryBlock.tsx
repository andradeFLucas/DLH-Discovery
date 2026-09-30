'use client';

import React from 'react';
import { DiscoveryBlockInfo, DiscoveryQuestion } from '@/lib/discoveryQuestions';
import { Sparkles, HelpCircle, Check, Info } from 'lucide-react';

interface DiscoveryBlockProps {
  block: DiscoveryBlockInfo;
  answers: Record<string, string>;
  inferredQuestions: Record<string, boolean>;
  onChangeAnswer: (questionId: string, value: string) => void;
  onRequestSkip: (question: DiscoveryQuestion) => void;
  onClearInferred: (questionId: string) => void;
}

export default function DiscoveryBlock({
  block,
  answers,
  inferredQuestions,
  onChangeAnswer,
  onRequestSkip,
  onClearInferred,
}: DiscoveryBlockProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Block Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
            {block.letter}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white light:text-zinc-900">
            {block.title}
          </h2>
        </div>
        <p className="text-sm text-zinc-400 light:text-zinc-600 ml-11">
          {block.description}
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {block.questions.map((question, idx) => {
          const answerValue = answers[question.id] || '';
          const isInferred = inferredQuestions[question.id];
          const hasAnswer = answerValue.trim().length > 0;

          return (
            <div
              key={question.id}
              className={`p-5 rounded-2xl border transition-all ${
                isInferred
                  ? 'bg-amber-500/5 border-amber-500/30'
                  : hasAnswer
                  ? 'bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-white border-blue-500/30 shadow-sm'
                  : 'bg-zinc-900/20 dark:bg-zinc-900/20 light:bg-white border-zinc-800 light:border-zinc-200 hover:border-zinc-700'
              }`}
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5 flex-1">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-800 light:bg-zinc-100 text-zinc-400 light:text-zinc-600 shrink-0 mt-0.5">
                    #{idx + 1}
                  </span>
                  <label className="text-sm sm:text-base font-semibold text-zinc-100 light:text-zinc-900 leading-snug">
                    {question.label}
                  </label>
                </div>

                {/* Status or Skip action */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                  {isInferred ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        Inferido pela IA
                      </span>
                      <button
                        type="button"
                        onClick={() => onClearInferred(question.id)}
                        className="text-xs text-zinc-400 hover:text-zinc-200 underline transition-colors"
                      >
                        Digitar resposta
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRequestSkip(question)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-zinc-400 light:text-zinc-500 hover:text-amber-400 light:hover:text-amber-600 hover:bg-amber-500/10 transition-colors border border-transparent hover:border-amber-500/20"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Não sei responder
                    </button>
                  )}
                </div>
              </div>

              {/* Inferred Explanation Banner */}
              {isInferred ? (
                <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 light:text-amber-800 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <span className="font-semibold">Inferência Ativada:</span> A IA preencherá automaticamente os detalhes deste quesito na documentação técnica e protótipo.
                  </div>
                </div>
              ) : (
                /* Textarea */
                <textarea
                  rows={3}
                  value={answerValue}
                  onChange={(e) => onChangeAnswer(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  className="w-full rounded-xl bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 px-4 py-3 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                />
              )}

              {/* Example & AI Extraction Insight */}
              <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500">
                <p className="italic">
                  <span className="font-medium text-zinc-400 light:text-zinc-600">Exemplo:</span> {question.example}
                </p>
                <div className="inline-flex items-center gap-1.5 text-blue-400/80 light:text-blue-600 shrink-0 text-[11px]">
                  <Info className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[280px]" title={question.aiExtraction}>
                    {question.aiExtraction}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
