'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Sun, Moon } from 'lucide-react';

const THEME_KEY = 'banco_ideias_theme';

export default function LandingHeader() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains('light'));
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextDark = root.classList.contains('light');
    root.classList.toggle('light', !nextDark);
    root.classList.toggle('dark', nextDark);
    try {
      localStorage.setItem(THEME_KEY, nextDark ? 'dark' : 'light');
    } catch {
      /* storage indisponível */
    }
    setIsDark(nextDark);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md text-zinc-100 light:bg-white/85 light:border-zinc-200 light:text-zinc-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Marca Embaixadores de IA */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-[18px] h-[18px]" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400 light:text-blue-600">
              Dealer Hub
            </span>
            <span className="block text-[15px] font-bold tracking-tight text-zinc-100 light:text-zinc-900">
              Embaixadores de IA
            </span>
          </div>
        </Link>

        {/* Controles: apenas alternador de tema */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 light:text-zinc-600 light:hover:text-zinc-900 light:hover:bg-zinc-100 transition-colors"
            title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            aria-label="Alternar tema"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
