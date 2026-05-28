"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import {
  DashboardOperationalQueue,
  DashboardPlanDistribution,
  DashboardRecentEvents,
  DashboardSectionError,
  DashboardSummaryCards,
} from "@/components/dashboard";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import { fetchApi } from "@/lib/api/client";
import type { DashboardOperacional, DashboardSectionState } from "@/lib/dashboard";

function findSectionState(
  states: DashboardSectionState[],
  section: DashboardSectionState["section"],
) {
  return states.find((state) => state.section === section);
}

export default function Home() {
  const [data, setData] = useState<DashboardOperacional | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const dashboard = (await fetchApi("/admin/dashboard")) as DashboardOperacional;
        if (mounted) {
          setData(dashboard);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar dashboard operacional.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Montando dashboard operacional...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <ResponsiveContainer>
        <DashboardSectionError
          title="Dashboard indisponivel"
          message={error ?? "Nao foi possivel carregar os dados operacionais agora."}
        />
      </ResponsiveContainer>
    );
  }

  const generatedAt = new Date(data.generatedAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <ResponsiveContainer>
      <div className="space-y-6 animate-fade-in-up">
        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Painel operacional
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Saude do negocio em tempo de decisao
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Usuarios, assinaturas, receita estimada e proximas acoes em uma leitura unica.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <RefreshCw className="h-4 w-4" />
            Atualizado em {generatedAt}
          </div>
        </section>

        <DashboardSummaryCards
          metrics={data.summary}
          state={findSectionState(data.sectionStates, "summary")}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
          <DashboardPlanDistribution
            items={data.planDistribution}
            state={findSectionState(data.sectionStates, "planDistribution")}
          />
          <DashboardOperationalQueue items={data.operationalQueue} />
        </div>

        <DashboardRecentEvents
          events={data.recentEvents}
          state={findSectionState(data.sectionStates, "recentEvents")}
        />
      </div>
    </ResponsiveContainer>
  );
}
