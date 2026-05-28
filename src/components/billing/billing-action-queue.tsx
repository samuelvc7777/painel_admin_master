import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CheckCircle2 } from "lucide-react";

import {
  formatRelativeDateForBilling,
  type BillingActionItem,
  type BillingPriority,
  type BillingSectionState,
} from "@/lib/billing";

import { BillingEmptyState } from "./billing-empty-state";

const priorityClass: Record<BillingPriority, string> = {
  high: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  low: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
};

interface BillingActionQueueProps {
  items: BillingActionItem[];
  state?: BillingSectionState;
}

export function BillingActionQueue({ items, state }: BillingActionQueueProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold tracking-tight">Fila de faturamento</h2>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Riscos e oportunidades ordenados para acao rapida.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <BillingEmptyState
            title={state?.title ?? "Sem pendencias criticas"}
            message={state?.message ?? "Nao ha itens exigindo acao imediata no recorte atual."}
            actionLabel={state?.actionLabel}
            actionHref={state?.actionHref}
          />
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--border)] bg-slate-50/70 p-4 transition-all hover:border-indigo-200 hover:bg-white dark:bg-slate-900/30 dark:hover:border-indigo-900/40 dark:hover:bg-slate-900"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${priorityClass[item.priority]}`}>
                    {item.priority === "high" ? "Alta" : item.priority === "medium" ? "Media" : "Baixa"}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{formatRelativeDateForBilling(item.occurredAt)}</span>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
            </Link>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Cada item possui destino direto para investigacao ou acao.
        </div>
      )}
    </section>
  );
}
