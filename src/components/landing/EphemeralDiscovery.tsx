'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Layers,
  Code2,
  FileText,
  Presentation,
  CheckCircle2,
  Copy,
  Download,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Clock,
  Check,
  Zap,
  FlaskConical,
  FolderArchive,
} from 'lucide-react';
import { DISCOVERY_BLOCKS, DiscoveryQuestion } from '@/lib/discoveryQuestions';
import { GeneratedAssets, PrototypeAsset } from '@/lib/types';
import DiscoveryBlock from '@/components/discovery/DiscoveryBlock';
import SkipModal from '@/components/discovery/SkipModal';
import Modal from '@/components/ui/Modal';
import InteractivePrototype from '@/components/artifacts/InteractivePrototype';
import TechnicalDocViewer from '@/components/artifacts/TechnicalDocViewer';
import PitchDeckViewer from '@/components/artifacts/PitchDeckViewer';
import { generateWithMultiAgents } from '@/lib/agents';
import { TEST_EXAMPLES, TestExample } from '@/lib/testExamples';
import { generateFullZipPackage } from '@/lib/exportZipPackage';

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

const LOADING_MESSAGES = [
  'Etapa 1/2: Orquestrador Master (Claude 3.5 Sonnet) analisando contexto e montando Blueprint...',
  'Mapeando gargalos operacionais, volume e personas da concessionária...',
  'Etapa 2/2: Especialistas em execução paralela (Claude 3.5 Haiku)...',
  'Especialista UI gerando código interativo em HTML5/CSS/JS...',
  'Especialista em Engenharia estruturando PRD com tabelas PostgreSQL e contratos de API...',
  'Especialista em Negócios desenhando Pitch Deck com projeções de mercado e ROI...',
  'Consolidando os 3 entregáveis estratégicos...',
];

export default function EphemeralDiscovery() {
  // Step state: 'form' | 'discovery' | 'generating' | 'results'
  const [step, setStep] = useState<'form' | 'discovery' | 'generating' | 'results'>('form');

  // Form State
  const [title, setTitle] = useState('');
  const [area, setArea] = useState(BUSINESS_AREAS[0]);
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');

  // Discovery State
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inferredQuestions, setInferredQuestions] = useState<Record<string, boolean>>({});
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [questionToSkip, setQuestionToSkip] = useState<DiscoveryQuestion | null>(null);

  // Modal de Exemplos
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Generation & Assets State
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [assets, setAssets] = useState<GeneratedAssets | null>(null);
  const [activeTab, setActiveTab] = useState<'prototype' | 'techdoc' | 'pitch'>('prototype');

  // Feedback states
  const [copied, setCopied] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  // Rotating loading messages
  useEffect(() => {
    if (step !== 'generating') return;
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [step]);

  const isFormValid =
    title.trim().length >= 4 &&
    problem.trim().length >= 10 &&
    solution.trim().length >= 10;

  const handleStartDiscovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setStep('discovery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleNextBlock = () => {
    if (currentBlockIndex < DISCOVERY_BLOCKS.length - 1) {
      setCurrentBlockIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      triggerAiGeneration();
    }
  };

  const handlePrevBlock = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setStep('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const triggerAiGeneration = async (overrideData?: {
    title: string;
    problem: string;
    solution: string;
    area: string;
    answers: Record<string, string>;
  }) => {
    setStep('generating');
    setGenerationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const activeTitle = overrideData?.title ?? title.trim();
    const activeProblem = overrideData?.problem ?? problem.trim();
    const activeSolution = overrideData?.solution ?? solution.trim();
    const activeArea = overrideData?.area ?? area;
    const activeAnswers = overrideData?.answers ?? answers;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeTitle,
          problem: activeProblem,
          solution: activeSolution,
          area: activeArea,
          discovery_answers: activeAnswers,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${res.status}`);
      }

      const data = await res.json();
      const resolvedAssets = data.assets || data;
      if (!resolvedAssets || (!resolvedAssets.prototype && !resolvedAssets.technical_doc)) {
        throw new Error('Formato de resposta inesperado do serviço de IA.');
      }

      setAssets(resolvedAssets);
      setStep('results');
    } catch (err: any) {
      console.warn('Tentando gerador local de contingência:', err);
      try {
        const fallbackAssets = await generateWithMultiAgents({
          title: activeTitle,
          problem: activeProblem,
          solution: activeSolution,
          area: activeArea,
          discovery_answers: activeAnswers,
        });
        setAssets(fallbackAssets);
        setStep('results');
      } catch (fallbackErr: any) {
        console.error('Erro na geração com IA:', fallbackErr);
        setGenerationError(err.message || 'Ocorreu um erro ao estruturar sua ideia com a IA. Tente novamente.');
        setStep('discovery');
      }
    }
  };

  const handleApplyExample = (example: TestExample, autoGenerate: boolean) => {
    setTitle(example.title);
    setArea(example.area);
    setProblem(example.problem);
    setSolution(example.solution);
    setAnswers(example.answers);
    setInferredQuestions({});
    setCurrentBlockIndex(0);
    setIsTestModalOpen(false);

    if (autoGenerate) {
      triggerAiGeneration({
        title: example.title,
        problem: example.problem,
        solution: example.solution,
        area: example.area,
        answers: example.answers,
      });
    } else {
      setStep('discovery');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    if (window.confirm('Deseja iniciar um novo Discovery? Os dados da sessão atual serão reiniciados.')) {
      setTitle('');
      setProblem('');
      setSolution('');
      setAnswers({});
      setInferredQuestions({});
      setCurrentBlockIndex(0);
      setAssets(null);
      setGenerationError(null);
      setStep('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopySummary = () => {
    if (!assets) return;

    let contentToCopy = '';
    if (activeTab === 'techdoc') {
      contentToCopy = JSON.stringify(assets.technical_doc, null, 2);
    } else if (activeTab === 'pitch') {
      contentToCopy = assets.commercial_deck?.slides?.map((s) => `# ${s.title}\n${(s.bullets || []).map((b: string) => `- ${b}`).join('\n')}`).join('\n\n') || '';
    } else {
      contentToCopy = assets.prototype?.html_content || `PROPOSTA: ${title}\nÁREA: ${area}\nPROBLEMA: ${problem}\nSOLUÇÃO: ${solution}`;
    }

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFullPackage = () => {
    if (!assets) return;

    const fullMarkdown = `# PACOTE DE DISCOVERY - EMBAIXADORES DE IA
**Título da Proposta:** ${title}
**Área de Aplicação:** ${area}
**Data de Criação:** ${new Date().toLocaleDateString('pt-BR')}

---

## 1. Desafio & Proposta Inicial
- **Problema:** ${problem}
- **Solução Imaginada:** ${solution}

---

## 2. Respostas do Discovery
${Object.entries(answers)
  .map(([k, v]) => `**[${k}]:** ${v}`)
  .join('\n\n')}

---

## 3. Especificação do Protótipo Interativo
- **Tema:** ${assets.prototype?.themeColor || '#2563eb'}
- **Modo:** ${assets.prototype?.styleMode || 'desktop'}
- **Notas Técnicas:** ${assets.prototype?.generatedNotes || 'Protótipo funcional em tela única'}

---

## 4. Documentação Técnica de Engenharia (PRD 1.0)
${assets.technical_doc?.executive_summary || ''}

### Objetivos do Produto:
${(assets.technical_doc?.product_objectives || []).map((obj) => `- ${obj}`).join('\n')}

### Modelo Relacional (SQL):
\`\`\`sql
${assets.technical_doc?.data_model_sql || ''}
\`\`\`

---

## 5. Slides do Pitch Executivo
${assets.commercial_deck?.slides
  ?.map(
    (s, idx) => `### Slide ${idx + 1}: ${s.title}
${s.bullets?.map((b: string) => `- ${b}`).join('\n')}
`
  )
  .join('\n')}
`;

    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discovery-${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'embaixador'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZipPackage = async () => {
    if (!assets) return;
    try {
      setIsGeneratingZip(true);
      const blob = await generateFullZipPackage({
        title,
        area,
        problem,
        solution,
        answers,
        assets,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitized = title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40) || 'proposta';
      a.download = `Pacote_Completo_${sanitized}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar pacote ZIP:', err);
      alert('Ocorreu um erro ao gerar o pacote ZIP com todos os arquivos. Tente novamente.');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const currentBlock = DISCOVERY_BLOCKS[currentBlockIndex];
  const totalBlocks = DISCOVERY_BLOCKS.length;
  const progressPercent = Math.round(((currentBlockIndex + 1) / totalBlocks) * 100);

  return (
    <div className="w-full">
      {/* ================= ETAPA 1: FORMULÁRIO HERO ================= */}
      {step === 'form' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10 animate-in fade-in">
          {/* Header Ultra-minimalista */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 light:text-blue-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Programa de Inovação Prática</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white light:text-zinc-900 tracking-tight leading-tight">
              Embaixadores de IA
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 light:text-zinc-600 leading-relaxed">
              Transforme um desafio do seu dia a dia em um protótipo navegável, documentação técnica e apresentação executiva com inteligência artificial.
            </p>
          </div>

          {/* Card do Formulário */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 shadow-xl backdrop-blur-sm">
            <form onSubmit={handleStartDiscovery} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 light:border-zinc-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white light:text-zinc-900">
                    Descreva aqui sua ideia
                  </h2>
                  <p className="text-xs text-zinc-400 light:text-zinc-500 mt-0.5">
                    Preencha os dados ou selecione um exemplo prático pronto para processar na IA.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 text-purple-300 light:text-purple-700 text-xs font-bold transition-all shadow-sm hover:scale-105 self-start sm:self-auto cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 text-purple-400" />
                  <span>Exemplos Prontos (3 Cenários)</span>
                </button>
              </div>

              {/* Título da Ideia */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 light:text-zinc-700">
                  Título da Ideia ou Projeto <span className="text-blue-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Agendamento Inteligente e Pré-Orçamento para Oficina"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Área Operacional */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 light:text-zinc-700">
                  Área de Aplicação na Concessionária
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 text-sm text-zinc-100 light:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  {BUSINESS_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desafio / Problema */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 light:text-zinc-700">
                  Qual é o desafio ou problema enfrentado? <span className="text-blue-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Descreva a dor, gargalo de tempo, retrabalho ou insatisfação dos clientes na rotina atual..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                />
              </div>

              {/* Solução Imaginada */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 light:text-zinc-700">
                  Qual a sua ideia de solução? <span className="text-blue-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Como um sistema, aplicativo ou automação com IA poderia resolver ou mitigar essa dor..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 text-sm text-zinc-100 light:text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
                />
              </div>

              {/* Botão de Submissão para Discovery */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all ${
                    isFormValid
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 cursor-pointer hover:scale-[1.01]'
                      : 'bg-zinc-800 light:bg-zinc-200 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Iniciar Discovery com IA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-[11px] text-zinc-500 light:text-zinc-500 mt-3">
                  Sessão de experimentação livre · Seus dados não serão gravados no banco de ideias.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ETAPA 2: DISCOVERY GUIADO ================= */}
      {step === 'discovery' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Editar descrição inicial
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Discovery Interativo
                </span>
                <span className="text-xs text-zinc-500">· {area}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white light:text-zinc-900 mt-1 line-clamp-1">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 light:text-purple-700 text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                <span>Carregar Outro Exemplo</span>
              </button>

              <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
                Modo Embaixadores de IA
              </span>
            </div>
          </div>

          {/* Erro de geração anterior, se houver */}
          {generationError && (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <div>
                <strong className="block font-bold">Aviso na geração</strong>
                <p>{generationError}</p>
              </div>
            </div>
          )}

          {/* Barra de Progresso */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-zinc-300 light:text-zinc-700">
                Bloco <strong className="text-blue-400">{currentBlockIndex + 1}</strong> de {totalBlocks}:{' '}
                <span className="text-zinc-400 light:text-zinc-500">{currentBlock.title}</span>
              </span>
              <span className="text-blue-400 font-bold">{progressPercent}% concluído</span>
            </div>

            <div className="w-full h-2 rounded-full bg-zinc-800 light:bg-zinc-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Navegador de mini-blocos */}
            <div className="flex items-center justify-between gap-1 pt-2 overflow-x-auto pb-1 scrollbar-none">
              {DISCOVERY_BLOCKS.map((blk, idx) => {
                const isCompleted = idx < currentBlockIndex;
                const isCurrent = idx === currentBlockIndex;
                return (
                  <button
                    key={blk.id}
                    onClick={() => {
                      setCurrentBlockIndex(idx);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-zinc-800 text-blue-400 hover:bg-zinc-700'
                        : 'bg-zinc-900/40 text-zinc-500 hover:bg-zinc-800/40'
                    }`}
                  >
                    <span>{blk.letter}</span>
                    <span className="hidden md:inline line-clamp-1 max-w-[90px]">{blk.title.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bloco de Perguntas Ativo */}
          <DiscoveryBlock
            block={currentBlock}
            answers={answers}
            inferredQuestions={inferredQuestions}
            onChangeAnswer={handleAnswerChange}
            onRequestSkip={handleRequestSkip}
            onClearInferred={handleClearInferred}
          />

          {/* Navegação Inferior */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800 light:border-zinc-200">
            <button
              type="button"
              onClick={handlePrevBlock}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-800 light:border-zinc-300 text-xs font-semibold text-zinc-300 light:text-zinc-700 hover:bg-zinc-800 light:hover:bg-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentBlockIndex === 0 ? 'Voltar para Descrição' : 'Bloco Anterior'}</span>
            </button>

            <button
              type="button"
              onClick={handleNextBlock}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105"
            >
              <span>{currentBlockIndex === totalBlocks - 1 ? 'Gerar com IA' : 'Próximo Bloco'}</span>
              {currentBlockIndex === totalBlocks - 1 ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Modal de confirmação de pular */}
          <SkipModal
            isOpen={isSkipModalOpen}
            onClose={() => setIsSkipModalOpen(false)}
            onConfirm={handleConfirmSkip}
            questionLabel={questionToSkip?.label}
          />
        </div>
      )}

      {/* ================= MODAL DE EXEMPLOS PRONTOS ================= */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Cenários Prontos para Geração com IA"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-400 light:text-zinc-600 leading-relaxed">
            Escolha um dos 3 cenários práticos do setor automotivo. As respostas do Discovery serão preenchidas e submetidas ao <strong>motor de Inteligência Artificial</strong> para construir o protótipo, documentação técnica e pitch em tempo real.
          </p>

          <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
            {TEST_EXAMPLES.map((ex) => (
              <div
                key={ex.id}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 light:bg-zinc-50 border border-zinc-800 light:border-zinc-200 hover:border-purple-500/50 transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {ex.badge}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {ex.area}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white light:text-zinc-900">
                    {ex.title}
                  </h4>
                  <p className="text-xs text-zinc-400 light:text-zinc-600 line-clamp-2 mt-1">
                    {ex.problem}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-zinc-800/60 light:border-zinc-200/80 gap-3">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    16 respostas de Discovery pré-estruturadas
                  </span>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleApplyExample(ex, false)}
                      className="px-3 py-1.5 rounded-xl border border-zinc-700 light:border-zinc-300 hover:bg-zinc-800 light:hover:bg-zinc-100 text-xs font-semibold text-zinc-300 light:text-zinc-700 transition-colors cursor-pointer"
                      title="Preenche os dados e entra no Discovery para você revisar ou editar antes de gerar"
                    >
                      Revisar Perguntas
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyExample(ex, true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105 cursor-pointer"
                      title="Envia as respostas imediatamente para o pipeline de IA gerar os artefatos"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      <span>Gerar com IA</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>


      {/* ================= ETAPA 3: GERANDO COM IA ================= */}
      {step === 'generating' && (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-6 animate-in fade-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 animate-pulse">
              <Sparkles className="w-10 h-10 animate-spin text-blue-400" style={{ animationDuration: '4s' }} />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-ping" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white light:text-zinc-900">
              Gerando Artefatos do Embaixador
            </h2>
            <p className="text-xs sm:text-sm text-blue-400 light:text-blue-600 font-medium min-h-[40px] transition-all">
              {LOADING_MESSAGES[loadingMsgIndex]}
            </p>
          </div>

          <div className="w-64 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-pulse" />
          </div>

          <p className="text-xs text-zinc-500 light:text-zinc-400">
            A IA está estruturando o protótipo navegável, especificações e apresentação.
          </p>
        </div>
      )}

      {/* ================= ETAPA 4: RESULTADOS EFÊMEROS ================= */}
      {step === 'results' && assets && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 animate-in fade-in">
          {/* Header de Resultados */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Discovery Concluído
                </span>
                <span className="text-xs text-zinc-500">· {area}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white light:text-zinc-900">
                {title}
              </h1>
            </div>

            {/* Ações Rápidas: Copiar, Baixar ZIP Completo e Novo Discovery */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 light:hover:bg-zinc-200 text-xs font-semibold text-zinc-200 light:text-zinc-800 transition-colors cursor-pointer"
                title="Copiar texto da aba ativa para área de transferência"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Aba'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadZipPackage}
                disabled={isGeneratingZip}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer"
                title="Baixar pacote completo com Protótipo HTML, Documento em Word (.docx), Apresentação em PowerPoint (.pptx) e Markdown"
              >
                <FolderArchive className="w-4 h-4" />
                <span>{isGeneratingZip ? 'Compactando ZIP...' : 'Baixar Tudo (.ZIP Completo)'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFullPackage}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-700 light:border-zinc-300 hover:bg-zinc-800 light:hover:bg-zinc-100 text-xs font-semibold text-zinc-300 light:text-zinc-700 transition-colors cursor-pointer"
                title="Baixar pacote de documentação resumido em Markdown (.md)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Apenas .MD</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 light:border-zinc-300 hover:bg-zinc-900 light:hover:bg-zinc-100 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Novo Discovery</span>
              </button>
            </div>
          </div>

          {/* Abas de Visualização dos 3 Artefatos */}
          <div className="flex items-center gap-2 border-b border-zinc-800 light:border-zinc-200 pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'prototype', label: 'Protótipo Interativo', icon: Layers },
              { id: 'techdoc', label: 'Documento Técnico', icon: FileText },
              { id: 'pitch', label: 'Apresentação Comercial', icon: Presentation },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 light:hover:bg-zinc-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Conteúdo da Aba Ativa */}
          <div className="min-h-[500px]">
            {activeTab === 'prototype' && assets.prototype && (
              <InteractivePrototype
                prototype={assets.prototype}
                ideaTitle={title}
                onUpdatePrototype={(updatedProto) => {
                  setAssets((prev) => (prev ? { ...prev, prototype: updatedProto } : prev));
                }}
              />
            )}

            {activeTab === 'techdoc' && assets.technical_doc && (
              <TechnicalDocViewer docAsset={assets.technical_doc} ideaTitle={title} />
            )}

            {activeTab === 'pitch' && assets.commercial_deck && (
              <PitchDeckViewer deckAsset={assets.commercial_deck} ideaTitle={title} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
