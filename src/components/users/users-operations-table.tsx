import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, UserRound } from "lucide-react";

import type { UsersOpsListItem, UsersOpsPagination, UsersOpsSectionState } from "@/lib/users-operations";

import { UsersEmptyState } from "./users-empty-state";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface UsersOperationsTableProps {
  users: UsersOpsListItem[];
  pagination?: UsersOpsPagination;
  state?: UsersOpsSectionState;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export function UsersOperationsTable({ users, pagination, state, isLoading, onPageChange }: UsersOperationsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex flex-col gap-2 border-b border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-950 dark:text-white">Usuarios operacionais</h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Status, plano e ultima atividade no mesmo lugar.
          </p>
        </div>
        {pagination && (
          <p className="text-xs font-bold text-slate-400">
            {pagination.total.toLocaleString("pt-BR")} usuarios
          </p>
        )}
      </div>

      {users.length === 0 ? (
        <div className="p-4">
          <UsersEmptyState
            title={state?.title ?? "Nenhum usuario encontrado"}
            message={state?.message ?? "Ajuste os filtros para ampliar a busca."}
            actionLabel={state?.actionLabel}
            actionHref={state?.actionHref}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-slate-50/70 dark:bg-slate-900/30">
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Usuario</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Ciclo</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Plano</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Atividade</th>
                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white dark:bg-white dark:text-slate-950">
                        {initials(user.name) || <UserRound className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-950 dark:text-white">{user.name}</p>
                        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.lifecycleStage}</p>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        user.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                          : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                        {user.isActive ? "Acesso ativo" : "Bloqueado"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.activePlanName ?? "Sem plano"}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">{user.subscriptionStatus ?? "Sem assinatura"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.lastActivityLabel}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Criado em {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={user.href}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-black text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                      Abrir
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] bg-slate-50/40 p-4 dark:bg-slate-900/20">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Pagina {pagination.page} de {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => onPageChange(pagination.page - 1)}
              className="rounded-lg border border-[var(--border)] p-2 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-900"
              aria-label="Pagina anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || isLoading}
              onClick={() => onPageChange(pagination.page + 1)}
              className="rounded-lg border border-[var(--border)] p-2 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-900"
              aria-label="Proxima pagina"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
