'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lightbulb, ArrowRight, Layers, Code2, FileText, Presentation, Target, ShieldCheck } from 'lucide-react';
import { getIdeas, getGoals, getActiveProfile } from '@/lib/storage';
import { Idea, Goal, UserProfile } from '@/lib/types';

export default function ByMotoHomePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadData = () => {
      setIdeas(getIdeas());
      setGoals(getGoals());
      setProfile(getActiveProfile());
    };

    loadData();
    window.addEventListener('storage-sync', loadData);
    return () => window.removeEventListener('storage-sync', loadData);
  }, []);

  const pendingCount = ideas.filter((i) => i.status === 'em_avaliacao').length;
  const approvedCount = ideas.filter((i) => i.status === 'aprovada').length;
  const userIdeas = ideas.filter((i) => i.author_name === profile?.name);

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-16 border-b border-zinc-800 light:border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl space-y-5">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Dealer Hub · By Moto · Inovação Corporativa
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-white light:text-zinc-900 leading-[1.12]">
              Transforme ideias em{' '}
              <span className="text-blue-400 light:text-blue-700">produtos estruturados</span> em minutos
            </h1>

            <p className="text-[15px] text-zinc-400 light:text-zinc-600 max-w-xl leading-relaxed">
              Discovery guiado em 9 blocos, prototipagem visual imediata, documentação técnica,
              prompt para ferramentas construtoras e alinhamento com as metas estratégicas da empresa.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/bymoto/submissao/nova"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors"
              >
                <Lightbulb className="w-4 h-4" aria-hidden="true" />
                <span>Submeter nova ideia</span>
              </Link>

              <Link
                href="/bymoto/banco"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-zinc-700 light:border-zinc-300 hover:bg-zinc-900 light:hover:bg-zinc-100 text-zinc-200 light:text-zinc-800 font-medium text-sm transition-colors"
              >
                <span>Explorar banco de ideias</span>
                <span className="font-mono text-xs text-zinc-500">{ideas.length}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas */}
      <section className="border-b border-zinc-800 light:border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-800 light:divide-zinc-200 border-x border-zinc-800 light:border-zinc-200">
            {[
              { n: ideas.length, label: 'Ideias cadastradas' },
              { n: pendingCount, label: 'Em avaliação' },
              { n: approvedCount, label: 'Aprovadas pelo comitê' },
              { n: goals.length, label: 'Metas corporativas' },
            ].map((m) => (
              <div key={m.label} className="px-5 py-6">
                <dd className="font-mono text-[1.75rem] leading-none font-medium text-white light:text-zinc-900 tabular-nums">
                  {String(m.n).padStart(2, '0')}
                </dd>
                <dt className="mt-2 text-[13px] text-zinc-400 light:text-zinc-600">{m.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Acesso por papel */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-7">
          <div>
            <h2 className="text-lg font-semibold text-white light:text-zinc-900">
              Painel de {profile?.name}
            </h2>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
              {profile?.role} · {profile?.department}
            </p>
          </div>
          <p className="text-xs text-zinc-500 hidden sm:block">
            Alterne o papel na barra superior para simular outros fluxos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800 light:bg-zinc-200 border border-zinc-800 light:border-zinc-200 rounded-xl overflow-hidden">
          {/* Colaborador */}
          <div className="bg-zinc-950 light:bg-white p-6 flex flex-col justify-between">
            <div className="space-y-2.5">
              <Lightbulb className="w-5 h-5 text-blue-400" aria-hidden="true" />
              <h3 className="text-[15px] font-semibold text-white light:text-zinc-900">Portal do Colaborador</h3>
              <p className="text-[13px] text-zinc-400 light:text-zinc-600 leading-relaxed">
                Inicie uma submissão com o Discovery guiado ou acompanhe o status das suas propostas.
              </p>
              <p className="font-mono text-[11px] text-zinc-500 pt-1">
                {userIdeas.length} ideia(s) submetida(s)
              </p>
            </div>
            <div className="pt-6 flex flex-col gap-2">
              <Link
                href="/bymoto/submissao/nova"
                className="py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                Nova ideia <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/bymoto/submissao"
                className="py-2.5 px-4 rounded-lg border border-zinc-800 light:border-zinc-200 hover:bg-zinc-900 light:hover:bg-zinc-100 text-zinc-300 light:text-zinc-700 text-[13px] font-medium flex items-center justify-center transition-colors"
              >
                Minhas ideias & rascunhos
              </Link>
            </div>
          </div>

          {/* Avaliador */}
          <div className="bg-zinc-950 light:bg-white p-6 flex flex-col justify-between">
            <div className="space-y-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-400" aria-hidden="true" />
              <h3 className="text-[15px] font-semibold text-white light:text-zinc-900">Portal do Avaliador</h3>
              <p className="text-[13px] text-zinc-400 light:text-zinc-600 leading-relaxed">
                Consulte o banco corporativo com filtros de aderência às metas, explore artefatos e delibere.
              </p>
              <p className="font-mono text-[11px] text-amber-400 pt-1">
                {pendingCount} proposta(s) aguardando avaliação
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/bymoto/banco"
                className="py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                Avaliar ideias <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Metas */}
          <div className="bg-zinc-950 light:bg-white p-6 flex flex-col justify-between">
            <div className="space-y-2.5">
              <Target className="w-5 h-5 text-blue-400" aria-hidden="true" />
              <h3 className="text-[15px] font-semibold text-white light:text-zinc-900">Metas Estratégicas</h3>
              <p className="text-[13px] text-zinc-400 light:text-zinc-600 leading-relaxed">
                Defina os objetivos da diretoria que orientam a IA na pontuação e classificação das ideias.
              </p>
              <p className="font-mono text-[11px] text-zinc-500 pt-1">
                {goals.length} meta(s) ativa(s)
              </p>
            </div>
            <div className="pt-6">
              <Link
                href="/bymoto/metas"
                className="py-2.5 px-4 rounded-lg border border-zinc-800 light:border-zinc-200 hover:bg-zinc-900 light:hover:bg-zinc-100 text-zinc-300 light:text-zinc-700 text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                Gerenciar metas <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Entregáveis da IA */}
      <section className="py-12 border-t border-zinc-800 light:border-zinc-200 mt-auto bg-zinc-950/40 light:bg-zinc-100/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-9">
            <h2 className="text-lg font-semibold text-white light:text-zinc-900">
              O que a IA gera para cada proposta
            </h2>
            <p className="text-[13px] text-zinc-400 light:text-zinc-600 mt-1">
              Colaboradores sem perfil técnico recebem um pacote executivo pronto para a diretoria.
            </p>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-800 light:bg-zinc-200 border border-zinc-800 light:border-zinc-200 rounded-xl overflow-hidden">
            {[
              { icon: Layers, t: 'Protótipo interativo', d: 'Wireframe navegável simulando a experiência final em desktop e mobile.' },
              { icon: Code2, t: 'Prompt Lovable', d: 'Instruções de engenharia prontas para gerar o código em ferramentas no-code.' },
              { icon: FileText, t: 'Documentação técnica', d: 'Requisitos, modelo de dados, integrações e conformidade LGPD.' },
              { icon: Presentation, t: 'Apresentação comercial', d: 'Pitch deck com problema, solução e estimativa de ROI.' },
            ].map(({ icon: Icon, t, d }, i) => (
              <li key={t} className="bg-zinc-950 light:bg-white p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Icon className="w-[18px] h-[18px] text-blue-400" aria-hidden="true" />
                  <span className="font-mono text-[11px] text-zinc-600">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="text-[13px] font-semibold text-white light:text-zinc-900">{t}</h3>
                <p className="text-xs text-zinc-400 light:text-zinc-600 leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
