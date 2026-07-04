import { Filter, RotateCcw, Search } from "lucide-react";

import type { UsersOpsFilters, UsersOpsPlanOption } from "@/lib/users-operations";

interface UsersFiltersProps {
  filters: UsersOpsFilters;
  plans: UsersOpsPlanOption[];
  isLoading?: boolean;
  onChange: (filters: Partial<UsersOpsFilters>) => void;
  onReset: () => void;
}

export function UsersFilters({ filters, plans, isLoading, onChange, onReset }: UsersFiltersProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-950 dark:text-white">Filtros operacionais</h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Periodo, plano, acesso, assinatura e busca.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:min-w-[46rem] xl:grid-cols-5">
          <label className="space-y-1 md:col-span-3 xl:col-span-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Busca</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={filters.search}
                disabled={isLoading}
                onChange={(event) => onChange({ search: event.target.value, page: 1 })}
                placeholder="Nome, email, telefone ou cargo"
                className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-9 pr-3 text-sm font-semibold outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:bg-slate-950"
              />
            </div>
          </label>

          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Periodo</span>
            <select
              value={filters.periodDays}
              disabled={isLoading}
              onChange={(event) => onChange({ periodDays: Number(event.target.value) as UsersOpsFilters["periodDays"], page: 1 })}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:bg-slate-950"
            >
              <option value={7}>7 dias</option>
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Plano</span>
            <select
              value={filters.planId ?? ""}
              disabled={isLoading}
              onChange={(event) => onChange({ planId: event.target.value ? Number(event.target.value) : null, page: 1 })}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:bg-slate-950"
            >
              <option value="">Todos</option>
              {plans.map((plan) => (
                <option key={plan.planId} value={plan.planId}>
                  {plan.planName}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Acesso</span>
            <select
              value={filters.accessStatus}
              disabled={isLoading}
              onChange={(event) => onChange({ accessStatus: event.target.value as UsersOpsFilters["accessStatus"], page: 1 })}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:bg-slate-950"
            >
              <option value="all">Todos</option>
              <option value="active">Ativo</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assinatura</span>
            <select
              value={filters.subscriptionStatus}
              disabled={isLoading}
              onChange={(event) => onChange({ subscriptionStatus: event.target.value as UsersOpsFilters["subscriptionStatus"], page: 1 })}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-60 dark:bg-slate-950"
            >
              <option value="all">Todas</option>
              <option value="active">Paga</option>
              <option value="trial">Trial</option>
              <option value="canceled">Cancelada</option>
              <option value="none">Sem plano</option>
            </select>
          </label>

        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2.5 text-xs font-black text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <RotateCcw className="h-4 w-4" />
          Limpar
        </button>
      </div>
    </section>
  );
}
