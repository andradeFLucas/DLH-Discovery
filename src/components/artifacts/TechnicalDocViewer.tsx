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
  Target,
  Users,
  Network,
  Sparkles,
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
  const [mermaidCopied, setMermaidCopied] = useState(false);

  // Garante que todo o documento tenha as seções ricas preenchidas
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
      architecture_diagram_mermaid: rawDocAsset.architecture_diagram_mermaid,
      raci_matrix: rawDocAsset.raci_matrix,
      success_metrics_okrs: rawDocAsset.success_metrics_okrs,
    };
  }, [rawDocAsset, ideaTitle]);

  const sqlCode = docAsset.data_model_sql || '';
  const mermaidDiagram = docAsset.architecture_diagram_mermaid || `graph TD
  A[Consultor / Operador] -->|1. Captura| B[Next.js PWA Mobile]
  B -->|2. API Segura| C[API Gateway / Edge Routes]
  C -->|3. Visão & Enriquecimento| D[Motor de IA Claude]
  C -->|4. Bases Externas| E[APIs FIPE / Detran / Leilão]
  D -->|5. Score & Decisão| C
  C -->|6. Persistência| F[(PostgreSQL Supabase)]
  C -->|7. Push Notification| G[Gerente Comercial]
  F -->|8. Sincronização| H[DMS Linx / Apollo / Totvs]`;

  const handlePrintPDF = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    let md = `# BANCO DE IDEIAS COM IA · DEALER HUB\n`;
    md += `## Documento de Especificação Funcional e Técnica (PRD 1.0 Oficial)\n`;
    md += `### Projeto: ${ideaTitle}\n`;
    md += `Versão: ${docAsset.document_version || '1.0.0-PROD'}\n\n`;

    md += `### 1. Resumo Executivo\n${docAsset.executive_summary || ''}\n\n`;

    md += `### 2. Objetivos do Produto\n`;
    docAsset.product_objectives?.forEach((obj) => {
      md += `- ${obj}\n`;
    });
    md += `\n`;

    if (docAsset.success_metrics_okrs && docAsset.success_metrics_okrs.length > 0) {
      md += `### 2.1 Métricas de Sucesso e OKRs\n`;
      docAsset.success_metrics_okrs.forEach((okr, i) => {
        md += `#### OKR ${i + 1}: ${okr.objective}\n`;
        md += `- **Prazo:** ${okr.target_timeline} | **ROI Estimado:** ${okr.target_roi}\n`;
        okr.key_results.forEach((kr) => {
          md += `  - Key Result: ${kr}\n`;
        });
      });
      md += `\n`;
    }

    md += `### 3. Personas\n`;
    docAsset.personas?.forEach((p) => {
      md += `- **${p.persona}** (${p.role}): ${p.needs}\n`;
    });
    md += `\n`;

    if (docAsset.raci_matrix && docAsset.raci_matrix.length > 0) {
      md += `### 3.1 Matriz RACI de Governança\n`;
      md += `| Atividade | Responsável (R) | Aprovador (A) | Consultado (C) | Informado (I) |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- |\n`;
      docAsset.raci_matrix.forEach((r) => {
        md += `| ${r.activity} | ${r.responsible} | ${r.accountable} | ${r.consulted} | ${r.informed} |\n`;
      });
      md += `\n`;
    }

    md += `### 4. Diagrama de Fluxo e Arquitetura (Mermaid)\n`;
    md += `\`\`\`mermaid\n${mermaidDiagram}\n\`\`\`\n\n`;

    md += `### 5. Macro-Funcionalidades e Módulos\n`;
    docAsset.macro_modules?.forEach((mod) => {
      md += `#### Módulo 0${mod.module_number}: ${mod.title}\n`;
      md += `**Objetivo:** ${mod.objective}\n\n`;
      md += `**Sub-funcionalidades:**\n`;
      mod.sub_features.forEach((sf) => {
        md += `- **${sf.name}:** ${sf.description} *(Manipula: ${sf.input_or_extraction || 'Dados do sistema'})*\n`;
      });
      if (mod.business_rules.length > 0) {
        md += `\n**Regras de Negócio Obrigatórias:**\n`;
        mod.business_rules.forEach((br) => {
          md += `- ${br}\n`;
        });
      }
      md += `\n`;
    });

    md += `### 6. Histórias de Usuário com Critérios de Aceite (Gherkin)\n`;
    docAsset.user_stories?.forEach((us) => {
      md += `#### ${us.id} - ${us.title} (Ator: ${us.actor})\n`;
      md += `${us.description}\n\n`;
      if (us.acceptance_criteria_gherkin && us.acceptance_criteria_gherkin.length > 0) {
        md += `**Critérios de Aceite (Gherkin):**\n`;
        us.acceptance_criteria_gherkin.forEach((c) => {
          md += `- ${c}\n`;
        });
        md += `\n`;
      }
    });

    md += `### 7. Modelo de Dados SQL (PostgreSQL / Supabase)\n\`\`\`sql\n${sqlCode}\n\`\`\`\n\n`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(mermaidDiagram);
    setMermaidCopied(true);
    setTimeout(() => setMermaidCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Estilos CSS Específicos para Impressão e PDF */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
          #print-document {
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
                Documentação Técnica Completa (Padrão PRD 1.0 Enterprise)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Mermaid · RACI · OKRs · Gherkin
              </span>
            </div>
            <p className="text-xs text-zinc-400 light:text-zinc-500">
              Resumo executivo, personas, matriz RACI, diagramas de fluxo, módulos de engenharia, histórias com Gherkin e schema relacional.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 text-zinc-200 light:text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Markdown Copiado!' : 'Copiar .MD'}</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-102 cursor-pointer"
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
            <div>{docAsset.document_version || '1.0.0-PROD'}</div>
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
            2. OBJETIVOS DO PRODUTO & OKRS
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-zinc-800 light:border-zinc-200 pb-2">
            <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5">
              <span className="text-indigo-400">2.</span> Objetivos do Produto & Métricas de Sucesso (OKRs)
            </h2>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Objetivos Centrais do Projeto:
            </h3>
            <ul className="space-y-2.5 text-sm text-zinc-300 light:text-zinc-700">
              {docAsset.product_objectives?.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* OKRs Estruturados */}
          {docAsset.success_metrics_okrs && docAsset.success_metrics_okrs.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" />
                Matriz de OKRs e Metas de ROI:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {docAsset.success_metrics_okrs.map((okr, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-950/70 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {okr.target_timeline}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        ROI: <strong className="text-zinc-200 light:text-zinc-800">{okr.target_roi}</strong>
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white light:text-zinc-900 leading-snug">
                      {okr.objective}
                    </h4>
                    <ul className="space-y-1.5 text-[11px] text-zinc-400 light:text-zinc-600">
                      {okr.key_results.map((kr, kIdx) => (
                        <li key={kIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{kr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* =========================================================================
            3. PERSONAS & MATRIZ RACI
           ========================================================================= */}
        <section className="space-y-6">
          <div className="border-b border-zinc-800 light:border-zinc-200 pb-2">
            <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5">
              <span className="text-indigo-400">3.</span> Personas & Governança Operacional (Matriz RACI)
            </h2>
          </div>

          {/* Tabela de Personas */}
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

          {/* Matriz RACI */}
          {docAsset.raci_matrix && docAsset.raci_matrix.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                Matriz RACI de Responsabilidades:
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-zinc-800 light:border-zinc-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-950 light:bg-zinc-100 text-zinc-300 light:text-zinc-700 border-b border-zinc-800 light:border-zinc-200">
                      <th className="py-3 px-4 font-bold uppercase w-2/5">Atividade / Processo</th>
                      <th className="py-3 px-3 font-bold text-center text-blue-400">R (Executa)</th>
                      <th className="py-3 px-3 font-bold text-center text-emerald-400">A (Aprova)</th>
                      <th className="py-3 px-3 font-bold text-center text-amber-400">C (Consulta)</th>
                      <th className="py-3 px-3 font-bold text-center text-purple-400">I (Informa)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 light:divide-zinc-200">
                    {docAsset.raci_matrix.map((raci, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/30 light:hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white light:text-zinc-900 align-top">
                          {raci.activity}
                        </td>
                        <td className="py-3 px-3 text-center text-zinc-300 light:text-zinc-700 align-top text-[11px]">
                          {raci.responsible}
                        </td>
                        <td className="py-3 px-3 text-center text-zinc-300 light:text-zinc-700 align-top text-[11px] font-bold">
                          {raci.accountable}
                        </td>
                        <td className="py-3 px-3 text-center text-zinc-400 light:text-zinc-600 align-top text-[11px]">
                          {raci.consulted}
                        </td>
                        <td className="py-3 px-3 text-center text-zinc-400 light:text-zinc-600 align-top text-[11px]">
                          {raci.informed}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
            5. MÓDULOS DO SISTEMA (MACRO-FUNCIONALIDADES HIPER-ESPECÍFICAS)
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
            6. ARQUITETURA TÉCNICA & DIAGRAMA MERMAID
           ========================================================================= */}
        <section className="space-y-6 page-break">
          <div className="border-b border-zinc-800 light:border-zinc-200 pb-2">
            <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5">
              <span className="text-indigo-400">6.</span> Arquitetura Técnica & Diagrama de Fluxo (Mermaid)
            </h2>
            <p className="text-xs text-zinc-400 light:text-zinc-500 mt-1">
              Topologia da infraestrutura, microsserviços, agentes de IA e integrações com bases externas.
            </p>
          </div>

          {/* Bloco do Diagrama Mermaid */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                Diagrama Arquitetural de Fluxo de Dados (Mermaid 1.0):
              </span>
              <button
                onClick={handleCopyMermaid}
                className="no-print px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {mermaidCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{mermaidCopied ? 'Mermaid Copiado!' : 'Copiar Código Mermaid'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{mermaidDiagram}</code>
            </pre>
          </div>

          {/* Justificativa da Stack */}
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2">
              <h4 className="font-bold text-sm text-indigo-400">6.1 Por que Next.js (App Router)</h4>
              <ul className="space-y-1.5 text-zinc-300 light:text-zinc-700 list-disc list-inside">
                {docAsset.architecture_justification?.nextjs.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2">
              <h4 className="font-bold text-sm text-indigo-400">6.2 Por que Supabase (PostgreSQL + RLS)</h4>
              <ul className="space-y-1.5 text-zinc-300 light:text-zinc-700 list-disc list-inside">
                {docAsset.architecture_justification?.supabase.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2">
              <h4 className="font-bold text-sm text-indigo-400">6.3 Por que Vercel Enterprise</h4>
              <ul className="space-y-1.5 text-zinc-300 light:text-zinc-700 list-disc list-inside">
                {docAsset.architecture_justification?.vercel.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. HISTÓRIAS DE USUÁRIO DETALHADAS COM GHERKIN
           ========================================================================= */}
        <section className="space-y-4 page-break">
          <div className="border-b border-zinc-800 light:border-zinc-200 pb-2">
            <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5">
              <span className="text-indigo-400">7.</span> Histórias de Usuário & Critérios de Aceite (Gherkin)
            </h2>
            <p className="text-xs text-zinc-400 light:text-zinc-500 mt-1">
              Fluxo completo descrito em nível de interação com critérios de aceite formais (Dado que / Quando / Então).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {docAsset.user_stories?.map((us) => (
              <div
                key={us.id}
                className="p-5 rounded-2xl bg-zinc-950/70 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-3 text-xs"
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

                {/* Critérios de Aceite Gherkin */}
                {us.acceptance_criteria_gherkin && us.acceptance_criteria_gherkin.length > 0 && (
                  <div className="p-3 rounded-xl bg-zinc-900/70 light:bg-zinc-100 border border-zinc-800/80 light:border-zinc-200 space-y-1.5">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Critérios de Aceite (Gherkin):
                    </div>
                    <ul className="space-y-1 text-[11px] text-zinc-300 light:text-zinc-700 font-mono">
                      {us.acceptance_criteria_gherkin.map((crit, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">✔</span>
                          <span>{crit}</span>
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
            8. ANEXO TÉCNICO DE IMPLEMENTAÇÃO & SCHEMA SQL
           ========================================================================= */}
        <section className="space-y-6 page-break">
          <div className="border-b border-zinc-800 light:border-zinc-200 pb-2">
            <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5">
              <span className="text-indigo-400">8.</span> Anexo Técnico de Implementação
            </h2>
            <p className="text-xs text-zinc-400 light:text-zinc-500 mt-1">
              Especificações para desenvolvedores: modelo de dados relacional, rotas, contratos de API/IA e políticas RLS.
            </p>
          </div>

          {/* 8.1 Modelo de Dados & Dicionário de Tabelas */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <Database className="w-4 h-4" />
              8.1 Modelo de Dados Relacional (PostgreSQL / Supabase)
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
                  className="no-print px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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

          {/* 8.2 Contratos de API & IA */}
          <div className="space-y-3 pt-4 border-t border-zinc-800 light:border-zinc-200">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              8.2 Contratos de API REST & Endpoints
            </h3>
            <div className="space-y-3">
              {docAsset.api_endpoints?.map((ep, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        {ep.method}
                      </span>
                      <span className="font-mono font-semibold text-white light:text-zinc-900">{ep.path}</span>
                    </div>
                    <span className="text-zinc-400 text-[11px]">{ep.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8.3 Políticas RLS */}
          <div className="space-y-3 pt-4 border-t border-zinc-800 light:border-zinc-200">
            <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              8.3 Políticas de Acesso e Isolamento Multi-Tenant (RLS)
            </h3>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs font-mono text-zinc-300">
              {docAsset.rls_policies?.map((policy, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-indigo-400 font-bold">Tabela: {policy.table}</div>
                  <ul className="space-y-1 pl-4 text-zinc-400 list-disc">
                    {policy.rules.map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. ROADMAP DE IMPLEMENTAÇÃO EM FASES
           ========================================================================= */}
        <section className="space-y-4 page-break">
          <div className="border-b border-zinc-800 light:border-zinc-200 pb-2">
            <h2 className="text-lg font-bold text-white light:text-zinc-900 flex items-center gap-2.5">
              <span className="text-indigo-400">9.</span> Roadmap Sugerido (MVP em Fases)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {docAsset.roadmap_phases?.map((phase) => (
              <div
                key={phase.phase_number}
                className="p-4 rounded-2xl bg-zinc-950/60 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white light:text-zinc-900">{phase.title}</h3>
                  <span className="text-[10px] font-mono text-indigo-400">{phase.duration}</span>
                </div>
                <ul className="space-y-1 text-zinc-400 list-disc list-inside">
                  {phase.deliverables.map((deliv, idx) => (
                    <li key={idx}>{deliv}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Rodapé Oficial */}
        <div className="pt-8 border-t border-zinc-800 light:border-zinc-200 text-center text-xs text-zinc-500 space-y-1">
          <div>Dealer Hub · Sistema Integrado de Inovação & Governança</div>
          <div className="font-mono text-[10px]">
            Documento gerado com auxílio de Inteligência Artificial para fins de especificação técnica e governança.
          </div>
        </div>
      </div>
    </div>
  );
}
