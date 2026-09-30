'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Target,
  User
} from 'lucide-react';
import { getIdeas, getGoals } from '@/lib/storage';
import { Idea, Goal } from '@/lib/types';

export default function BancoDeIdeiasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedAlignment, setSelectedAlignment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'recent' | 'oldest'>('score');

  const loadData = () => {
    setIdeas(getIdeas());
    setGoals(getGoals());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage-sync', loadData);
    return () => window.removeEventListener('storage-sync', loadData);
  }, []);

  // Coletar áreas distintas
  const distinctAreas = Array.from(new Set(ideas.map((i) => i.area).filter(Boolean)));

  // Filtragem
  const filteredIdeas = ideas.filter((idea) => {
    // Esconder rascunhos da visualização pública do banco, a não ser que explicitamente pedido
    if (idea.status === 'rascunho') return false;

    // Busca textual
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = idea.title.toLowerCase().includes(q);
      const matchProblem = idea.problem.toLowerCase().includes(q);
      const matchAuthor = idea.author_name.toLowerCase().includes(q);
      const matchArea = idea.area.toLowerCase().includes(q);
      if (!matchTitle && !matchProblem && !matchAuthor && !matchArea) return false;
    }

    // Filtro por Status
    if (selectedStatus !== 'all' && idea.status !== selectedStatus) {
      return false;
    }

    // Filtro por Área
    if (selectedArea !== 'all' && idea.area !== selectedArea) {
      return false;
    }

    // Filtro por Aderência
    if (selectedAlignment !== 'all') {
      const alignment = idea.evaluation?.strategic_alignment || 'baixa';
      if (alignment !== selectedAlignment) return false;
    }

    return true;
  });

  // Ordenação
  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = a.evaluation?.strategic_score || 0;
      const scoreB = b.evaluation?.strategic_score || 0;
      return scoreB - scoreA;
    }
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return 0;
  });

  const getStatusBadge = (status: Idea['status']) => {
    const map: Record<string, { label: string; dot: string; text: string }> = {
      aprovada: { label: 'Aprovada', dot: 'bg-emerald-500', text: 'text-emerald-400 light:text-emerald-700' },
      reprovada: { label: 'Reprovada', dot: 'bg-red-500', text: 'text-red-400 light:text-red-700' },
      standby: { label: 'Standby', dot: 'bg-amber-500', text: 'text-amber-400 light:text-amber-700' },
      em_avaliacao: { label: 'Em avaliação', dot: 'bg-blue-500', text: 'text-blue-400 light:text-blue-700' },
    };
    const s = map[status] ?? map.em_avaliacao;
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
        {s.label}
      </span>
    );
  };

  const getAlignmentBadge = (alignment?: 'alta' | 'media' | 'baixa', score?: number) => {
    if (!alignment) return null;
    const text = {
      alta: 'text-emerald-400 light:text-emerald-700',
      media: 'text-amber-400 light:text-amber-700',
      baixa: 'text-zinc-400 light:text-zinc-500',
    }[alignment];

    return (
      <span
        className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-medium ${text}`}
        title={`Aderência estratégica: ${alignment.toUpperCase()}`}
      >
        {score ? `${score}%` : ''} · aderência {alignment}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            Governança &amp; Comitê
          </p>
          <h1 className="text-2xl sm:text-[1.75rem] font-semibold text-white light:text-zinc-900 mt-2">
            Banco Corporativo de Ideias
          </h1>
          <p className="text-[13px] text-zinc-400 light:text-zinc-600 mt-1">
            Explore, analise e delibere sobre as soluções submetidas pelas equipes em todas as filiais.
          </p>
        </div>

        <Link
          href="/bymoto/submissao/nova"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-[13px] transition-colors self-start"
        >
          <span>Nova ideia</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Filters Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, problema, autor..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 text-xs text-zinc-200 light:text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 text-xs text-zinc-200 light:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Status: Todos</option>
              <option value="em_avaliacao">Em Avaliação</option>
              <option value="aprovada">Aprovada</option>
              <option value="standby">Standby</option>
              <option value="reprovada">Reprovada</option>
            </select>
          </div>

          {/* Area filter */}
          <div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 text-xs text-zinc-200 light:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Área: Todas</option>
              {distinctAreas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Alignment filter */}
          <div>
            <select
              value={selectedAlignment}
              onChange={(e) => setSelectedAlignment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 text-xs text-zinc-200 light:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Aderência: Todas</option>
              <option value="alta">Alta Aderência</option>
              <option value="media">Média Aderência</option>
              <option value="baixa">Baixa Aderência</option>
            </select>
          </div>
        </div>

        {/* Counter and Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/80 light:border-zinc-100 text-xs">
          <div className="text-zinc-400 light:text-zinc-600">
            Encontrada(s) <strong className="text-white light:text-zinc-900">{sortedIdeas.length}</strong>{' '}
            proposta(s) com os critérios atuais.
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar por:
            </span>
            <button
              onClick={() => setSortBy('score')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                sortBy === 'score'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 light:bg-zinc-100 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Score Estratégico
            </button>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                sortBy === 'recent'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 light:bg-zinc-100 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mais Recentes
            </button>
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      {sortedIdeas.length === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-900/30 light:bg-white border border-dashed border-zinc-800 light:border-zinc-300 text-center space-y-3">
          <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white light:text-zinc-900">
            Nenhuma ideia encontrada
          </h3>
          <p className="text-xs text-zinc-400 light:text-zinc-600 max-w-sm mx-auto">
            Tente remover alguns filtros ou buscar por outros termos de pesquisa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedIdeas.map((idea) => (
            <Link
              key={idea.id}
              href={`/bymoto/banco/${idea.id}`}
              className="p-6 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 hover:border-indigo-500/50 flex flex-col justify-between space-y-5 transition-all hover:shadow-xl group"
            >
              <div className="space-y-3">
                {/* Header badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {getStatusBadge(idea.status)}
                  {getAlignmentBadge(
                    idea.evaluation?.strategic_alignment,
                    idea.evaluation?.strategic_score
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white light:text-zinc-900 group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {idea.title}
                </h3>

                {/* Problem snippet */}
                <p className="text-xs text-zinc-400 light:text-zinc-600 line-clamp-3 leading-relaxed">
                  {idea.problem}
                </p>

                {/* Feedback / Justification Preview */}
                {idea.evaluation?.strategic_feedback && (
                  <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-indigo-300 light:text-indigo-900 line-clamp-2 italic">
                    &ldquo;{idea.evaluation.strategic_feedback}&rdquo;
                  </div>
                )}
              </div>

              {/* Bottom Meta */}
              <div className="pt-4 border-t border-zinc-800/80 light:border-zinc-100 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-medium text-zinc-300 light:text-zinc-700 flex items-center gap-1.5 text-[11px]">
                    <User className="w-3 h-3 text-zinc-500" />
                    {idea.author_name}
                  </div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {idea.area}
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 font-bold text-xs text-indigo-400 group-hover:translate-x-1 transition-transform">
                  Avaliar <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
