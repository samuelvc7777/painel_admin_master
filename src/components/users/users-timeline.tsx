import { Activity, CalendarClock, CheckCircle2, CircleSlash, RefreshCw, UserPlus } from "lucide-react";
import type { ComponentType } from "react";

import {
  formatRelativeDateForUsersOps,
  type UsersOpsSectionState,
  type UsersOpsTimelineEvent,
  type UsersOpsTone,
} from "@/lib/users-operations";

import { UsersEmptyState } from "./users-empty-state";

const iconByType: Record<UsersOpsTimelineEvent["type"], ComponentType<{ className?: string }>> = {
  user_created: UserPlus,
  subscription_created: CheckCircle2,
  subscription_renewed: RefreshCw,
  subscription_canceled: CircleSlash,
  plan_changed: Activity,
  access_updated: CalendarClock,
};

const toneClass: Record<UsersOpsTone, string> = {
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  positive: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300",
  danger: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300",
};

interface UsersTimelineProps {
  events: UsersOpsTimelineEvent[];
  state?: UsersOpsSectionState;
}

export function UsersTimeline({ events, state }: UsersTimelineProps) {
  return (
    <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Timeline operacional</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Eventos relevantes do ciclo de vida do usuario.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {events.length === 0 ? (
          <UsersEmptyState
            title={state?.title ?? "Sem eventos operacionais"}
            message={state?.message ?? "Eventos de cadastro, assinatura e acesso aparecem aqui."}
          />
        ) : (
          events.map((event) => {
            const Icon = iconByType[event.type] ?? Activity;

            return (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-slate-50/70 p-4 dark:bg-slate-900/30"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClass[event.tone]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-black text-slate-950 dark:text-white">{event.title}</p>
                    <span className="text-xs font-bold text-slate-400">{formatRelativeDateForUsersOps(event.occurredAt)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{event.description}</p>
                  {event.relatedPlanName && (
                    <p className="mt-2 text-xs font-bold text-slate-400">{event.relatedPlanName}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
