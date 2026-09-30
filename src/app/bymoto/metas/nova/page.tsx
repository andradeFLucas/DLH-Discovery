'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Target, ArrowLeft, ArrowRight, TrendingUp, Calendar, User, FileText } from 'lucide-react';
import { createGoal } from '@/lib/storage';

export default function NovaMetaPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [indicator, setIndicator] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [responsible, setResponsible] = useState('Diretoria de Inovação & Operações');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    title.trim().length >= 5 &&
    description.trim().length >= 10 &&
    indicator.trim().length >= 3 &&
    targetValue.trim().length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    createGoal({
      title: title.trim(),
      description: description.trim(),
      indicator: indicator.trim(),
      target_value: targetValue.trim(),
      deadline,
      responsible: responsible.trim(),
    });

    router.push('/bymoto/metas');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full animate-in fade-in">
      {/* Back link */}
      <Link
        href="/bymoto/metas"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar para lista de metas
      </Link>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <Target className="w-4 h-4" />
            <span>Cadastro Estratégico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-zinc-900 tracking-tight">
            Nova Meta Corporativa
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 mt-1">
            Cadastre os objetivos para que a IA pontue automaticamente a aderência de cada proposta submetida.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 shadow-xl space-y-6"
        >
          {/* Título */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-zinc-200 light:text-zinc-800 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              Título da Meta Estratégica *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reduzir tempo de recepção de oficina em 30%"
              className="w-full rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 px-4 py-3 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-zinc-200 light:text-zinc-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              Descrição e Contexto do Objetivo *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explique o impacto esperado, justificativa de negócio e escopo..."
              className="w-full rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 px-4 py-3 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
            />
          </div>

          {/* Indicador e Valor Alvo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-zinc-200 light:text-zinc-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Indicador / Métrica (KPI) *
              </label>
              <input
                type="text"
                required
                value={indicator}
                onChange={(e) => setIndicator(e.target.value)}
                placeholder="Ex: Tempo médio de check-in (minutos)"
                className="w-full rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 px-4 py-3 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-zinc-200 light:text-zinc-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Valor Alvo Esperado *
              </label>
              <input
                type="text"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Ex: &le; 10 min por veículo"
                className="w-full rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 px-4 py-3 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Prazo e Responsável */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-zinc-200 light:text-zinc-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Prazo Limite para Atingimento *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 px-4 py-3 text-sm text-zinc-100 light:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-zinc-200 light:text-zinc-800 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                Área / Responsável *
              </label>
              <input
                type="text"
                required
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Ex: Gerência de Pós-Venda"
                className="w-full rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 px-4 py-3 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80 light:border-zinc-200">
            <Link
              href="/bymoto/metas"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                isValid && !isSubmitting
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Meta Estratégica'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
