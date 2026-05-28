import Link from "next/link";
import type { ComponentType } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CircleDollarSign,
  Gem,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import type { BillingMetric, BillingSectionState, BillingTone } from "@/lib/billing";

import { BillingEmptyState } from "./billing-empty-state";

const iconByMetric: Record<BillingMetric["id"], ComponentType<{ className?: string }>> = {
  estimated_mrr: CircleDollarSign,
  estimated_arr: TrendingUp,
  paid_subscribers: Users,
  trial_subscribers: Gem,
  new_subscriptions: RefreshCw,
  cancellations: TrendingDown,
  renewals_due: CalendarClock,
};

const toneClass: Record<BillingTone, string> = {
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  positive: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
  danger: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300",
};

interface BillingSummaryCardsProps {
  metrics: BillingMetric[];
  state?: BillingSectionState;
}

export function BillingSummaryCards({ metrics, state }: BillingSummaryCardsProps) {
  if (metrics.length === 0) {
    return (
      <BillingEmptyState
        title={state?.title ?? "Sem indicadores"}
        message={state?.message ?? "Os indicadores aparecem quando houver dados de faturamento."}
        actionLabel={state?.actionLabel}
        actionHref={state?.actionHref}
      />
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = iconByMetric[metric.id] ?? AlertTriangle;
        const content = (
          <div className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-900/40">
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClass[metric.tone]}`}>
                <Icon className="h-5 w-5" />
              </div>
              {metric.href && <ArrowUpRight className="h-4 w-4 text-slate-300" />}
            </div>
            <div className="mt-5 min-w-0">
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

        if (!metric.href) {
          return <div key={metric.id}>{content}</div>;
        }

        return (
          <Link key={metric.id} href={metric.href} className="block h-full">
            {content}
          </Link>
        );
      })}
    </section>
  );
}
