import type { Plan, Subscription, User } from "@/lib/subscriptions";

export type UsersOpsTone = "neutral" | "positive" | "warning" | "danger";
export type UsersOpsPriority = "high" | "medium" | "low";
export type UsersOpsPeriodDays = 7 | 30 | 90;

export interface UsersOpsFilters {
  periodDays: UsersOpsPeriodDays;
  renewalWindowDays: number;
  planId: number | null;
  accessStatus: "all" | "active" | "blocked";
  subscriptionStatus: "all" | "active" | "trial" | "canceled" | "none";
  search: string;
  page: number;
  limit: number;
}

export interface UsersOpsMetric {
  id:
    | "active_users"
    | "new_users"
    | "recent_cancellations"
    | "trial_to_paid_conversion";
  label: string;
  value: number;
  formattedValue: string;
  description: string;
  periodLabel: string;
  tone: UsersOpsTone;
}

export type UsersOpsSummary = UsersOpsMetric[];

export interface UsersOpsPlanOption {
  planId: number;
  planName: string;
}

export interface UsersOpsSegment {
  id: string;
  type: "access" | "subscription" | "plan";
  label: string;
  value: number;
  description: string;
  tone: UsersOpsTone;
  filters: Partial<UsersOpsFilters>;
}

export interface UsersOpsListItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  activePlanName: string | null;
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
  lifecycleStage: string;
  lastActivityAt: string;
  lastActivityLabel: string;
  href: string;
}

export interface UsersOpsActionItem {
  id: string;
  type:
    | "renewal_due"
    | "recent_cancellation"
    | "user_without_plan"
    | "blocked_active_subscription"
    | "trial_ending";
  title: string;
  description: string;
  priority: UsersOpsPriority;
  relatedUserId: number;
  relatedPlanName: string | null;
  occurredAt: string;
  href: string;
  actionLabel: string;
}

export interface UsersOpsTimelineEvent {
  id: string;
  type:
    | "user_created"
    | "subscription_created"
    | "subscription_renewed"
    | "subscription_canceled"
    | "plan_changed"
    | "access_updated";
  title: string;
  description: string;
  occurredAt: string;
  relatedPlanName: string | null;
  tone: UsersOpsTone;
}

export interface UsersOpsSectionState {
  section: "summary" | "segments" | "list" | "actionQueue" | "timeline";
  status: "ready" | "empty" | "error";
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface UsersOpsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersOperationsDashboard {
  generatedAt: string;
  filters: UsersOpsFilters;
  availablePlans: UsersOpsPlanOption[];
  summary: UsersOpsMetric[];
  segments: UsersOpsSegment[];
  users: UsersOpsListItem[];
  actionQueue: UsersOpsActionItem[];
  pagination: UsersOpsPagination;
  sectionStates: UsersOpsSectionState[];
}

const periodOptions = [7, 30, 90] as const;
const priorityRank: Record<UsersOpsPriority, number> = {
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

export function normalizeUsersOpsFilters(input: Partial<Record<keyof UsersOpsFilters, unknown>> = {}): UsersOpsFilters {
  const periodRaw = parseOptionalNumber(input.periodDays);
  const periodDays = periodRaw === null ? 30 : periodRaw;

  if (!periodOptions.includes(periodDays as UsersOpsPeriodDays)) {
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
    throw new Error("Plano invalido para filtro de usuarios.");
  }

  const pageRaw = parseOptionalNumber(input.page);
  const page = pageRaw === null ? 1 : pageRaw;

  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Pagina invalida para usuarios.");
  }

  const limitRaw = parseOptionalNumber(input.limit);
  const limit = limitRaw === null ? 10 : limitRaw;

  if (!Number.isInteger(limit) || limit < 5 || limit > 50) {
    throw new Error("Limite invalido. Use um valor entre 5 e 50.");
  }

  const accessStatus = String(input.accessStatus ?? "all");
  const subscriptionStatus = String(input.subscriptionStatus ?? "all");

  if (!["all", "active", "blocked"].includes(accessStatus)) {
    throw new Error("Status de acesso invalido.");
  }

  if (!["all", "active", "trial", "canceled", "none"].includes(subscriptionStatus)) {
    throw new Error("Status de assinatura invalido.");
  }

  return {
    periodDays: periodDays as UsersOpsPeriodDays,
    renewalWindowDays,
    planId,
    accessStatus: accessStatus as UsersOpsFilters["accessStatus"],
    subscriptionStatus: subscriptionStatus as UsersOpsFilters["subscriptionStatus"],
    search: String(input.search ?? "").trim(),
    page,
    limit,
  };
}

export function formatUsersOpsPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "Sem base";
  }

  return `${Math.round(value)}%`;
}

export function daysUntilUsersOps(dateString: string, now = new Date()) {
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatRelativeDateForUsersOps(dateString: string, now = new Date()) {
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

export function getSubscriptionStatusBucket(subscription: Subscription | null | undefined, now = new Date()) {
  const status = subscription?.status?.toUpperCase() ?? "";

  if (!subscription) {
    return "none" as const;
  }

  if (status === "CANCELED" || subscription.canceledAt) {
    return "canceled" as const;
  }

  if (subscription.endDate && new Date(subscription.endDate).getTime() < now.getTime()) {
    return "canceled" as const;
  }

  if (status === "TRIAL") {
    return "trial" as const;
  }

  if (status === "ACTIVE") {
    return "active" as const;
  }

  return "none" as const;
}

export function isUsersOpsCommerciallyActive(subscription: Subscription | null | undefined, now = new Date()) {
  const status = getSubscriptionStatusBucket(subscription, now);
  return status === "active" || status === "trial";
}

export function isUsersOpsNearRenewal(subscription: Subscription | null | undefined, windowDays: number, now = new Date()) {
  if (!isUsersOpsCommerciallyActive(subscription, now) || !subscription?.endDate) {
    return false;
  }

  const daysLeft = daysUntilUsersOps(subscription.endDate, now);
  return daysLeft >= 0 && daysLeft <= windowDays;
}

export function getUserLastActivityAt(user: User) {
  const dates = [
    user.updatedAt,
    user.createdAt,
    ...user.subscriptions.flatMap((subscription) => [
      subscription.updatedAt,
      subscription.createdAt,
      subscription.canceledAt,
      subscription.googlePlayLinkedAt,
      subscription.googlePlayExpiresAt,
    ]),
  ].filter(Boolean) as string[];

  return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? user.createdAt;
}

export function getUserActivitySnapshot(user: User, now = new Date()) {
  const lastActivityAt = getUserLastActivityAt(user);

  return {
    lastActivityAt,
    lastActivityLabel: formatRelativeDateForUsersOps(lastActivityAt, now),
  };
}

export function getUserLifecycleStage(user: User, now = new Date()) {
  const bucket = getSubscriptionStatusBucket(user.activeSubscription, now);

  if (!user.isActive) {
    return "Acesso bloqueado";
  }

  if (bucket === "active") {
    return "Pagante ativo";
  }

  if (bucket === "trial") {
    return "Em trial";
  }

  if (bucket === "canceled") {
    return "Cancelado";
  }

  return "Sem plano";
}

export function sortUsersOpsActionItems<T extends { priority: UsersOpsPriority; occurredAt: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
  });
}

export function mapPlanOptions(plans: Plan[]): UsersOpsPlanOption[] {
  return plans.map((plan) => ({
    planId: plan.id,
    planName: plan.name,
  }));
}
