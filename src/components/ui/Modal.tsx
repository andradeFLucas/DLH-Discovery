'use client';

import React, { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Título acessível — vira o aria-labelledby do diálogo. */
  title: string;
  /** Oculta o título visualmente (mantém para leitores de tela). */
  hideTitle?: boolean;
  description?: string;
  children: React.ReactNode;
  /** Largura máxima (classe Tailwind). */
  size?: 'sm' | 'md' | 'lg';
  /** Impede fechar por clique no backdrop / Esc (ex.: operação em andamento). */
  dismissible?: boolean;
  /** Rótulo do botão X. */
  closeLabel?: string;
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  isOpen,
  onClose,
  title,
  hideTitle = false,
  description,
  children,
  size = 'md',
  dismissible = true,
  closeLabel = 'Fechar',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const requestClose = useCallback(() => {
    if (dismissible) onClose();
  }, [dismissible, onClose]);

  // Trava o scroll do body enquanto aberto
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Foco inicial + restauração de foco ao fechar
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  // Esc para fechar + focus trap
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        requestClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [isOpen, requestClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={requestClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative w-full ${SIZES[size]} bg-zinc-950 light:bg-white border border-zinc-800 light:border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-2xl outline-none animate-in fade-in zoom-in-95 duration-150`}
      >
        {dismissible && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 light:text-zinc-500 light:hover:text-zinc-900 hover:bg-zinc-900 light:hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
        <h2 id={titleId} className={hideTitle ? 'sr-only' : 'text-lg font-bold text-white light:text-zinc-900 pr-8'}>
          {title}
        </h2>
        {description && (
          <p id={descId} className="text-xs text-zinc-400 light:text-zinc-600 mt-1 leading-relaxed">
            {description}
          </p>
        )}
        <div className={hideTitle ? '' : 'mt-4'}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
