import type { Subscription } from "@/lib/subscriptions";

export type DashboardTone = "neutral" | "positive" | "warning" | "danger";
export type DashboardPriority = "high" | "medium" | "low";
export type DashboardSectionStatus = "ready" | "empty" | "error";

export interface DashboardPeriod {
  recentDays: number;
  renewalWindowDays: number;
}

export interface OperationalMetric {
  id: string;
  label: string;
  value: number | string;
  formattedValue: string;
  description: string;
  periodLabel?: string;
  tone: DashboardTone;
  href?: string;
}

export interface PlanDistributionItem {
  planId: number;
  planName: string;
  planCode: string;
  isActive: boolean;
  subscriberCount: number;
  estimatedRevenueCents: number;
  sharePercent: number;
  href: string;
}

export interface OperationalQueueItem {
  id: string;
  type:
    | "user_without_plan"
    | "renewal_due"
    | "recent_cancellation"
    | "unread_notification"
    | "inactive_user"
    | "other";
  title: string;
  description: string;
  priority: DashboardPriority;
  relatedUserId: number | null;
  relatedPlanName: string | null;
  occurredAt: string;
  href: string;
}

export interface RecentOperationalEvent {
  id: string;
  type:
    | "user_created"
    | "subscription_created"
    | "subscription_renewed"
    | "subscription_canceled";
  title: string;
  description: string;
  actorName: string | null;
  actorEmail: string | null;
  relatedUserId: number | null;
  relatedSubscriptionId: number | null;
  relatedPlanName: string | null;
  occurredAt: string;
  href: string;
}

export interface DashboardSectionState {
  section: "summary" | "planDistribution" | "operationalQueue" | "recentEvents";
  status: DashboardSectionStatus;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface DashboardOperacional {
  generatedAt: string;
  period: DashboardPeriod;
  summary: OperationalMetric[];
  planDistribution: PlanDistributionItem[];
  operationalQueue: OperationalQueueItem[];
  recentEvents: RecentOperationalEvent[];
  sectionStates: DashboardSectionState[];
}

const priorityRank: Record<DashboardPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function formatCurrencyFromCentsForDashboard(value: number) {
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function daysUntil(dateString: string, now = new Date()) {
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatRelativeDate(dateString: string, now = new Date()) {
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

export function sortByPriorityThenDate<T extends { priority: DashboardPriority; occurredAt: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
  });
}

export function getSubscriptionStatus(subscription: Subscription | null | undefined) {
  return subscription?.status?.toUpperCase() ?? "";
}

export function isActiveSubscription(subscription: Subscription | null | undefined) {
  return getSubscriptionStatus(subscription) === "ACTIVE";
}

export function isTrialSubscription(subscription: Subscription | null | undefined) {
  return getSubscriptionStatus(subscription) === "TRIAL";
}

export function isCommerciallyActiveSubscription(subscription: Subscription | null | undefined) {
  return isActiveSubscription(subscription) || isTrialSubscription(subscription);
}

export function isCanceledSubscription(subscription: Subscription | null | undefined) {
  return getSubscriptionStatus(subscription) === "CANCELED" || Boolean(subscription?.canceledAt);
}

export function isExpiredSubscription(subscription: Subscription | null | undefined, now = new Date()) {
  if (!subscription?.endDate) {
    return false;
  }

  return new Date(subscription.endDate).getTime() < now.getTime();
}

export function isSubscriptionNearRenewal(
  subscription: Subscription | null | undefined,
  windowDays: number,
  now = new Date(),
) {
  if (!isCommerciallyActiveSubscription(subscription) || !subscription?.endDate) {
    return false;
  }

  const daysLeft = daysUntil(subscription.endDate, now);
  return daysLeft >= 0 && daysLeft <= windowDays;
}
