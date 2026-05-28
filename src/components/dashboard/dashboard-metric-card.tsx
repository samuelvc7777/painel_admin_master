import Link from "next/link";
import type { ComponentType } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CircleDollarSign,
  Gem,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

import type { DashboardTone, OperationalMetric } from "@/lib/dashboard";

const iconByMetric: Record<string, ComponentType<{ className?: string }>> = {
  total_users: Users,
  active_users: UserCheck,
  active_subscribers: Gem,
  new_users: Sparkles,
  estimated_mrr: CircleDollarSign,
};

const toneClass: Record<DashboardTone, string> = {
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  positive: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
  danger: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300",
};

interface DashboardMetricCardProps {
  metric: OperationalMetric;
}

export function DashboardMetricCard({ metric }: DashboardMetricCardProps) {
  const Icon = iconByMetric[metric.id] ?? (metric.tone === "warning" ? AlertTriangle : Activity);
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
          {metric.periodLabel ? `${metric.periodLabel} - ` : ""}
          {metric.description}
        </p>
      </div>
    </div>
  );

  if (!metric.href) {
    return content;
  }

  return (
    <Link href={metric.href} className="block h-full">
      {content}
    </Link>
  );
}
