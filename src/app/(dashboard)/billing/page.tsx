"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  BillingActionQueue,
  BillingEventsTimeline,
  BillingFilters,
  BillingPlanBreakdown,
  BillingSectionError,
  BillingSummaryCards,
} from "@/components/billing";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import { fetchApi } from "@/lib/api/client";
import type { AdminBilling, BillingFilters as BillingFiltersValue, BillingSectionState } from "@/lib/billing";

const defaultFilters: BillingFiltersValue = {
  periodDays: 30,
  renewalWindowDays: 7,
  planId: null,
};

function normalizePeriod(value: string | null): BillingFiltersValue["periodDays"] {
  const parsed = Number(value);
  return parsed === 7 || parsed === 30 || parsed === 90 ? parsed : defaultFilters.periodDays;
}

function normalizeRenewalWindow(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 90 ? parsed : defaultFilters.renewalWindowDays;
}

function normalizePlanId(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readFiltersFromLocation(): BillingFiltersValue {
  if (typeof window === "undefined") {
    return defaultFilters;
  }

  const params = new URLSearchParams(window.location.search);

  return {
    periodDays: normalizePeriod(params.get("periodDays")),
    renewalWindowDays: normalizeRenewalWindow(params.get("renewalWindowDays")),
    planId: normalizePlanId(params.get("planId")),
  };
}

function buildBillingEndpoint(filters: BillingFiltersValue) {
  const params = new URLSearchParams();
  params.set("periodDays", String(filters.periodDays));
  params.set("renewalWindowDays", String(filters.renewalWindowDays));

  if (filters.planId) {
    params.set("planId", String(filters.planId));
  }

  return `/admin/billing?${params.toString()}`;
}

function buildPageHref(filters: BillingFiltersValue) {
  const endpoint = buildBillingEndpoint(filters).replace("/admin/billing", "/billing");
  return endpoint === "/billing?" ? "/billing" : endpoint;
}

function findSectionState(states: BillingSectionState[], section: BillingSectionState["section"]) {
  return states.find((state) => state.section === section);
}

export default function BillingPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<BillingFiltersValue>(defaultFilters);
  const [data, setData] = useState<AdminBilling | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBilling = useCallback(async (nextFilters: BillingFiltersValue) => {
    setIsLoading(true);
    setError(null);

    try {
      const billing = (await fetchApi(buildBillingEndpoint(nextFilters))) as AdminBilling;
      setData(billing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar faturamento.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialFilters = readFiltersFromLocation();
    setFilters(initialFilters);
    void loadBilling(initialFilters);
  }, [loadBilling]);

  const handleFilterChange = useCallback(
    (partial: Partial<BillingFiltersValue>) => {
      const nextFilters = {
        ...filters,
        ...partial,
      };

      setFilters(nextFilters);
      router.replace(buildPageHref(nextFilters), { scroll: false });
      void loadBilling(nextFilters);
    },
    [filters, loadBilling, router],
  );

  const handleRefresh = useCallback(() => {
    void loadBilling(filters);
  }, [filters, loadBilling]);

  if (isLoading && !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Montando faturamento operacional...
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <ResponsiveContainer>
        <BillingSectionError
          title="Faturamento indisponivel"
          message={error}
        />
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
      <div className="space-y-6 animate-fade-in-up">
        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Faturamento operacional
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Receita, cancelamentos e assinaturas em leitura unica
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              MRR estimado, trials, novas assinaturas, cancelamentos reais e planos com impacto direto na operacao.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {generatedAt ? `Atualizado em ${generatedAt}` : "Atualizar"}
          </button>
        </section>

        <BillingFilters
          filters={filters}
          plans={data?.availablePlans ?? []}
          isLoading={isLoading}
          onChange={handleFilterChange}
        />

        {error && (
          <BillingSectionError
            title="Nao foi possivel atualizar todos os dados"
            message={error}
          />
        )}

        <BillingSummaryCards
          metrics={data?.summary ?? []}
          state={data ? findSectionState(data.sectionStates, "summary") : undefined}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
          <BillingPlanBreakdown
            items={data?.planBreakdown ?? []}
            state={data ? findSectionState(data.sectionStates, "planBreakdown") : undefined}
          />
          <BillingActionQueue
            items={data?.actionQueue ?? []}
            state={data ? findSectionState(data.sectionStates, "actionQueue") : undefined}
          />
        </div>

        <BillingEventsTimeline
          events={data?.events ?? []}
          state={data ? findSectionState(data.sectionStates, "events") : undefined}
        />
      </div>
    </ResponsiveContainer>
  );
}
