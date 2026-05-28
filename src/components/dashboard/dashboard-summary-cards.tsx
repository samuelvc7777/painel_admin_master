import type { DashboardSectionState, OperationalMetric } from "@/lib/dashboard";

import { DashboardEmptyState } from "./dashboard-empty-state";
import { DashboardMetricCard } from "./dashboard-metric-card";

interface DashboardSummaryCardsProps {
  metrics: OperationalMetric[];
  state?: DashboardSectionState;
}

export function DashboardSummaryCards({ metrics, state }: DashboardSummaryCardsProps) {
  if (metrics.length === 0) {
    return (
      <DashboardEmptyState
        title={state?.title ?? "Resumo ainda sem dados"}
        message={state?.message ?? "Cadastre usuarios e planos para iniciar a leitura operacional do painel."}
        actionLabel={state?.actionLabel}
        actionHref={state?.actionHref}
      />
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric) => (
        <DashboardMetricCard key={metric.id} metric={metric} />
      ))}
    </section>
  );
}
