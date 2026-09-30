'use client';

import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface SkipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  questionLabel?: string;
}

export default function SkipModal({ isOpen, onClose, onConfirm, questionLabel }: SkipModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tem certeza que deseja pular essa pergunta?" size="sm">
      <div className="flex items-start gap-3.5 mb-4">
        <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0">
          <HelpCircle className="w-6 h-6" aria-hidden="true" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 pt-1">Pular Pergunta</p>
      </div>

      <div className="p-3.5 rounded-2xl bg-zinc-900/80 light:bg-amber-50/60 border border-zinc-800 light:border-amber-200 text-xs text-zinc-300 light:text-zinc-800 leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          A IA vai tentar <strong>inferir automaticamente</strong> a resposta técnica necessária com base no problema, na
          solução e nas outras respostas que você já preencheu.
        </span>
      </div>

      {questionLabel && (
        <p className="text-[11px] text-zinc-500 light:text-zinc-500 italic line-clamp-2 px-1 mt-3">
          &ldquo;{questionLabel}&rdquo;
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-zinc-800 light:border-zinc-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 light:text-zinc-600 hover:text-white light:hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
          }}
          className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-950 light:focus:ring-offset-white"
        >
          Pular mesmo assim
        </button>
      </div>
    </Modal>
  );
}
