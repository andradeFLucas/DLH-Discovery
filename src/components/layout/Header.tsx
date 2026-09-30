'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb, Inbox, Target, Bell, Sun, Moon, CheckCircle2, ChevronDown } from 'lucide-react';
import { StorageService } from '@/lib/storage';
import { Profile, NotificationItem } from '@/lib/types';
import NotificationDrawer from './NotificationDrawer';

const NAV_ITEMS = [
  { href: '/bymoto/submissao', label: 'Submissão', full: 'Submissão de Ideias', icon: Lightbulb },
  { href: '/bymoto/banco', label: 'Banco', full: 'Banco de Ideias', icon: Inbox },
  { href: '/bymoto/metas', label: 'Metas', full: 'Metas Estratégicas', icon: Target },
];

const THEME_KEY = 'banco_ideias_theme';

export default function Header() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  const syncState = () => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    setProfiles(StorageService.getProfiles());
    setNotifications(StorageService.getNotifications(user.id));
  };

  useEffect(() => {
    syncState();

    const handleSync = () => syncState();
    window.addEventListener('auth_changed', handleSync);
    window.addEventListener('notification_added', handleSync);
    window.addEventListener('storage-sync', handleSync);

    setIsDark(!document.documentElement.classList.contains('light'));

    return () => {
      window.removeEventListener('auth_changed', handleSync);
      window.removeEventListener('notification_added', handleSync);
      window.removeEventListener('storage-sync', handleSync);
    };
  }, []);

  useEffect(() => {
    if (!isRoleDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsRoleDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isRoleDropdownOpen]);

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

  const handleSwitchUser = (profileId: string) => {
    StorageService.setCurrentUser(profileId);
    setIsRoleDropdownOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isActive = (href: string) => pathname.startsWith(href);

  const roleColor = (role?: string) =>
    role === 'admin' ? 'bg-purple-600' : role === 'avaliador' ? 'bg-amber-600' : 'bg-blue-600';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md text-zinc-100 light:bg-zinc-50/85 light:border-zinc-200 light:text-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Marca */}
          <div className="flex items-center gap-7">
            <Link href="/bymoto" className="flex items-center gap-3 group">
              <span className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center transition-colors group-hover:bg-blue-500">
                <Lightbulb className="w-[18px] h-[18px]" aria-hidden="true" />
              </span>
              <span className="leading-tight">
                <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 light:text-zinc-500">
                  Dealer Hub · By Moto
                </span>
                <span className="block text-[15px] font-semibold tracking-tight text-zinc-100 light:text-zinc-900">
                  Banco de Ideias
                </span>
              </span>
            </Link>

            {/* Navegação (desktop) */}
            <nav className="hidden md:flex items-center gap-1 pl-5 border-l border-zinc-800 light:border-zinc-200">
              {NAV_ITEMS.map(({ href, full, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2 ${
                    isActive(href)
                      ? 'text-blue-400 bg-blue-500/10 light:text-blue-700 light:bg-blue-50'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 light:text-zinc-600 light:hover:text-zinc-900 light:hover:bg-zinc-100'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {full}
                </Link>
              ))}
            </nav>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 light:text-zinc-600 light:hover:text-zinc-900 light:hover:bg-zinc-100 transition-colors"
              aria-label={unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : 'Notificações'}
            >
              <Bell className="w-[18px] h-[18px]" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 font-mono text-[10px] font-semibold text-white ring-2 ring-zinc-950 light:ring-zinc-50">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 light:text-zinc-600 light:hover:text-zinc-900 light:hover:bg-zinc-100 transition-colors"
              aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" aria-hidden="true" /> : <Moon className="w-[18px] h-[18px]" aria-hidden="true" />}
            </button>

            {/* Seletor de perfil demo */}
            <div className="relative ml-1" ref={roleMenuRef}>
              <button
                onClick={() => setIsRoleDropdownOpen((v) => !v)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border border-zinc-800 light:border-zinc-200 bg-zinc-900/70 light:bg-white hover:border-zinc-700 light:hover:border-zinc-300 transition-colors"
                aria-haspopup="menu"
                aria-expanded={isRoleDropdownOpen}
                aria-label="Alternar papel de teste"
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-[11px] ${roleColor(currentUser?.role)}`}
                  aria-hidden="true"
                >
                  {currentUser?.full_name.slice(0, 1) || 'U'}
                </span>
                <span className="text-left hidden sm:block">
                  <span className="block text-[13px] font-medium leading-none text-zinc-100 light:text-zinc-900">
                    {currentUser?.full_name}
                  </span>
                  <span className="block font-mono text-[10px] text-zinc-500 capitalize mt-0.5">
                    {currentUser?.role} · {currentUser?.area}
                  </span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" />
              </button>

              {isRoleDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 light:border-zinc-200 bg-zinc-950 light:bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <p className="px-2 py-1.5 font-mono text-[10px] font-medium text-zinc-500 uppercase tracking-[0.14em]">
                    Alternar papel de teste
                  </p>
                  <div className="space-y-0.5">
                    {profiles.map((p) => {
                      const isSelected = p.id === currentUser?.id;
                      return (
                        <button
                          key={p.id}
                          role="menuitemradio"
                          aria-checked={isSelected}
                          onClick={() => handleSwitchUser(p.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-[13px] transition-colors ${
                            isSelected
                              ? 'bg-blue-500/10 text-blue-400 light:bg-blue-50 light:text-blue-700 font-medium'
                              : 'text-zinc-300 light:text-zinc-700 hover:bg-zinc-900 light:hover:bg-zinc-100'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${roleColor(p.role)}`} aria-hidden="true" />
                            <span>
                              <span className="block font-medium">{p.full_name}</span>
                              <span className="block font-mono text-[10px] text-zinc-500 capitalize">
                                {p.role} · {p.area}
                              </span>
                            </span>
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-500" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 pt-1.5 border-t border-zinc-800/80 light:border-zinc-200 font-mono text-[10px] text-zinc-500 px-2 leading-relaxed">
                    Homologa permissões de Colaborador, Comitê e Admin em 1 clique.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navegação inferior (mobile) */}
      <nav
        aria-label="Navegação principal"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-md light:bg-zinc-50/95 light:border-zinc-200 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? 'text-blue-400 light:text-blue-700' : 'text-zinc-500 light:text-zinc-500'
                }`}
              >
                <span className={`relative flex items-center justify-center ${active ? '' : ''}`}>
                  <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                  {active && (
                    <span className="absolute -top-2.5 h-0.5 w-6 rounded-full bg-blue-500" aria-hidden="true" />
                  )}
                </span>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          if (currentUser) {
            StorageService.markAllNotificationsAsRead(currentUser.id);
            syncState();
          }
        }}
        onNotificationClick={(notif) => {
          StorageService.markNotificationAsRead(notif.id);
          syncState();
        }}
      />
    </>
  );
}
