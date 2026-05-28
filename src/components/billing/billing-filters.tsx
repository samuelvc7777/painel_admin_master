import { Filter } from "lucide-react";

import type { BillingFilters as BillingFiltersValue, BillingPlanOption } from "@/lib/billing";

interface BillingFiltersProps {
  filters: BillingFiltersValue;
  plans: BillingPlanOption[];
  isLoading?: boolean;
  onChange: (filters: Partial<BillingFiltersValue>) => void;
}

export function BillingFilters({ filters, plans, isLoading, onChange }: BillingFiltersProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-950 dark:text-white">Filtros de leitura</h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ajuste periodo, renovacoes e plano sem perder o contexto.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[34rem]">
          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Periodo</span>
            <select
              value={filters.periodDays}
              disabled={isLoading}
              onChange={(event) => onChange({ periodDays: Number(event.target.value) as BillingFiltersValue["periodDays"] })}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:bg-slate-950"
            >
              <option value={7}>7 dias</option>
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Renovacoes</span>
            <select
              value={filters.renewalWindowDays}
              disabled={isLoading}
              onChange={(event) => onChange({ renewalWindowDays: Number(event.target.value) })}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:bg-slate-950"
            >
              <option value={7}>7 dias</option>
              <option value={14}>14 dias</option>
              <option value={30}>30 dias</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Plano</span>
            <select
              value={filters.planId ?? ""}
              disabled={isLoading}
              onChange={(event) => onChange({ planId: event.target.value ? Number(event.target.value) : null })}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:bg-slate-950"
            >
              <option value="">Todos</option>
              {plans.map((plan) => (
                <option key={plan.planId} value={plan.planId}>
                  {plan.planName}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}
