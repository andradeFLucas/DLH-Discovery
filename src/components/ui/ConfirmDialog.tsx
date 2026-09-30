'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Estilo do botão de confirmação. */
  tone?: 'danger' | 'default';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={message} size="sm">
      <div className="flex items-start gap-3.5 mb-5">
        <div
          className={`p-3 rounded-2xl shrink-0 ${
            tone === 'danger' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
          }`}
        >
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
        </div>
        <p className="text-sm text-zinc-300 light:text-zinc-700 leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 light:text-zinc-600 hover:text-white light:hover:text-zinc-900 hover:bg-zinc-900 light:hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 light:focus:ring-offset-white ${
            tone === 'danger'
              ? 'bg-red-600 hover:bg-red-500 focus:ring-red-500'
              : 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-500'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
