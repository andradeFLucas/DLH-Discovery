'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lightbulb, ArrowLeft, ArrowRight, Sparkles, Building2, AlertCircle } from 'lucide-react';
import { createIdea, getActiveProfile } from '@/lib/storage';

const BUSINESS_AREAS = [
  'Pós-Venda / Oficina',
  'Vendas de Veículos Novos',
  'Seminovos',
  'Peças e Acessórios',
  'F&I (Financiamento e Seguros)',
  'Atendimento e SAC',
  'Financeiro / Controladoria',
  'Tecnologia da Informação (TI)',
  'Recursos Humanos',
  'Marketing e CRM',
  'Diretoria e Operações',
];

export default function NovaIdeiaPage() {
  const router = useRouter();
  const activeProfile = getActiveProfile();

  const [title, setTitle] = useState('');
  const [area, setArea] = useState(BUSINESS_AREAS[0]);
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validação: todos os campos devem estar preenchidos
  const isValid =
    title.trim().length >= 5 &&
    problem.trim().length >= 15 &&
    solution.trim().length >= 15 &&
    Boolean(area);

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);

    const newIdea = createIdea({
      title: title.trim(),
      problem: problem.trim(),
      solution: solution.trim(),
      area,
      status: 'rascunho',
      author_name: activeProfile.name,
      discovery_answers: {},
      inferred_questions: {},
    });

    router.push(`/bymoto/submissao/discovery/${newIdea.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full animate-in fade-in">
      {/* Back button */}
      <Link
        href="/bymoto/submissao"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar para minhas ideias
      </Link>

      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
          <span className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs">
            1
          </span>
          <span>Etapa 1 de 3: Identificação do Desafio e Proposta Inicial</span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-zinc-900 tracking-tight">
            Conte-nos qual é a sua ideia
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 mt-1 leading-relaxed">
            Não se preocupe com termos técnicos. Descreva o problema que você vive no dia a dia da concessionária e como imagina que ele poderia ser resolvido.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleCreateDraft}
          className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 shadow-xl space-y-6"
        >
          {/* Título */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-zinc-200 light:text-zinc-800 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-400" />
              Título Curto da Ideia *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Check-in de Oficina Digital por Tablet com Fotos de Avarias"
              className="w-full rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 px-4 py-3 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-zinc-500">
              Um nome claro para identificar a ideia nos relatórios e no comitê.
            </p>
          </div>

          {/* Área */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-zinc-200 light:text-zinc-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              Área de Aplicação / Departamento *
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 px-4 py-3 text-sm text-zinc-100 light:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {BUSINESS_AREAS.map((bArea) => (
                <option key={bArea} value={bArea} className="bg-zinc-900 light:bg-white text-zinc-100 light:text-zinc-900">
                  {bArea}
                </option>
              ))}
            </select>
          </div>

          {/* Problema */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-zinc-200 light:text-zinc-800">
              Qual é o problema ou dor enfrentada hoje? *
            </label>
            <textarea
              rows={4}
              required
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Descreva o que acontece de errado, a lentidão ou as falhas que ocorrem na rotina da empresa..."
              className="w-full rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 px-4 py-3 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
              <span>Mínimo 15 caracteres ({problem.length} digitados)</span>
              {problem.length > 0 && problem.length < 15 && (
                <span className="text-amber-400 font-semibold">Muito curto</span>
              )}
            </div>
          </div>

          {/* Solução sugerida */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-zinc-200 light:text-zinc-800">
              Qual é a sua sugestão de solução? *
            </label>
            <textarea
              rows={4}
              required
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Como você imagina que esse problema poderia ser resolvido ou facilitado por um sistema, app ou automação?"
              className="w-full rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 px-4 py-3 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-400 light:text-zinc-600">
              <span>Mínimo 15 caracteres ({solution.length} digitados)</span>
              {solution.length > 0 && solution.length < 15 && (
                <span className="text-amber-400 font-semibold">Muito curto</span>
              )}
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 dark:text-blue-200 light:text-blue-950 flex items-start gap-3">
            <Sparkles className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-white light:text-blue-950">O que acontece a seguir?</span> Na próxima etapa,
              faremos um breve Discovery em 9 blocos com perguntas simples. Você poderá pular qualquer pergunta técnica e a IA cuidará de inferir as respostas!
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80 light:border-zinc-200">
            <Link
              href="/bymoto/submissao"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                isValid && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg cursor-pointer'
                  : 'bg-zinc-800 light:bg-zinc-200 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <span>{isSubmitting ? 'Iniciando...' : 'Continuar para o Discovery'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
