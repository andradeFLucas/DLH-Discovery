'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  Server,
  Database,
  ShieldCheck,
  Layers,
  Calendar,
  CheckCircle2,
  Code2,
  Lock,
  ChevronRight,
  UserCheck,
  Cpu,
  Route,
  Terminal,
  AlertTriangle,
  ListChecks,
} from 'lucide-react';
import { TechnicalDocAsset } from '@/lib/types';
import { buildCompletePRDDocument } from '@/lib/gemini';

interface TechnicalDocViewerProps {
  docAsset: TechnicalDocAsset;
  ideaTitle?: string;
}

export default function TechnicalDocViewer({
  docAsset: rawDocAsset,
  ideaTitle = 'Solução Operacional',
}: TechnicalDocViewerProps) {
  const [copied, setCopied] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Garante que todo o documento tenha as 13 seções preenchidas mesmo em dados legados
  const docAsset = useMemo(() => {
    if (rawDocAsset.macro_modules && rawDocAsset.macro_modules.length > 0 && rawDocAsset.user_stories) {
      return rawDocAsset;
    }
    const fallback = buildCompletePRDDocument(
      ideaTitle,
      'Gargalo operacional identificado na rotina diária da concessionária',
      'Plataforma digital integrada para aceleração do fluxo operacional',
      'Pós-Venda / Oficina',
      {}
    );
    return {
      ...fallback,
      ...rawDocAsset,
      macro_modules: rawDocAsset.macro_modules || fallback.macro_modules,
      user_stories: rawDocAsset.user_stories || fallback.user_stories,
      personas: rawDocAsset.personas || fallback.personas,
      database_tables: rawDocAsset.database_tables || fallback.database_tables,
      architecture_justification: rawDocAsset.architecture_justification || fallback.architecture_justification,
      app_routes: rawDocAsset.app_routes || fallback.app_routes,
      ai_contracts: rawDocAsset.ai_contracts || fallback.ai_contracts,
      rls_policies: rawDocAsset.rls_policies || fallback.rls_policies,
      env_vars: rawDocAsset.env_vars || fallback.env_vars,
      error_states: rawDocAsset.error_states || fallback.error_states,
      roadmap_phases: rawDocAsset.roadmap_phases || fallback.roadmap_phases,
      next_steps: rawDocAsset.next_steps || fallback.next_steps,
    };
  }, [rawDocAsset, ideaTitle]);

  const sqlCode = docAsset.data_model_sql || '';

  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    let md = `# BANCO DE IDEIAS COM IA · DEALER HUB\n`;
    md += `## Documento de Especificação Funcional e Técnica (PRD)\n`;
    md += `### Projeto: ${ideaTitle}\n`;
    md += `Versão: ${docAsset.document_version || '1.0 — Setembro de 2026'}\n\n`;

    md += `### 1. Resumo Executivo\n${docAsset.executive_summary || ''}\n\n`;

    md += `### 2. Objetivos do Produto\n`;
    docAsset.product_objectives?.forEach((obj) => {
      md += `- ${obj}\n`;
    });
    md += `\n`;

    md += `### 3. Personas\n`;
    docAsset.personas?.forEach((p) => {
      md += `#### ${p.persona} (${p.role})\nNecessidades: ${p.needs}\n\n`;
    });

    md += `### 4. Módulos do Sistema (Macro-Funcionalidades)\n`;
    docAsset.macro_modules?.forEach((mod) => {
      md += `#### ${mod.title}\n${mod.objective}\n`;
      mod.sub_features.forEach((sf) => {
        md += `- **${sf.name}**: ${sf.description}\n`;
      });
      md += `\n`;
    });

    md += `### 5. Histórias de Usuário\n`;
    docAsset.user_stories?.forEach((us) => {
      md += `#### ${us.id} — ${us.title}\n**Ator:** ${us.actor}\n${us.description}\n\n`;
    });

    md += `### 6. Script DDL PostgreSQL\n\`\`\`sql\n${sqlCode}\n\`\`\`\n`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Printable CSS Hook para A4 PDF Perfeito */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            margin: 14mm 16mm;
            size: A4 portrait;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
          body * {
            visibility: hidden !important;
          }
          #print-document,
          #print-document * {
            visibility: visible !important;
          }
          #print-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          #print-document h1,
          #print-document h2,
          #print-document h3,
          #print-document h4,
          #print-document h5,
          #print-document strong {
            color: #0f172a !important;
          }
          #print-document p,
          #print-document li,
          #print-document td {
            color: #334155 !important;
          }
          #print-document table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: avoid;
          }
          #print-document th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
          }
          #print-document td {
            border: 1px solid #cbd5e1 !important;
          }
          #print-document pre,
          #print-document code {
            background: #f8fafc !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
            font-size: 8pt !important;
            white-space: pre-wrap !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
        }
      `,
        }}
      />

      {/* Header Actions Card (Oculto na impressão) */}
      <div className="no-print p-5 rounded-2xl bg-zinc-900/90 dark:bg-zinc-900/90 light:bg-white border border-zinc-800 light:border-zinc-200 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white light:text-zinc-900">
                Documentação Técnica Completa (Padrão PRD 1.0 Oficial)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                13 Seções de Engenharia
              </span>
            </div>
            <p className="text-xs text-zinc-400 light:text-zinc-500">
              Resumo executivo, personas, módulos com regras de negócio, histórias de usuário (US-01 a US-08), DDL relacional e contratos de API.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 text-zinc-200 light:text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Markdown Copiado!' : 'Copiar .MD'}</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-102"
          >
            <Printer className="w-4 h-4" />
            <span>Exportar PDF Oficial</span>
          </button>
        </div>
      </div>

      {/* Documento Oficial de Engenharia (Visível na tela e na impressão) */}
      <div
        id="print-document"
        className="p-6 sm:p-12 rounded-3xl bg-zinc-900/80 dark:bg-zinc-900/80 light:bg-white border border-zinc-800 light:border-zinc-200 shadow-2xl space-y-12"
      >
        {/* =========================================================================
            CAPA DO DOCUMENTO (Visual Oficial)
           ========================================================================= */}
        <div className="text-center py-12 border-b border-zinc-800 light:border-zinc-200 space-y-6">
          <div className="inline-block px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold uppercase tracking-widest">
            BANCO DE IDEIAS COM IA · DEALER HUB
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white light:text-zinc-900 tracking-tight max-w-3xl mx-auto uppercase">
            {ideaTitle}
          </h1>
          <p className="text-base text-zinc-300 light:text-zinc-600 max-w-2xl mx-auto">
            Discovery guiado, Prototipagem automática e Governança de Soluções
          </p>
          <div className="pt-4 text-xs font-mono text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-300 light:text-zinc-700">
              Documento de Especificação Funcional e Técnica (PRD)
            </div>
            <div>{docAsset.document_version || 'Versão 1.0 — Setembro de 2026'}</div>
          </div>
        </div>

        {/* =========================================================================
            1. RESUMO EXECUTIVO
           ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5 border-b border-zinc-800 light:border-zinc-200 pb-2">
            <span className="text-indigo-400">1.</span> Resumo Executivo
          </h2>
          <p className="text-sm text-zinc-300 light:text-zinc-700 leading-relaxed text-justify">
            {docAsset.executive_summary}
          </p>
        </section>

        {/* =========================================================================
            2. OBJETIVOS DO PRODUTO
           ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5 border-b border-zinc-800 light:border-zinc-200 pb-2">
            <span className="text-indigo-400">2.</span> Objetivos do Produto
          </h2>
          <ul className="space-y-2.5 text-sm text-zinc-300 light:text-zinc-700">
            {docAsset.product_objectives?.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* =========================================================================
            3. PERSONAS
           ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5 border-b border-zinc-800 light:border-zinc-200 pb-2">
            <span className="text-indigo-400">3.</span> Personas
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 light:border-zinc-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-950 light:bg-zinc-100 text-zinc-300 light:text-zinc-700 border-b border-zinc-800 light:border-zinc-200">
                  <th className="py-3 px-4 font-bold uppercase tracking-wider w-1/4">Persona</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider w-2/5">Papel na Solução</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider">Necessidades & Dores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 light:divide-zinc-200">
                {docAsset.personas?.map((p, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/30 light:hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white light:text-zinc-900 align-top">
                      {p.persona}
                    </td>
                    <td className="py-3 px-4 text-zinc-300 light:text-zinc-700 align-top leading-relaxed">
                      {p.role}
                    </td>
                    <td className="py-3 px-4 text-zinc-400 light:text-zinc-600 align-top leading-relaxed">
                      {p.needs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* =========================================================================
            4. VISÃO GERAL DO FLUXO
           ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5 border-b border-zinc-800 light:border-zinc-200 pb-2">
            <span className="text-indigo-400">4.</span> Visão Geral do Fluxo da Solução
          </h2>
          <div className="space-y-2">
            <div className="text-xs text-zinc-400 font-semibold mb-2">Passo a passo da jornada operacional:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {docAsset.journey_steps?.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 text-zinc-300 light:text-zinc-700 flex items-start gap-2.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. MÓDULOS DO SISTEMA (MACRO-FUNCIONALIDADES)
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-zinc-800 light:border-zinc-200 pb-2">
            <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5">
              <span className="text-indigo-400">5.</span> Módulos do Sistema (Macro-Funcionalidades da Solução)
            </h2>
            <p className="text-xs text-zinc-400 light:text-zinc-500 mt-1">
              Pilares funcionais centrais da aplicação, sub-funcionalidades e regras de negócio operacionais.
            </p>
          </div>

          <div className="space-y-6">
            {docAsset.macro_modules?.map((mod) => (
              <div
                key={mod.module_number}
                className="p-5 sm:p-6 rounded-2xl bg-zinc-950/70 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-4"
              >
                {/* Header do Módulo */}
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-indigo-400 uppercase">
                    Funcionalidade Macro 0{mod.module_number}
                  </div>
                  <h3 className="text-base font-bold text-white light:text-zinc-900">{mod.title}</h3>
                  <p className="text-xs text-zinc-300 light:text-zinc-700 leading-relaxed">{mod.objective}</p>
                </div>

                {/* Sub-funcionalidades do Módulo */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Sub-funcionalidades Detalhadas:
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-zinc-800/80 light:border-zinc-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-900 light:bg-zinc-100 text-zinc-300 light:text-zinc-700 border-b border-zinc-800/80 light:border-zinc-200">
                          <th className="py-2.5 px-3.5 font-bold w-1/3">Sub-Funcionalidade</th>
                          <th className="py-2.5 px-3.5 font-bold">Descrição Operacional</th>
                          <th className="py-2.5 px-3.5 font-bold w-1/3">O que o Sistema / IA Extrai</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 light:divide-zinc-200">
                        {mod.sub_features.map((sf, i) => (
                          <tr key={i}>
                            <td className="py-2.5 px-3.5 font-semibold text-white light:text-zinc-900 align-top">
                              {sf.name}
                            </td>
                            <td className="py-2.5 px-3.5 text-zinc-300 light:text-zinc-700 align-top leading-relaxed">
                              {sf.description}
                            </td>
                            <td className="py-2.5 px-3.5 text-zinc-400 light:text-zinc-600 align-top leading-relaxed">
                              {sf.input_or_extraction || 'Validação de dados e persistência'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Regras de Negócio do Módulo */}
                {mod.business_rules.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/60 light:border-zinc-200 space-y-1.5">
                    <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Regras de Negócio Obrigatórias:
                    </div>
                    <ul className="space-y-1 text-xs text-zinc-400 light:text-zinc-600">
                      {mod.business_rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            9. ARQUITETURA TÉCNICA & JUSTIFICATIVA DA STACK
           ========================================================================= */}
        <section className="space-y-6 page-break">
          <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5 border-b border-zinc-800 light:border-zinc-200 pb-2">
            <span className="text-indigo-400">9.</span> Arquitetura Técnica & Justificativa da Stack
          </h2>

          <p className="text-xs text-zinc-300 light:text-zinc-700 leading-relaxed">
            Stack definida: <strong>Next.js (framework) + Supabase (banco de dados/auth/storage) + Vercel (hospedagem)</strong>.
          </p>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2">
              <h4 className="font-bold text-sm text-indigo-400">9.1 Por que Next.js</h4>
              <ul className="space-y-1.5 text-zinc-300 light:text-zinc-700 list-disc list-inside">
                {docAsset.architecture_justification?.nextjs.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2">
              <h4 className="font-bold text-sm text-indigo-400">9.2 Por que Supabase</h4>
              <ul className="space-y-1.5 text-zinc-300 light:text-zinc-700 list-disc list-inside">
                {docAsset.architecture_justification?.supabase.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2">
              <h4 className="font-bold text-sm text-indigo-400">9.3 Por que Vercel</h4>
              <ul className="space-y-1.5 text-zinc-300 light:text-zinc-700 list-disc list-inside">
                {docAsset.architecture_justification?.vercel.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2">
              <h4 className="font-bold text-sm text-indigo-400">9.4 Visão de Componentes da Arquitetura</h4>
              <ul className="space-y-1.5 text-zinc-300 light:text-zinc-700 list-disc list-inside">
                {docAsset.architecture_justification?.components.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. HISTÓRIAS DE USUÁRIO DETALHADAS (US-01 a US-08+)
           ========================================================================= */}
        <section className="space-y-4 page-break">
          <div className="border-b border-zinc-800 light:border-zinc-200 pb-2">
            <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5">
              <span className="text-indigo-400">10.</span> Histórias de Usuário Detalhadas
            </h2>
            <p className="text-xs text-zinc-400 light:text-zinc-500 mt-1">
              Fluxo completo descrito em nível de interação: cliques, o que aparece na tela (campos, pop-ups) e o que o sistema confirma de volta.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {docAsset.user_stories?.map((us) => (
              <div
                key={us.id}
                className="p-4 rounded-2xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[11px]">
                      {us.id}
                    </span>
                    <h3 className="font-bold text-sm text-white light:text-zinc-900">{us.title}</h3>
                  </div>
                  <div className="text-[11px] font-semibold text-zinc-400">
                    Ator: <strong className="text-zinc-200 light:text-zinc-800">{us.actor}</strong>
                  </div>
                </div>
                <p className="text-zinc-300 light:text-zinc-700 leading-relaxed">{us.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            11. ANEXO TÉCNICO DE IMPLEMENTAÇÃO
           ========================================================================= */}
        <section className="space-y-6 page-break">
          <div className="border-b border-zinc-800 light:border-zinc-200 pb-2">
            <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5">
              <span className="text-indigo-400">11.</span> Anexo Técnico de Implementação
            </h2>
            <p className="text-xs text-zinc-400 light:text-zinc-500 mt-1">
              Especificações para desenvolvedores: modelo de dados relacional, rotas, contratos de API/IA e políticas RLS.
            </p>
          </div>

          {/* 11.1 Modelo de Dados & Dicionário de Tabelas */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <Database className="w-4 h-4" />
              11.1 Modelo de Dados (Supabase / PostgreSQL)
            </h3>

            <div className="space-y-4">
              {docAsset.database_tables?.map((table) => (
                <div
                  key={table.table_name}
                  className="rounded-2xl border border-zinc-800 light:border-zinc-200 overflow-hidden"
                >
                  <div className="p-3 bg-zinc-950 light:bg-zinc-100 border-b border-zinc-800 light:border-zinc-200 flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-indigo-300">{table.table_name}</span>
                    <span className="text-[11px] text-zinc-400">{table.description}</span>
                  </div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/50 light:bg-zinc-50 text-zinc-400 border-b border-zinc-800/80 light:border-zinc-200">
                        <th className="py-2 px-3 w-1/4 font-semibold">Campo</th>
                        <th className="py-2 px-3 w-1/4 font-semibold">Tipo</th>
                        <th className="py-2 px-3 font-semibold">Descrição</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 light:divide-zinc-200">
                      {table.columns.map((col, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-mono font-semibold text-white light:text-zinc-900">
                            {col.field}
                          </td>
                          <td className="py-2 px-3 font-mono text-zinc-400">{col.type}</td>
                          <td className="py-2 px-3 text-zinc-300 light:text-zinc-700">{col.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Script DDL Executável */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">Script SQL DDL Executável com RLS:</span>
                <button
                  onClick={handleCopySql}
                  className="no-print px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{sqlCopied ? 'DDL Copiado!' : 'Copiar Script SQL'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-indigo-200 overflow-x-auto max-h-96">
                <code>{sqlCode}</code>
              </pre>
            </div>
          </div>

          {/* 11.2 Rotas das Aplicações */}
          <div className="space-y-3 pt-4 border-t border-zinc-800 light:border-zinc-200">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <Route className="w-4 h-4" />
              11.2 Rotas das Aplicações
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {docAsset.app_routes?.map((app, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2"
                >
                  <h4 className="font-bold text-xs text-white light:text-zinc-900 border-b border-zinc-800/60 pb-1.5">
                    {app.app_name}
                  </h4>
                  <ul className="space-y-1.5 text-zinc-300 light:text-zinc-700">
                    {app.routes.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 font-mono text-[11px]">
                        <strong className="text-indigo-400 shrink-0">{r.path}</strong>
                        <span className="font-sans text-zinc-400">{r.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 11.3 Contratos de IA & APIs REST */}
          <div className="space-y-3 pt-4 border-t border-zinc-800 light:border-zinc-200">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              11.3 Contratos de IA & Integrações (Entrada / Saída)
            </h3>

            <div className="space-y-3">
              {docAsset.ai_contracts?.map((c, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white light:text-zinc-900">{c.name}</span>
                    <span className="font-mono text-indigo-400 font-semibold">{c.method} {c.endpoint}</span>
                  </div>
                  <p className="text-zinc-400">{c.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                    {c.input_payload && (
                      <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                        <div className="text-zinc-500 font-bold mb-1 font-sans">Payload de Entrada (JSON):</div>
                        <pre className="text-zinc-300 overflow-x-auto"><code>{c.input_payload}</code></pre>
                      </div>
                    )}
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="text-zinc-500 font-bold mb-1 font-sans">Retorno Esperado (JSON):</div>
                      <pre className="text-emerald-300 overflow-x-auto"><code>{c.output_payload}</code></pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 11.4 Políticas RLS */}
          <div className="space-y-3 pt-4 border-t border-zinc-800 light:border-zinc-200">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              11.4 Políticas de Acesso (Row Level Security - RLS)
            </h3>

            <div className="space-y-2 text-xs">
              {docAsset.rls_policies?.map((pol, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-1"
                >
                  <div className="font-mono font-bold text-indigo-300">Tabela: {pol.table}</div>
                  <ul className="space-y-1 list-disc list-inside text-zinc-400">
                    {pol.rules.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 11.5 Variáveis de Ambiente */}
          <div className="space-y-3 pt-4 border-t border-zinc-800 light:border-zinc-200">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              11.5 Variáveis de Ambiente
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800 light:border-zinc-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-950 light:bg-zinc-100 text-zinc-300 light:text-zinc-700 border-b border-zinc-800 light:border-zinc-200">
                    <th className="py-2.5 px-3.5 font-bold font-mono">Variável</th>
                    <th className="py-2.5 px-3.5 font-bold">Finalidade</th>
                    <th className="py-2.5 px-3.5 font-bold">Escopo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 light:divide-zinc-200">
                  {docAsset.env_vars?.map((ev, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3.5 font-mono font-semibold text-indigo-300">{ev.variable}</td>
                      <td className="py-2 px-3.5 text-zinc-300 light:text-zinc-700">{ev.purpose}</td>
                      <td className="py-2 px-3.5 font-mono text-[11px] text-zinc-400">{ev.scope}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 11.6 Estados de Erro e Vazio */}
          <div className="space-y-3 pt-4 border-t border-zinc-800 light:border-zinc-200">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              11.6 Estados de Erro e Contingência
            </h3>

            <div className="space-y-2 text-xs">
              {docAsset.error_states?.map((err, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <strong className="text-white light:text-zinc-900">{err.scenario}:</strong>{' '}
                    <span className="text-zinc-300 light:text-zinc-700">{err.system_behavior}</span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-semibold shrink-0">
                    Ação: {err.user_action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            12. ROADMAP SUGERIDO (MVP EM FASES)
           ========================================================================= */}
        <section className="space-y-4 page-break">
          <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5 border-b border-zinc-800 light:border-zinc-200 pb-2">
            <span className="text-indigo-400">12.</span> Roadmap Sugerido (MVP em Fases)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {docAsset.roadmap_phases?.map((rp) => (
              <div
                key={rp.phase_number}
                className="p-4 rounded-2xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white light:text-zinc-900">{rp.title}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 font-mono">
                    {rp.duration}
                  </span>
                </div>
                <ul className="space-y-1 text-zinc-400 light:text-zinc-600 list-disc list-inside">
                  {rp.deliverables.map((del, i) => (
                    <li key={i}>{del}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            13. PRÓXIMOS PASSOS
           ========================================================================= */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5 border-b border-zinc-800 light:border-zinc-200 pb-2">
            <span className="text-indigo-400">13.</span> Próximos Passos
          </h2>

          <ul className="space-y-2 text-xs text-zinc-300 light:text-zinc-700">
            {docAsset.next_steps?.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Rodapé Oficial de Homologação */}
        <div className="pt-8 border-t border-zinc-800 light:border-zinc-200 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <div>Dealer Hub · Sistema Integrado de Inovação & Governança</div>
          <div className="font-mono">Documento gerado automaticamente com auxílio de Inteligência Artificial</div>
        </div>
      </div>
    </div>
  );
}
