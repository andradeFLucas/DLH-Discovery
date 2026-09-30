'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trash2,
  Sparkles,
  Layers,
  Search
} from 'lucide-react';
import { getIdeas, deleteIdea, getActiveProfile } from '@/lib/storage';
import { Idea, UserProfile } from '@/lib/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function SubmissaoDashboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [draftToDelete, setDraftToDelete] = useState<Idea | null>(null);

  const loadData = () => {
    setIdeas(getIdeas());
    setProfile(getActiveProfile());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-sync', loadData);
    return () => window.removeEventListener('storage-sync', loadData);
  }, []);

  const requestDeleteDraft = (draft: Idea, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraftToDelete(draft);
  };

  const confirmDeleteDraft = () => {
    if (!draftToDelete) return;
    deleteIdea(draftToDelete.id);
    setDraftToDelete(null);
    loadData();
  };

  // Filtrar ideias do colaborador logado ou todas se demo
  const myIdeas = ideas.filter(
    (i) =>
      !profile ||
      profile.role !== 'colaborador' ||
      i.author_name === profile.name ||
      i.status === 'rascunho'
  );

  const drafts = myIdeas.filter(
    (i) =>
      i.status === 'rascunho' &&
      (i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.problem.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const submitted = myIdeas.filter(
    (i) =>
      i.status !== 'rascunho' &&
      (i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.problem.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: Idea['status']) => {
    switch (status) {
      case 'aprovada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aprovada
          </span>
        );
      case 'reprovada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Reprovada
          </span>
        );
      case 'standby':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Em Standby
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5" />
            Em Avaliação
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white light:text-zinc-900 tracking-tight">
            Portal de Submissão de Ideias
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600 mt-1">
            Transforme seus desafios e ideias operacionais em soluções técnicas com suporte da IA.
          </p>
        </div>

        <Link
          href="/bymoto/submissao/nova"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Proposta de Ideia</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar em minhas ideias e rascunhos..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-300 text-xs sm:text-sm text-zinc-200 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Drafts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Rascunhos em Andamento ({drafts.length})
          </h2>
          <span className="text-xs text-zinc-500">
            Ideias que ainda não foram enviadas para avaliação
          </span>
        </div>

        {drafts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/20 light:bg-white border border-dashed border-zinc-800 light:border-zinc-300 text-center space-y-2">
            <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600">
              Você não possui nenhum rascunho pendente no momento.
            </p>
            <Link
              href="/bymoto/submissao/nova"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Criar um novo agora <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="p-5 rounded-2xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 hover:border-zinc-700 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                      Rascunho
                    </span>
                    <button
                      onClick={(e) => requestDeleteDraft(draft, e)}
                      aria-label={`Excluir rascunho ${draft.title || 'sem título'}`}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <h3 className="font-bold text-sm text-white light:text-zinc-900 line-clamp-1">
                    {draft.title || 'Ideia sem título'}
                  </h3>
                  <p className="text-xs text-zinc-400 light:text-zinc-600 line-clamp-2">
                    {draft.problem || 'Problema não especificado...'}
                  </p>
                  <div className="text-[11px] text-zinc-500">
                    Área: <span className="font-medium text-zinc-300 light:text-zinc-700">{draft.area}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 light:border-zinc-100 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">
                    {new Date(draft.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <Link
                    href={
                      draft.assets
                        ? `/bymoto/submissao/validacao/${draft.id}`
                        : `/bymoto/submissao/discovery/${draft.id}`
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    <span>Continuar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submitted Ideas Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-blue-400" />
            Propostas Submetidas ({submitted.length})
          </h2>
          <span className="text-xs text-zinc-500">
            Acompanhe o parecer do comitê avaliador
          </span>
        </div>

        {submitted.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/20 light:bg-white border border-zinc-800 light:border-zinc-300 text-center">
            <p className="text-xs sm:text-sm text-zinc-400 light:text-zinc-600">
              Nenhuma ideia submetida ainda. Conclua o preenchimento de um rascunho para enviá-la ao comitê!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {submitted.map((idea) => (
              <Link
                key={idea.id}
                href={`/bymoto/submissao/ideia/${idea.id}`}
                className="p-5 rounded-2xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 hover:border-blue-500/40 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(idea.status)}
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {new Date(idea.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white light:text-zinc-900 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {idea.title}
                  </h3>

                  <p className="text-xs text-zinc-400 light:text-zinc-600 line-clamp-2 leading-relaxed">
                    {idea.problem}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 light:bg-zinc-100 text-zinc-300 light:text-zinc-700">
                      {idea.area}
                    </span>
                    {idea.evaluation && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Score: {idea.evaluation.strategic_score}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/60 light:border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
                  <span className="text-[11px] text-zinc-500">Por: {idea.author_name}</span>
                  <span className="text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Ver Proposta <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={draftToDelete !== null}
        onClose={() => setDraftToDelete(null)}
        onConfirm={confirmDeleteDraft}
        title="Excluir rascunho"
        message={`O rascunho "${draftToDelete?.title || 'sem título'}" será removido permanentemente. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir rascunho"
      />
    </div>
  );
}
