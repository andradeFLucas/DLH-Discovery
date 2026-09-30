'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: 'aprovada' | 'reprovada' | 'standby';
  onConfirm: (comment: string) => void;
  ideaTitle: string;
}

export default function DecisionModal({
  isOpen,
  onClose,
  decision,
  onConfirm,
  ideaTitle,
}: DecisionModalProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  // Limpa o formulário sempre que reabrir
  useEffect(() => {
    if (isOpen) {
      setComment('');
      setError('');
    }
  }, [isOpen, decision]);

  const isReject = decision === 'reprovada';
  const isApprove = decision === 'aprovada';

  const title = isApprove
    ? 'Aprovar Ideia para Desenvolvimento'
    : isReject
    ? 'Reprovar Proposta'
    : 'Deixar Ideia em Standby';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReject && !comment.trim()) {
      setError('Por favor, informe a justificativa da reprovação para orientar o proponente.');
      return;
    }
    onConfirm(comment);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="flex items-start gap-4 mb-5">
        <div
          className={`p-3 rounded-2xl shrink-0 ${
            isApprove
              ? 'bg-emerald-500/20 text-emerald-400'
              : isReject
              ? 'bg-red-500/20 text-red-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          {isApprove ? (
            <CheckCircle className="w-6 h-6" aria-hidden="true" />
          ) : isReject ? (
            <XCircle className="w-6 h-6" aria-hidden="true" />
          ) : (
            <Clock className="w-6 h-6" aria-hidden="true" />
          )}
        </div>
        <div>
          <p
            className={`text-[11px] font-bold uppercase tracking-wider ${
              isApprove ? 'text-emerald-400' : isReject ? 'text-red-400' : 'text-amber-400'
            }`}
          >
            Comitê Avaliador • Decisão
          </p>
          <p className="text-xs text-zinc-400 light:text-zinc-600 mt-1 line-clamp-2">
            Ideia: &ldquo;{ideaTitle}&rdquo;
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="decision-comment"
            className="text-xs font-semibold text-zinc-300 light:text-zinc-700 flex items-center justify-between"
          >
            <span>Parecer / Comentário {isReject ? '(Obrigatório)' : '(Opcional)'}</span>
            {isReject && <span className="text-red-400 text-[11px]">* Obrigatório</span>}
          </label>
          <textarea
            id="decision-comment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (error) setError('');
            }}
            rows={4}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'decision-comment-error' : undefined}
            placeholder={
              isReject
                ? 'Explique claramente o motivo da reprovação (ex: fora do escopo estratégico atual, restrição técnica de ERP...)'
                : isApprove
                ? 'Instruções ou elogios para a equipe de desenvolvimento (opcional)...'
                : 'Motivo para reavaliação futura (ex: aguardar novo ciclo trimestral de orçamento)...'
            }
            className="w-full p-3.5 rounded-2xl bg-zinc-900 light:bg-zinc-50 border border-zinc-800 light:border-zinc-300 text-sm text-zinc-100 light:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed"
          />
          {error && (
            <p id="decision-comment-error" role="alert" className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 light:bg-zinc-100 text-[11px] text-zinc-400 light:text-zinc-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-blue-400" aria-hidden="true" />
          <span>
            Ao confirmar, o status será atualizado no Banco de Ideias e o proponente receberá uma notificação imediata.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-300 light:text-zinc-600 hover:text-white light:hover:text-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 light:focus:ring-offset-white ${
              isApprove
                ? 'bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500'
                : isReject
                ? 'bg-red-600 hover:bg-red-500 focus:ring-red-500'
                : 'bg-amber-600 hover:bg-amber-500 focus:ring-amber-500'
            }`}
          >
            Confirmar Decisão
          </button>
        </div>
      </form>
    </Modal>
  );
}
