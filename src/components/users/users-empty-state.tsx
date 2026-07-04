import Link from "next/link";
import { Inbox } from "lucide-react";

interface UsersEmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function UsersEmptyState({ title, message, actionLabel, actionHref }: UsersEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-slate-50/70 p-5 text-center dark:bg-slate-900/30">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm dark:bg-slate-950">
        <Inbox className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mx-auto mt-1 max-w-lg text-sm leading-relaxed text-slate-500 dark:text-slate-400">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
