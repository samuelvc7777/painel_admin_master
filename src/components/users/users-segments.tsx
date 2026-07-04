import { Layers3 } from "lucide-react";

import type { UsersOpsFilters, UsersOpsSectionState, UsersOpsSegment, UsersOpsTone } from "@/lib/users-operations";

import { UsersEmptyState } from "./users-empty-state";

const toneClass: Record<UsersOpsTone, string> = {
  neutral: "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900/40",
  positive: "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/10",
  warning: "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/10",
  danger: "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300 dark:hover:bg-red-900/10",
};

interface UsersSegmentsProps {
  segments: UsersOpsSegment[];
  state?: UsersOpsSectionState;
  onSelect: (filters: Partial<UsersOpsFilters>) => void;
}

export function UsersSegments({ segments, state, onSelect }: UsersSegmentsProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Layers3 className="h-5 w-5 text-slate-500" />
        <h2 className="text-sm font-black text-slate-950 dark:text-white">Segmentos</h2>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {segments.length === 0 ? (
          <div className="sm:col-span-2 xl:col-span-4">
            <UsersEmptyState
              title={state?.title ?? "Sem segmentos"}
              message={state?.message ?? "Os segmentos aparecem quando houver usuarios no recorte."}
            />
          </div>
        ) : (
          segments.map((segment) => (
            <button
              key={segment.id}
              type="button"
              onClick={() => onSelect(segment.filters)}
              className={`min-h-28 rounded-xl border bg-transparent p-4 text-left transition-colors ${toneClass[segment.tone]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-black">{segment.label}</p>
                <p className="text-lg font-black">{segment.value.toLocaleString("pt-BR")}</p>
              </div>
              <p className="mt-2 text-xs font-semibold leading-relaxed opacity-75">{segment.description}</p>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
