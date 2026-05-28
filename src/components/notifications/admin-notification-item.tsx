"use client";

import { CalendarClock, Gem, UserPlus, XCircle } from "lucide-react";

import type { AdminNotification, AdminNotificationType } from "@/lib/notifications";

const iconByType: Record<AdminNotificationType, typeof Gem> = {
  SUBSCRIPTION_CREATED: Gem,
  SUBSCRIPTION_RENEWED: CalendarClock,
  SUBSCRIPTION_CANCELED: XCircle,
  USER_CREATED: UserPlus,
};

const colorByType: Record<AdminNotificationType, string> = {
  SUBSCRIPTION_CREATED: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-300",
  SUBSCRIPTION_RENEWED: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300",
  SUBSCRIPTION_CANCELED: "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-300",
  USER_CREATED: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300",
};

function parseSupabaseDate(value: string) {
  const hasTimezone = /(?:z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function formatDate(value: string) {
  return parseSupabaseDate(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

interface AdminNotificationItemProps {
  notification: AdminNotification;
  onMarkRead: (notification: AdminNotification) => void;
}

export function AdminNotificationItem({
  notification,
  onMarkRead,
}: AdminNotificationItemProps) {
  const Icon = iconByType[notification.type];
  const isUnread = !notification.readAt;

  return (
    <button
      type="button"
      onClick={() => onMarkRead(notification)}
      className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all ${
        isUnread
          ? "border-indigo-100 bg-indigo-50/70 hover:border-indigo-200 dark:border-indigo-900/30 dark:bg-indigo-950/20"
          : "border-[var(--border)] bg-slate-50/70 hover:border-slate-200 dark:bg-slate-900/30 dark:hover:border-slate-700"
      }`}
    >
      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorByType[notification.type]}`}>
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
              {notification.title}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {notification.message}
            </span>
          </span>
          {isUnread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />}
        </span>

        <span className="mt-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {formatDate(notification.occurredAt)}
        </span>
      </span>
    </button>
  );
}
