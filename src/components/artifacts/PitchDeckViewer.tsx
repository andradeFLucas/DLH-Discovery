'use client';

import React, { useState } from 'react';
import { Presentation, ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { CommercialDeckAsset, SlideItem } from '@/lib/types';

interface PitchDeckViewerProps {
  deckAsset: CommercialDeckAsset;
  ideaTitle?: string;
}

export default function PitchDeckViewer({ deckAsset, ideaTitle = 'Apresentação Executiva' }: PitchDeckViewerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
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

  return (
    <div
      role="group"
      aria-roledescription="carrossel de slides"
      aria-label={`${ideaTitle} — pitch executivo`}
      onKeyDown={handleKeyNav}
      className="flex flex-col h-full bg-zinc-950 light:bg-zinc-50 rounded-2xl border border-zinc-800 light:border-zinc-200 overflow-hidden shadow-xl"
    >
      {/* Header do Deck */}
      <div className="p-4 bg-zinc-900/90 light:bg-white border-b border-zinc-800 light:border-zinc-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-600/20 text-amber-400">
            <Presentation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white light:text-zinc-900">
              Apresentação Comercial & Pitch Executivo
            </h3>
            <p className="text-xs text-zinc-400 light:text-zinc-500">
              Slides estruturados para avaliação do Comitê de Inovação sem necessidade de edição prévia
            </p>
          </div>
        </div>

        {/* Controles do Slide */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-400">
            Slide <strong className="text-white light:text-zinc-900">{currentSlideIndex + 1}</strong> de {slides.length}
          </span>
          <div className="flex items-center gap-1 bg-zinc-950 light:bg-zinc-100 p-1 rounded-xl border border-zinc-800 light:border-zinc-200">
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white light:hover:text-zinc-900 disabled:opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentSlideIndex === slides.length - 1}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white light:hover:text-zinc-900 disabled:opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Próximo slide"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Área do Slide em Destaque */}
      <div className="flex-1 p-6 sm:p-10 flex items-center justify-center bg-zinc-950/70 light:bg-zinc-100/60 min-h-[420px]">
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
                  className={`h-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
    </div>
  );
}
