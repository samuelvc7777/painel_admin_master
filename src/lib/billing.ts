import type { Plan, Subscription } from "@/lib/subscriptions";

export type BillingTone = "neutral" | "positive" | "warning" | "danger";
export type BillingPriority = "high" | "medium" | "low";
export type BillingImpact = "positive" | "negative" | "neutral" | "warning";

export interface BillingFilters {
  periodDays: 7 | 30 | 90;
  renewalWindowDays: number;
  planId: number | null;
}

export interface BillingMetric {
  id:
    | "estimated_mrr"
    | "estimated_arr"
    | "paid_subscribers"
    | "trial_subscribers"
    | "new_subscriptions"
    | "cancellations"
    | "renewals_due";
  label: string;
  value: number;
  formattedValue: string;
  description: string;
  periodLabel: string;
  tone: BillingTone;
  href?: string;
}

export interface BillingPlanOption {
  planId: number;
  planName: string;
}

export interface BillingPlanBreakdown {
  planId: number;
  planName: string;
  planCode: string;
  isActive: boolean;
  paidSubscriberCount: number;
  trialSubscriberCount: number;
  estimatedMrrCents: number;
  sharePercent: number | null;
  newSubscriptionsCount: number;
  cancellationsCount: number;
  href: string;
}

export interface BillingEvent {
  id: string;
  type:
    | "subscription_created"
    | "subscription_renewed"
    | "subscription_canceled"
    | "plan_changed"
    | "renewal_due"
    | "data_issue";
  title: string;
  description: string;
  impact: BillingImpact;
  impactAmountCents: number | null;
  actorName: string | null;
  actorEmail: string | null;
  relatedUserId: number | null;
  relatedSubscriptionId: number | null;
  relatedPlanName: string | null;
  occurredAt: string;
  href: string;
}

export interface BillingActionItem {
  id: string;
  type:
    | "renewal_due"
    | "recent_cancellation"
    | "user_without_plan"
    | "billing_data_issue"
    | "plan_without_revenue";
  title: string;
  description: string;
  priority: BillingPriority;
  relatedUserId: number | null;
  relatedPlanName: string | null;
  occurredAt: string;
  href: string;
}

export interface BillingSectionState {
  section: "summary" | "planBreakdown" | "events" | "actionQueue";
  status: "ready" | "empty" | "error";
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface AdminBilling {
  generatedAt: string;
  filters: BillingFilters;
  availablePlans: BillingPlanOption[];
  summary: BillingMetric[];
  planBreakdown: BillingPlanBreakdown[];
  events: BillingEvent[];
  actionQueue: BillingActionItem[];
  sectionStates: BillingSectionState[];
}

const periodOptions = [7, 30, 90] as const;
const priorityRank: Record<BillingPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function parseOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function normalizeBillingFilters(input: Partial<Record<keyof BillingFilters, unknown>> = {}): BillingFilters {
  const periodRaw = parseOptionalNumber(input.periodDays);
  const periodDays = periodRaw === null ? 30 : periodRaw;

  if (!periodOptions.includes(periodDays as BillingFilters["periodDays"])) {
    throw new Error("Periodo invalido. Use 7, 30 ou 90 dias.");
  }

  const renewalRaw = parseOptionalNumber(input.renewalWindowDays);
  const renewalWindowDays = renewalRaw === null ? 7 : renewalRaw;

  if (!Number.isInteger(renewalWindowDays) || renewalWindowDays < 1 || renewalWindowDays > 90) {
    throw new Error("Janela de renovacao invalida. Use um valor entre 1 e 90 dias.");
  }

  const planRaw = parseOptionalNumber(input.planId);
  const planId = planRaw === null ? null : planRaw;

  if (planId !== null && (!Number.isInteger(planId) || planId <= 0)) {
    throw new Error("Plano invalido para filtro de faturamento.");
  }

  return {
    periodDays: periodDays as BillingFilters["periodDays"],
    renewalWindowDays,
    planId,
  };
}

export function formatCurrencyFromCentsForBilling(value: number) {
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatBillingPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "Sem base";
  }

  return `${Math.round(value)}%`;
}

export function normalizePlanMonthlyRevenueCents(plan: Pick<Plan, "priceCents" | "durationDays"> | null | undefined) {
  if (!plan || plan.priceCents <= 0 || plan.durationDays <= 0) {
    return 0;
  }

  return Math.round(plan.priceCents * (30 / plan.durationDays));
}

export function daysUntilBilling(dateString: string, now = new Date()) {
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatRelativeDateForBilling(dateString: string, now = new Date()) {
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "Agora";
  }

  if (diffMinutes < 60) {
    return `Ha ${diffMinutes} min`;
  }

  if (diffHours < 24) {
    return `Ha ${diffHours} h`;
  }

  if (diffDays < 7) {
    return `Ha ${diffDays} dia${diffDays === 1 ? "" : "s"}`;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function getBillingSubscriptionStatus(subscription: Subscription | null | undefined) {
  return subscription?.status?.toUpperCase() ?? "";
}

export function isBillingCanceled(subscription: Subscription | null | undefined) {
  return getBillingSubscriptionStatus(subscription) === "CANCELED" || Boolean(subscription?.canceledAt);
}

export function isBillingExpired(subscription: Subscription | null | undefined, now = new Date()) {
  if (!subscription?.endDate) {
    return false;
  }

  return new Date(subscription.endDate).getTime() < now.getTime();
}

export function isBillingTrial(subscription: Subscription | null | undefined, now = new Date()) {
  return (
    getBillingSubscriptionStatus(subscription) === "TRIAL" &&
    !isBillingCanceled(subscription) &&
    !isBillingExpired(subscription, now)
  );
}

export function isBillingPaidActive(subscription: Subscription | null | undefined, now = new Date()) {
  return (
    getBillingSubscriptionStatus(subscription) === "ACTIVE" &&
    !isBillingCanceled(subscription) &&
    !isBillingExpired(subscription, now) &&
    normalizePlanMonthlyRevenueCents(subscription?.plan) > 0
  );
}

export function isBillingCommerciallyActive(subscription: Subscription | null | undefined, now = new Date()) {
  return isBillingPaidActive(subscription, now) || isBillingTrial(subscription, now);
}

export function isBillingNearRenewal(subscription: Subscription | null | undefined, windowDays: number, now = new Date()) {
  if (!isBillingCommerciallyActive(subscription, now) || !subscription?.endDate) {
    return false;
  }

  const daysLeft = daysUntilBilling(subscription.endDate, now);
  return daysLeft >= 0 && daysLeft <= windowDays;
}

export function isReplacementPlanChange(subscription: Subscription, subscriptions: Subscription[], windowMs = 5 * 60 * 1000) {
  if (!subscription.canceledAt) {
    return false;
  }

  const canceledAt = new Date(subscription.canceledAt).getTime();

  return subscriptions.some((candidate) => {
    if (candidate.id === subscription.id) {
      return false;
    }

    const candidateTime = Math.min(
      new Date(candidate.createdAt).getTime(),
      new Date(candidate.startDate).getTime(),
    );

    return candidateTime >= canceledAt && candidateTime - canceledAt <= windowMs;
  });
}

export function findReplacementSubscription(subscription: Subscription, subscriptions: Subscription[], windowMs = 5 * 60 * 1000) {
  if (!subscription.canceledAt) {
    return null;
  }

  const canceledAt = new Date(subscription.canceledAt).getTime();

  return subscriptions.find((candidate) => {
    if (candidate.id === subscription.id) {
      return false;
    }

    const candidateTime = Math.min(
      new Date(candidate.createdAt).getTime(),
      new Date(candidate.startDate).getTime(),
    );

    return candidateTime >= canceledAt && candidateTime - canceledAt <= windowMs;
  }) ?? null;
}

export function sortBillingActionItems<T extends { priority: BillingPriority; occurredAt: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
  });
}
