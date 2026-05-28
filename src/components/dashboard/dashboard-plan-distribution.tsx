import Link from "next/link";
import { ChevronRight, Gem } from "lucide-react";

import {
  formatCurrencyFromCentsForDashboard,
  formatPercent,
  type DashboardSectionState,
  type PlanDistributionItem,
} from "@/lib/dashboard";

import { DashboardEmptyState } from "./dashboard-empty-state";

interface DashboardPlanDistributionProps {
  items: PlanDistributionItem[];
  state?: DashboardSectionState;
}

export function DashboardPlanDistribution({ items, state }: DashboardPlanDistributionProps) {
  const highestRevenue = Math.max(...items.map((item) => item.estimatedRevenueCents), 1);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-bold tracking-tight">Receita por plano</h2>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Assinantes ativos e contribuicao estimada de cada plano.
          </p>
        </div>
        <Link
          href="/plans"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          Gerenciar planos
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <DashboardEmptyState
            title={state?.title ?? "Sem assinaturas ativas"}
            message={
              state?.message ??
              "Quando houver clientes assinantes, a receita estimada por plano aparece aqui."
            }
            actionLabel={state?.actionLabel ?? "Ver planos"}
            actionHref={state?.actionHref ?? "/plans"}
          />
        ) : (
          items.map((item) => (
            <Link
              key={item.planId}
              href={item.href}
              className="block rounded-2xl border border-[var(--border)] bg-slate-50/70 p-4 transition-all hover:border-indigo-200 hover:bg-white dark:bg-slate-900/30 dark:hover:border-indigo-900/40 dark:hover:bg-slate-900"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-950 dark:text-white">{item.planName}</p>
                    {!item.isActive && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                        Pausado
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {item.subscriberCount} assinante{item.subscriberCount === 1 ? "" : "s"} ativo
                    {item.subscriberCount === 1 ? "" : "s"} - {formatPercent(item.sharePercent)} do MRR
                  </p>
                </div>
                <p className="shrink-0 text-left text-sm font-black text-slate-950 dark:text-white sm:text-right">
                  {formatCurrencyFromCentsForDashboard(item.estimatedRevenueCents)}
                </p>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${Math.max(8, (item.estimatedRevenueCents / highestRevenue) * 100)}%` }}
                />
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
