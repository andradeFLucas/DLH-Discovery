'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCheck, Bell, Award, Sparkles, ArrowRight } from 'lucide-react';
import { NotificationItem } from '@/lib/types';
import Drawer from '@/components/ui/Drawer';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onNotificationClick,
}: NotificationDrawerProps) {
  const router = useRouter();

  const handleCardClick = (notif: NotificationItem) => {
    onNotificationClick(notif);
    onClose();
    if (notif.idea_id) {
      router.push(`/bymoto/submissao/ideia/${notif.idea_id}`);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Notificações in-app" side="right">
          {/* Topo do Painel */}
          <div className="p-4 border-b border-zinc-800 light:border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white light:text-zinc-900">Notificações In-App</h3>
                <p className="text-xs text-zinc-400 light:text-zinc-500">Avisos e mudanças de status de ideias</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="p-1.5 text-xs text-zinc-300 light:text-zinc-600 hover:text-white light:hover:text-zinc-900 flex items-center gap-1 rounded-md hover:bg-zinc-900 light:hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <CheckCheck className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Marcar lidas</span>
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Fechar notificações"
                className="p-1.5 rounded-lg text-zinc-300 light:text-zinc-600 hover:text-white light:hover:text-zinc-900 hover:bg-zinc-900 light:hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Lista de Notificações */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 light:text-zinc-500">
                <Bell className="w-10 h-10 stroke-1 mb-2 opacity-40" aria-hidden="true" />
                <p className="text-sm font-medium">Nenhuma notificação por aqui</p>
                <p className="text-xs text-zinc-400 light:text-zinc-500 mt-1">
                  Você será avisado quando gestores avaliarem ideias ou quando novas metas forem batidas.
                </p>
              </div>
            ) : (
              notifications.map((notif, idx) => {
                const isNewest = idx === 0;
                return (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => handleCardClick(notif)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all relative group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !notif.read
                        ? 'bg-zinc-900/90 light:bg-blue-50/70 border-blue-500/40 hover:border-blue-500 shadow-sm'
                        : 'bg-zinc-900/40 light:bg-zinc-50 border-zinc-800/80 light:border-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {!notif.read && (
                      <span
                        className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500 animate-pulse"
                        aria-label="Não lida"
                      />
                    )}

                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg mt-0.5 ${
                          notif.type === 'status_change'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : notif.type === 'goal_classified'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {notif.type === 'status_change' ? (
                          <Award className="w-4 h-4" aria-hidden="true" />
                        ) : notif.type === 'goal_classified' ? (
                          <Sparkles className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Bell className="w-4 h-4" aria-hidden="true" />
                        )}
                      </div>

                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-200 light:text-zinc-800">
                            {notif.title}
                          </h4>
                          {isNewest && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 light:text-blue-700 font-medium">
                              Recente
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-300 light:text-zinc-600 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-zinc-400 light:text-zinc-500">
                          <span>{new Date(notif.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          {notif.idea_id && (
                            <span className="flex items-center gap-1 text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform">
                              Ver ideia <ArrowRight className="w-3 h-3" aria-hidden="true" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
    </Drawer>
  );
}
