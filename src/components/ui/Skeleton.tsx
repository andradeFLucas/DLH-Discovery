import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-800/70 light:bg-zinc-200 ${className}`}
      aria-hidden="true"
    />
  );
}

/** Esqueleto para as páginas de detalhe de ideia (cabeçalho + abas + conteúdo). */
export function IdeaDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6" role="status" aria-label="Carregando proposta">
      <Skeleton className="h-4 w-40" />
      <div className="p-6 rounded-3xl bg-zinc-900/60 light:bg-white border border-zinc-800 light:border-zinc-200 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 flex-1 min-w-[100px]" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-2xl" />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
