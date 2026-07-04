import type { ComponentType } from "react";
import { BadgePercent, CalendarPlus, ShieldCheck, TrendingDown, Users } from "lucide-react";

import type { UsersOpsMetric, UsersOpsSectionState, UsersOpsTone } from "@/lib/users-operations";

import { UsersEmptyState } from "./users-empty-state";

const iconByMetric: Record<UsersOpsMetric["id"], ComponentType<{ className?: string }>> = {
  active_users: ShieldCheck,
  new_users: CalendarPlus,
  recent_cancellations: TrendingDown,
  trial_to_paid_conversion: BadgePercent,
};

const toneClass: Record<UsersOpsTone, string> = {
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  positive: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
  danger: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300",
};

interface UsersSummaryCardsProps {
  metrics: UsersOpsMetric[];
  state?: UsersOpsSectionState;
}

export function UsersSummaryCards({ metrics, state }: UsersSummaryCardsProps) {
  if (metrics.length === 0) {
    return (
      <UsersEmptyState
        title={state?.title ?? "Sem indicadores"}
        message={state?.message ?? "Os indicadores aparecem quando houver usuarios no recorte."}
      />
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = iconByMetric[metric.id] ?? Users;

        return (
          <div
            key={metric.id}
            className="flex min-h-44 flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass[metric.tone]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-4 min-w-0">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="mt-2 break-words text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                {metric.formattedValue}
              </p>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
                {metric.periodLabel} - {metric.description}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
