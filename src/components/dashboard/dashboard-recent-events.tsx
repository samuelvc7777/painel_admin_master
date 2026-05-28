import Link from "next/link";
import { Activity, ArrowUpRight } from "lucide-react";

import { formatRelativeDate, type DashboardSectionState, type RecentOperationalEvent } from "@/lib/dashboard";

import { DashboardEmptyState } from "./dashboard-empty-state";

interface DashboardRecentEventsProps {
  events: RecentOperationalEvent[];
  state?: DashboardSectionState;
}

export function DashboardRecentEvents({ events, state }: DashboardRecentEventsProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold tracking-tight">Eventos recentes</h2>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Mudancas de cadastro e assinatura que impactam a operacao.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {events.length === 0 ? (
          <DashboardEmptyState
            title={state?.title ?? "Sem eventos recentes"}
            message={state?.message ?? "Novos cadastros, assinaturas e cancelamentos aparecem aqui."}
            actionLabel={state?.actionLabel}
            actionHref={state?.actionHref}
          />
        ) : (
          events.map((event) => (
            <Link
              key={event.id}
              href={event.href}
              className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--border)] bg-slate-50/70 p-4 transition-all hover:border-indigo-200 hover:bg-white dark:bg-slate-900/30 dark:hover:border-indigo-900/40 dark:hover:bg-slate-900"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-950 dark:text-white">{event.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {event.description}
                </p>
                <p className="mt-2 truncate text-xs font-semibold text-slate-400">
                  {event.actorName ?? "Registro administrativo"}
                  {event.relatedPlanName ? ` - ${event.relatedPlanName}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                <span className="text-xs font-bold text-slate-400">{formatRelativeDate(event.occurredAt)}</span>
                <ArrowUpRight className="h-4 w-4 text-slate-300" />
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
