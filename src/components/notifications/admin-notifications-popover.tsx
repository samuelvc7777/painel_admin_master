"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";

import { AdminNotificationItem } from "@/components/notifications/admin-notification-item";
import { fetchApi } from "@/lib/api/client";
import type { AdminNotification, AdminNotificationsResponse } from "@/lib/notifications";

const REFRESH_INTERVAL_MS = 30_000;
const READ_STORAGE_KEY = "admin-notifications-read-keys";

function readStoredKeys() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

function writeStoredKeys(keys: Set<string>) {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(keys).slice(-200)));
}

export function AdminNotificationsPopover() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [readKeys, setReadKeys] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsLoading(true);
    }

    setError(null);

    try {
      const response = (await fetchApi("/admin/notifications?limit=20")) as AdminNotificationsResponse;
      const storedKeys = readStoredKeys();
      setReadKeys(storedKeys);
      setItems(response.items);
      setUnreadCount(response.items.filter((item) => !storedKeys.has(item.eventKey)).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar notificacoes.");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadNotifications(true);
    const interval = window.setInterval(() => {
      void loadNotifications(false);
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const handleMarkRead = useCallback(async (notification: AdminNotification) => {
    if (readKeys.has(notification.eventKey)) {
      return;
    }

    const nextKeys = new Set(readKeys);
    nextKeys.add(notification.eventKey);
    writeStoredKeys(nextKeys);
    setReadKeys(nextKeys);
    setUnreadCount((current) => Math.max(0, current - 1));
  }, [readKeys]);

  const handleMarkAllRead = useCallback(async () => {
    if (unreadCount === 0) {
      return;
    }

    const nextKeys = new Set(readKeys);
    for (const item of items) {
      nextKeys.add(item.eventKey);
    }
    writeStoredKeys(nextKeys);
    setReadKeys(nextKeys);
    setUnreadCount(0);
  }, [items, readKeys, unreadCount]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400"
        aria-label="Abrir notificacoes"
        title="Notificacoes"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-none text-white dark:border-slate-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-slate-950/10 dark:shadow-black/40">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] p-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Notificacoes</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unreadCount > 0 ? `${unreadCount} nao vista(s)` : "Tudo em dia"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void loadNotifications(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                aria-label="Atualizar notificacoes"
                title="Atualizar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                aria-label="Marcar todas como vistas"
                title="Marcar todas como vistas"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[26rem] overflow-y-auto p-3">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300">
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Nenhuma notificacao administrativa por enquanto.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((notification) => (
                  <AdminNotificationItem
                    key={notification.id}
                    notification={{
                      ...notification,
                      readAt: readKeys.has(notification.eventKey) ? notification.occurredAt : null,
                    }}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
