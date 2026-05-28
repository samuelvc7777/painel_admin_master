import Link from "next/link";
import { Activity, ArrowUpRight } from "lucide-react";

import {
  formatCurrencyFromCentsForBilling,
  formatRelativeDateForBilling,
  type BillingEvent,
  type BillingImpact,
  type BillingSectionState,
} from "@/lib/billing";

import { BillingEmptyState } from "./billing-empty-state";

const impactClass: Record<BillingImpact, string> = {
  positive: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  negative: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
};

function formatImpact(value: number | null) {
  if (value === null || value === 0) {
    return "Sem impacto direto";
  }

  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatCurrencyFromCentsForBilling(Math.abs(value))}`;
}

interface BillingEventsTimelineProps {
  events: BillingEvent[];
  state?: BillingSectionState;
}

export function BillingEventsTimeline({ events, state }: BillingEventsTimelineProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold tracking-tight">Eventos de faturamento</h2>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            O que entrou, saiu ou mudou no recorte selecionado.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {events.length === 0 ? (
          <BillingEmptyState
            title={state?.title ?? "Sem eventos no periodo"}
            message={state?.message ?? "Novas assinaturas, renovacoes, cancelamentos e trocas aparecem aqui."}
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${impactClass[event.impact]}`}>
                    {formatImpact(event.impactAmountCents)}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{formatRelativeDateForBilling(event.occurredAt)}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{event.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {event.description}
                </p>
                <p className="mt-2 truncate text-xs font-semibold text-slate-400">
                  {event.actorName ?? "Registro administrativo"}
                  {event.relatedPlanName ? ` - ${event.relatedPlanName}` : ""}
                </p>
              </div>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
