import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";

interface BillingEmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function BillingEmptyState({ title, message, actionLabel, actionHref }: BillingEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-slate-50/60 p-5 text-center dark:bg-slate-900/25">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm dark:bg-slate-950">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {message}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-indigo-600 shadow-sm transition-colors hover:text-indigo-700 dark:bg-slate-950 dark:text-indigo-300"
        >
          {actionLabel}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
