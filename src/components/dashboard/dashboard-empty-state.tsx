import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface DashboardEmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function DashboardEmptyState({
  title,
  message,
  actionLabel,
  actionHref,
}: DashboardEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-slate-50/60 p-6 text-center dark:bg-slate-900/30">
      <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {message}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-200"
        >
          {actionLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
