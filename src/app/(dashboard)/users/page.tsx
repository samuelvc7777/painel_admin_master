"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  UsersFilters,
  UsersOperationsTable,
  UsersSectionError,
  UsersSegments,
  UsersSummaryCards,
} from "@/components/users";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import { fetchApi } from "@/lib/api/client";
import type { UsersOperationsDashboard, UsersOpsFilters, UsersOpsSectionState } from "@/lib/users-operations";

const defaultFilters: UsersOpsFilters = {
  periodDays: 30,
  renewalWindowDays: 7,
  planId: null,
  accessStatus: "all",
  subscriptionStatus: "all",
  search: "",
  page: 1,
  limit: 10,
};

function normalizePeriod(value: string | null): UsersOpsFilters["periodDays"] {
  const parsed = Number(value);
  return parsed === 7 || parsed === 30 || parsed === 90 ? parsed : defaultFilters.periodDays;
}

function normalizePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizePlanId(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeOption<T extends string>(value: string | null, options: readonly T[], fallback: T) {
  return value && options.includes(value as T) ? (value as T) : fallback;
}

function readFiltersFromLocation(): UsersOpsFilters {
  if (typeof window === "undefined") {
    return defaultFilters;
  }

  const params = new URLSearchParams(window.location.search);

  return {
    periodDays: normalizePeriod(params.get("periodDays")),
    renewalWindowDays: normalizePositiveInt(params.get("renewalWindowDays"), defaultFilters.renewalWindowDays),
    planId: normalizePlanId(params.get("planId")),
    accessStatus: normalizeOption(params.get("accessStatus"), ["all", "active", "blocked"] as const, "all"),
    subscriptionStatus: normalizeOption(params.get("subscriptionStatus"), ["all", "active", "trial", "canceled", "none"] as const, "all"),
    search: params.get("search") ?? "",
    page: normalizePositiveInt(params.get("page"), defaultFilters.page),
    limit: normalizePositiveInt(params.get("limit"), defaultFilters.limit),
  };
}

function buildUsersEndpoint(filters: UsersOpsFilters) {
  const params = new URLSearchParams();

  params.set("periodDays", String(filters.periodDays));
  params.set("renewalWindowDays", String(filters.renewalWindowDays));
  params.set("accessStatus", filters.accessStatus);
  params.set("subscriptionStatus", filters.subscriptionStatus);
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));

  if (filters.planId) {
    params.set("planId", String(filters.planId));
  }

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  return `/admin/users/operations?${params.toString()}`;
}

function buildPageHref(filters: UsersOpsFilters) {
  const endpoint = buildUsersEndpoint(filters).replace("/admin/users/operations", "/users");
  return endpoint === "/users?" ? "/users" : endpoint;
}

function findSectionState(states: UsersOpsSectionState[], section: UsersOpsSectionState["section"]) {
  return states.find((state) => state.section === section);
}

export default function UsersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<UsersOpsFilters>(defaultFilters);
  const [data, setData] = useState<UsersOperationsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async (nextFilters: UsersOpsFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const usersData = (await fetchApi(buildUsersEndpoint(nextFilters))) as UsersOperationsDashboard;
      setData(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar usuarios.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialFilters = readFiltersFromLocation();
    setFilters(initialFilters);
    void loadUsers(initialFilters);
  }, [loadUsers]);

  const handleFilterChange = useCallback(
    (partial: Partial<UsersOpsFilters>) => {
      const nextFilters = {
        ...filters,
        ...partial,
      };

      setFilters(nextFilters);
      router.replace(buildPageHref(nextFilters), { scroll: false });
      void loadUsers(nextFilters);
    },
    [filters, loadUsers, router],
  );

  const handleReset = useCallback(() => {
    setFilters(defaultFilters);
    router.replace("/users", { scroll: false });
    void loadUsers(defaultFilters);
  }, [loadUsers, router]);

  const handleRefresh = useCallback(() => {
    void loadUsers(filters);
  }, [filters, loadUsers]);

  if (isLoading && !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Montando painel operacional de usuarios...
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <ResponsiveContainer>
        <UsersSectionError title="Usuarios indisponiveis" message={error} />
      </ResponsiveContainer>
    );
  }

  const generatedAt = data
    ? new Date(data.generatedAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <ResponsiveContainer>
      <div className="space-y-5 animate-fade-in-up">
        <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Usuarios operacionais
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Base e assinaturas em uma leitura unica
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Segmentos, assinaturas e atividade recente para suporte e retencao.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {generatedAt ? `Atualizado em ${generatedAt}` : "Atualizar"}
          </button>
        </section>

        <UsersFilters
          filters={filters}
          plans={data?.availablePlans ?? []}
          isLoading={isLoading}
          onChange={handleFilterChange}
          onReset={handleReset}
        />

        {error && (
          <UsersSectionError title="Nao foi possivel atualizar todos os dados" message={error} />
        )}

        <UsersSummaryCards
          metrics={data?.summary ?? []}
          state={data ? findSectionState(data.sectionStates, "summary") : undefined}
        />

        <UsersSegments
          segments={data?.segments ?? []}
          state={data ? findSectionState(data.sectionStates, "segments") : undefined}
          onSelect={handleFilterChange}
        />

        <UsersOperationsTable
          users={data?.users ?? []}
          pagination={data?.pagination}
          state={data ? findSectionState(data.sectionStates, "list") : undefined}
          isLoading={isLoading}
          onPageChange={(page) => handleFilterChange({ page })}
        />
      </div>
    </ResponsiveContainer>
  );
}
