'use client';

import React, { useState } from 'react';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  FileDown,
  Printer,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { CommercialDeckAsset, SlideItem } from '@/lib/types';
import pptxgen from 'pptxgenjs';

interface PitchDeckViewerProps {
  deckAsset: CommercialDeckAsset;
  ideaTitle?: string;
}

export default function PitchDeckViewer({
  deckAsset,
  ideaTitle = 'Apresentação Executiva',
}: PitchDeckViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);

  const slides = deckAsset.slides || [];
  const activeSlide: SlideItem | undefined = slides[currentSlideIndex] || slides[0];

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportPPTX = async () => {
    try {
      setIsExportingPptx(true);
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'Dealer Hub • Mape.ia';
      pptx.company = 'Dealer Hub Innovation';
      pptx.title = ideaTitle;

      // ==========================================
      // SLIDE 1: CAPA EXECUTIVA
      // ==========================================
      const coverSlide = pptx.addSlide();
      coverSlide.background = { color: '0A0E17' };

      // Tag de Categoria
      coverSlide.addText('BANCO DE IDEIAS COM IA · DEALER HUB', {
        x: 1.0,
        y: 1.5,
        w: 11.3,
        fontSize: 12,
        color: '38BDF8',
        bold: true,
        fontFace: 'Arial',
      });

      // Título Principal
      coverSlide.addText(ideaTitle, {
        x: 1.0,
        y: 2.3,
        w: 11.3,
        fontSize: 32,
        color: 'FFFFFF',
        bold: true,
        fontFace: 'Arial',
        lineSpacing: 38,
      });

      // Subtítulo
      coverSlide.addText('Proposta Estratégica de Inovação e Transformação Operacional', {
        x: 1.0,
        y: 4.2,
        w: 11.3,
        fontSize: 16,
        color: '94A3B8',
        fontFace: 'Arial',
      });

      // Rodapé da Capa
      coverSlide.addText('Apresentação para o Comitê de Inovação & Diretoria Executiva', {
        x: 1.0,
        y: 6.2,
        w: 11.3,
        fontSize: 11,
        color: '64748B',
        fontFace: 'Arial',
      });

      // ==========================================
      // SLIDES DE CONTEÚDO (2..N)
      // ==========================================
      slides.forEach((slide, idx) => {
        const s = pptx.addSlide();
        s.background = { color: '0F172A' };

        // Header Superior do Slide
        s.addText(`PITCH EXECUTIVO · SLIDE ${idx + 1}/${slides.length}`, {
          x: 1.0,
          y: 0.6,
          w: 11.3,
          fontSize: 10,
          color: '38BDF8',
          bold: true,
          fontFace: 'Arial',
        });

        // Título do Slide
        s.addText(slide.title, {
          x: 1.0,
          y: 1.1,
          w: 11.3,
          fontSize: 24,
          color: 'FFFFFF',
          bold: true,
          fontFace: 'Arial',
        });

        // Subtítulo do Slide (se houver)
        if (slide.subtitle) {
          s.addText(slide.subtitle, {
            x: 1.0,
            y: 1.8,
            w: 11.3,
            fontSize: 13,
            color: '94A3B8',
            fontFace: 'Arial',
          });
        }

        // Bullets de Conteúdo
        const startY = slide.subtitle ? 2.5 : 2.0;
        const bulletObjects = slide.bullets.map((bullet) => ({
          text: bullet,
          options: {
            bullet: true,
            fontSize: 14,
            color: 'F1F5F9',
            fontFace: 'Arial',
            spaceAfter: 14,
            lineSpacing: 22,
          },
        }));

        s.addText(bulletObjects, {
          x: 1.0,
          y: startY,
          w: 11.3,
          h: 4.2,
          valign: 'top',
        });

        // Rodapé Institucional
        s.addText(`${ideaTitle} • Dealer Hub`, {
          x: 1.0,
          y: 6.8,
          w: 9.0,
          fontSize: 9,
          color: '64748B',
          fontFace: 'Arial',
        });

        s.addText(`Confidencial`, {
          x: 10.5,
          y: 6.8,
          w: 2.0,
          fontSize: 9,
          color: '64748B',
          align: 'right',
          fontFace: 'Arial',
        });
      });

      const sanitizedName = ideaTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40);
      await pptx.writeFile({ fileName: `Apresentacao_${sanitizedName}.pptx` });
    } catch (err) {
      console.error('Erro ao gerar apresentação PowerPoint:', err);
      alert('Ocorreu um erro ao exportar o PowerPoint. Tente novamente.');
    } finally {
      setIsExportingPptx(false);
    }
  };

  const handleCopyMarkdown = () => {
    let md = `# APRESENTAÇÃO EXECUTIVA (PITCH DECK) · DEALER HUB\n`;
    md += `## Proposta: ${ideaTitle}\n\n`;

    slides.forEach((s, idx) => {
      md += `### Slide ${idx + 1}: ${s.title}\n`;
      if (s.subtitle) md += `*${s.subtitle}*\n\n`;
      s.bullets.forEach((b) => {
        md += `- ${b}\n`;
      });
      md += `\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="group"
      aria-roledescription="carrossel de slides"
      aria-label={`${ideaTitle} — pitch executivo`}
      onKeyDown={handleKeyNav}
      className="flex flex-col h-full bg-zinc-950 light:bg-zinc-50 rounded-2xl border border-zinc-800 light:border-zinc-200 overflow-hidden shadow-xl"
    >
      {/* Estilos para Impressão em Slide Landscape no PDF */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            background: #0f172a !important;
            color: #ffffff !important;
          }
          .no-print-pitch {
            display: none !important;
          }
          .print-slide-deck {
            display: block !important;
          }
          .print-single-slide {
            page-break-after: always;
            break-after: page;
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 50px 70px;
            background: #090d16 !important;
            color: #ffffff !important;
            box-sizing: border-box;
          }
        }
        .print-slide-deck {
          display: none;
        }
      `,
        }}
      />

      {/* Header do Deck e Ações de Download */}
      <div className="no-print-pitch p-4 sm:p-5 bg-zinc-900/90 light:bg-white border-b border-zinc-800 light:border-zinc-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white light:text-zinc-900">
                Apresentação Comercial & Pitch Executivo
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                16:9 Pronto para Diretoria
              </span>
            </div>
            <p className="text-xs text-zinc-400 light:text-zinc-500">
              Slides estruturados para aprovação no Comitê de Inovação sem necessidade de edição
            </p>
          </div>
        </div>

        {/* Botões de Ação: PowerPoint (.pptx), PDF e Copiar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-2 rounded-xl bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 text-zinc-200 light:text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copiar texto dos slides em Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Roteiro'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 light:bg-zinc-100 hover:bg-zinc-700 text-zinc-200 light:text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar todos os slides em PDF no formato apresentação"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Baixar PDF (Slides)</span>
          </button>

          <button
            onClick={handleExportPPTX}
            disabled={isExportingPptx}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-600/25 transition-all hover:scale-102 disabled:opacity-50 cursor-pointer"
            title="Baixar arquivo nativo do Microsoft PowerPoint (.pptx)"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPptx ? 'Gerando PPTX...' : 'Baixar PowerPoint (.pptx)'}</span>
          </button>
        </div>
      </div>

      {/* Barra de Controles de Slide */}
      <div className="no-print-pitch px-6 py-2.5 bg-zinc-950/80 light:bg-zinc-100/80 border-b border-zinc-800/60 light:border-zinc-200/60 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400">
          Slide <strong className="text-white light:text-zinc-900">{currentSlideIndex + 1}</strong> de {slides.length}
        </span>

        <div className="flex items-center gap-1 bg-zinc-900 light:bg-white p-1 rounded-xl border border-zinc-800 light:border-zinc-200 shadow-xs">
          <button
            onClick={handlePrev}
            disabled={currentSlideIndex === 0}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white light:hover:text-zinc-900 disabled:opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="text-xs font-mono px-2 text-zinc-400">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white light:hover:text-zinc-900 disabled:opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Área do Slide em Destaque (Visualização Interativa na Tela) */}
      <div className="no-print-pitch flex-1 p-6 sm:p-10 flex items-center justify-center bg-zinc-950/70 light:bg-zinc-100/60 min-h-[420px]">
        <div className="w-full max-w-3xl aspect-[16/10] sm:aspect-[16/9] bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 light:from-white light:via-slate-50 light:to-zinc-100 rounded-3xl border border-zinc-800 light:border-zinc-200 shadow-2xl p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden ring-1 ring-white/5 animate-in fade-in zoom-in-98 duration-300">
          {/* Efeito sutil de luz de fundo */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Topo do Slide */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 light:text-blue-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Pitch Executivo • Inovação
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Dealer Hub Innovation Deck
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white light:text-zinc-900 mt-3">
              {activeSlide?.title}
            </h2>
            {activeSlide?.subtitle && (
              <p className="text-sm font-medium text-zinc-400 light:text-zinc-600 mt-1">
                {activeSlide.subtitle}
              </p>
            )}
          </div>

          {/* Corpo de Marcadores / Bullets */}
          <div className="relative z-10 my-auto py-4 space-y-3 sm:space-y-4">
            {activeSlide?.bullets.map((bullet, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3 sm:p-3.5 rounded-2xl bg-zinc-800/40 light:bg-white/80 border border-zinc-700/40 light:border-zinc-200/80 backdrop-blur-xs transition-all hover:border-blue-500/30"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 light:text-zinc-800 leading-relaxed font-medium">
                  {bullet}
                </p>
              </div>
            ))}
          </div>

          {/* Rodapé do Slide */}
          <div className="relative z-10 pt-4 border-t border-zinc-800/60 light:border-zinc-200/60 flex items-center justify-between text-xs text-zinc-500">
            <span className="font-semibold text-zinc-400 light:text-zinc-600 truncate max-w-[280px]">
              {ideaTitle}
            </span>

            {/* Marcadores de Navegação (Bolinhas) */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentSlideIndex(dotIdx)}
                  aria-label={`Ir para o slide ${dotIdx + 1}`}
                  aria-current={currentSlideIndex === dotIdx ? 'true' : undefined}
                  className={`h-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    currentSlideIndex === dotIdx
                      ? 'w-6 bg-blue-500'
                      : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTAINER OCULTO PARA IMPRESSÃO DE TODOS OS SLIDES EM PDF
         ========================================================================= */}
      <div className="print-slide-deck">
        {/* Capa no PDF */}
        <div className="print-single-slide">
          <div className="space-y-4 my-auto">
            <div className="text-sm font-mono font-bold text-sky-400 uppercase tracking-widest">
              BANCO DE IDEIAS COM IA · DEALER HUB
            </div>
            <h1 className="text-4xl font-black text-white leading-tight uppercase max-w-3xl">
              {ideaTitle}
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl">
              Proposta Estratégica de Inovação e Transformação Operacional
            </p>
          </div>
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Apresentação Executiva para o Comitê de Inovação</span>
            <span>Dealer Hub · Mape.ia</span>
          </div>
        </div>

        {/* Todos os Slides no PDF */}
        {slides.map((s, idx) => (
          <div key={idx} className="print-single-slide">
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-sky-400 uppercase font-bold mb-2">
                <span>PITCH EXECUTIVO · SLIDE {idx + 1}/{slides.length}</span>
                <span className="text-slate-500">DEALER HUB</span>
              </div>
              <h2 className="text-3xl font-black text-white">{s.title}</h2>
              {s.subtitle && <p className="text-base text-slate-400 mt-1">{s.subtitle}</p>}
            </div>

            <div className="space-y-4 my-auto">
              {s.bullets.map((b, bIdx) => (
                <div key={bIdx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-4">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-base text-slate-200 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{ideaTitle}</span>
              <span>Confidencial · Comitê de Inovação</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
