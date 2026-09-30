'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  Plus,
  Calendar,
  User,
  TrendingUp,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { getGoals, deleteGoal, getIdeas } from '@/lib/storage';
import { Goal, Idea } from '@/lib/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function MetasEstrategicasPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const loadData = () => {
    setGoals(getGoals());
    setIdeas(getIdeas());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-sync', loadData);
    return () => window.removeEventListener('storage-sync', loadData);
  }, []);

  const confirmDelete = () => {
    if (!goalToDelete) return;
    deleteGoal(goalToDelete.id);
    setGoalToDelete(null);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Administração Estratégica
          </p>
          <h1 className="text-2xl sm:text-[1.75rem] font-semibold text-white light:text-zinc-900 mt-2">
            Metas Corporativas &amp; Indicadores
          </h1>
          <p className="text-[13px] text-zinc-400 light:text-zinc-600 mt-1">
            Defina as prioridades da concessionária que orientam a pontuação estratégica das ideias.
          </p>
        </div>

        <Link
          href="/bymoto/metas/nova"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[13px] transition-colors self-start"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Cadastrar meta</span>
        </Link>
      </div>

      {/* Info Banner */}
      <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-4">
        <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-xs text-zinc-200 light:text-purple-950 space-y-1">
          <span className="font-bold text-sm text-white light:text-zinc-900">
            Como a IA utiliza estas Metas?
          </span>
          <p className="leading-relaxed text-zinc-300 light:text-purple-900">
            Sempre que uma nova ideia é enviada para avaliação, o motor de inteligência artificial cruza os requisitos do Discovery com todas as metas ativas nesta lista, atribuindo automaticamente uma nota de aderência (Alta, Média ou Baixa) e um percentual de alinhamento com os objetivos da diretoria.
          </p>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Metas Ativas no Período ({goals.length})
          </h2>
        </div>

        {goals.length === 0 ? (
          <div className="p-12 rounded-3xl bg-zinc-900/30 light:bg-white border border-dashed border-zinc-800 light:border-zinc-300 text-center space-y-3">
            <p className="text-sm text-zinc-400 light:text-zinc-600">
              Nenhuma meta cadastrada no momento.
            </p>
            <Link
              href="/bymoto/metas/nova"
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              Criar primeira meta <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-6 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 flex flex-col justify-between space-y-5 hover:border-purple-500/40 transition-all shadow-md group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-bold uppercase tracking-wider">
                      Meta Corporativa
                    </span>
                    <button
                      onClick={() => setGoalToDelete(goal)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Excluir meta ${goal.title}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white light:text-zinc-900 group-hover:text-purple-400 transition-colors">
                    {goal.title}
                  </h3>

                  <p className="text-xs text-zinc-300 light:text-zinc-700 leading-relaxed line-clamp-3">
                    {goal.description}
                  </p>

                  {/* KPI Box */}
                  <div className="p-3 rounded-2xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800/80 light:border-zinc-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Indicador Alvo:
                    </div>
                    <div className="text-xs font-bold text-zinc-100 light:text-zinc-900">
                      {goal.target_value} ({goal.indicator})
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div className="pt-3 border-t border-zinc-800/80 light:border-zinc-100 space-y-1.5 text-[11px] text-zinc-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-400" />
                      {goal.responsible}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      Até {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={goalToDelete !== null}
        onClose={() => setGoalToDelete(null)}
        onConfirm={confirmDelete}
        title="Remover meta"
        message={`A meta "${goalToDelete?.title ?? ''}" será removida e deixará de orientar a pontuação estratégica das ideias. Esta ação não pode ser desfeita.`}
        confirmLabel="Remover meta"
      />
    </div>
  );
}
