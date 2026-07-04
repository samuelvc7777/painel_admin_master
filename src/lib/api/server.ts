import { createClient } from "@supabase/supabase-js";

import {
  daysUntilBilling,
  findReplacementSubscription,
  formatCurrencyFromCentsForBilling,
  isBillingCommerciallyActive,
  isBillingNearRenewal,
  isBillingPaidActive,
  isBillingTrial,
  isReplacementPlanChange,
  normalizeBillingFilters,
  normalizePlanMonthlyRevenueCents,
  sortBillingActionItems,
  type AdminBilling,
  type BillingActionItem,
  type BillingEvent,
  type BillingFilters,
  type BillingMetric,
  type BillingPlanBreakdown,
  type BillingSectionState,
} from "@/lib/billing";
import type {
  AdminNotification,
  AdminNotificationsResponse,
  AdminNotificationType,
} from "@/lib/notifications";
import {
  daysUntil,
  formatCurrencyFromCentsForDashboard,
  formatPercent,
  isActiveSubscription,
  isCommerciallyActiveSubscription,
  isSubscriptionNearRenewal,
  sortByPriorityThenDate,
  type DashboardOperacional,
  type DashboardSectionState,
  type OperationalMetric,
  type OperationalQueueItem,
  type PlanDistributionItem,
  type RecentOperationalEvent,
} from "@/lib/dashboard";
import type { HelpVideo, Plan, Subscription, User } from "@/lib/subscriptions";
import {
  daysUntilUsersOps,
  formatUsersOpsPercent,
  getSubscriptionStatusBucket,
  getUserActivitySnapshot,
  getUserLifecycleStage,
  isUsersOpsCommerciallyActive,
  isUsersOpsNearRenewal,
  mapPlanOptions,
  normalizeUsersOpsFilters,
  sortUsersOpsActionItems,
  type UsersOperationsDashboard,
  type UsersOpsActionItem,
  type UsersOpsFilters,
  type UsersOpsListItem,
  type UsersOpsMetric,
  type UsersOpsSectionState,
  type UsersOpsSegment,
  type UsersOpsTimelineEvent,
  type UsersOpsTone,
} from "@/lib/users-operations";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type UserRow = Omit<User, "activeSubscription" | "subscriptions">;
type SubscriptionRow = Omit<Subscription, "plan" | "payments"> & {
  userId: number;
  planId: number;
};
type GooglePlaySubscriptionEventRow = {
  id: number;
  purchaseToken: string | null;
  productId: string;
  notificationType: number;
  eventTime: string;
  createdAt: string;
};
type HelpVideoRow = {
  id: number;
  title: string;
  description: string | null;
  video_url: string;
  youtube_video_id: string;
  category: string | null;
  duration_label: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const TABLES = {
  users: "User",
  plans: "Plan",
  subscriptions: "Subscription",
  googlePlaySubscriptionEvents: "GooglePlaySubscriptionEvent",
  helpVideos: "videos",
  company: "Company",
} as const;

function createServerSupabase() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase server nao configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function assertNoError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

function isMissingGoogleApiKeyColumn(error: { message: string } | null) {
  return Boolean(error?.message.includes("Company.googleApiKey"));
}

function isAdminRole(role: string) {
  return role === "ADMIN" || role === "ATTENDANT";
}

function selectActiveSubscription(subscriptions: Subscription[]): Subscription | null {
  const active = subscriptions.find((subscription) =>
    ["ACTIVE", "TRIAL"].includes(subscription.status.toUpperCase()),
  );

  return active ?? subscriptions[0] ?? null;
}

async function getPlansById(planIds: number[]) {
  const uniqueIds = Array.from(new Set(planIds)).filter(Boolean);

  if (uniqueIds.length === 0) {
    return new Map<number, Plan>();
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.plans)
    .select("*")
    .in("id", uniqueIds);

  assertNoError(error);

  return new Map((data as Plan[]).map((plan) => [plan.id, plan]));
}

async function hydrateUsers(users: UserRow[]): Promise<User[]> {
  if (users.length === 0) {
    return [];
  }

  const supabase = createServerSupabase();
  const userIds = users.map((user) => user.id);
  const { data: subscriptionRows, error } = await supabase
    .from(TABLES.subscriptions)
    .select("*")
    .in("userId", userIds)
    .order("createdAt", { ascending: false });

  assertNoError(error);

  const subscriptions = (subscriptionRows ?? []) as SubscriptionRow[];
  const plansById = await getPlansById(subscriptions.map((subscription) => subscription.planId));
  const subscriptionsByUserId = new Map<number, Subscription[]>();

  for (const subscription of subscriptions) {
    const plan = plansById.get(subscription.planId);
    if (!plan) {
      continue;
    }

    const hydratedSubscription: Subscription = {
      ...subscription,
      plan,
      payments: [],
    };

    const current = subscriptionsByUserId.get(subscription.userId) ?? [];
    current.push(hydratedSubscription);
    subscriptionsByUserId.set(subscription.userId, current);
  }

  return users.map((user) => {
    const userSubscriptions = subscriptionsByUserId.get(user.id) ?? [];

    return {
      ...user,
      subscriptions: userSubscriptions,
      activeSubscription: selectActiveSubscription(userSubscriptions),
    };
  });
}

export async function requireAdminFromToken(token: string) {
  if (!token) {
    throw new Error("Token ausente.");
  }

  const supabase = createServerSupabase();
  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  assertNoError(authError);

  const email = authData.user?.email;
  if (!email) {
    throw new Error("Sessao do Supabase nao encontrada.");
  }

  const { data, error } = await supabase
    .from(TABLES.users)
    .select("*")
    .eq("email", email)
    .maybeSingle();

  assertNoError(error);

  if (!data) {
    throw new Error("Usuario autenticado no Supabase, mas sem perfil cadastrado na tabela User.");
  }

  const [user] = await hydrateUsers([data as UserRow]);

  if (!isAdminRole(user.role)) {
    throw new Error("Acesso negado: Este portal e restrito a administradores e atendentes.");
  }

  return user;
}

export async function listUsers() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.users)
    .select("*")
    .order("createdAt", { ascending: false });

  assertNoError(error);

  return hydrateUsers((data ?? []) as UserRow[]);
}

export async function getUserById(id: number) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.users)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  assertNoError(error);

  if (!data) {
    throw new Error("Usuario nao encontrado.");
  }

  const [user] = await hydrateUsers([data as UserRow]);
  return user;
}

export async function updateUser(id: number, payload: Partial<UserRow>) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.users)
    .update({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      companyPhone: payload.companyPhone,
      role: payload.role,
      isActive: payload.isActive,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  assertNoError(error);

  const [user] = await hydrateUsers([data as UserRow]);
  return user;
}

export async function deleteUser(id: number) {
  const supabase = createServerSupabase();
  const { error } = await supabase.from(TABLES.users).delete().eq("id", id);
  assertNoError(error);

  return { ok: true };
}

export async function listPlans() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.plans)
    .select("*")
    .order("priceCents", { ascending: true });

  assertNoError(error);

  return (data ?? []) as Plan[];
}

export async function createPlan(payload: Partial<Plan>) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.plans)
    .insert({
      code: normalizePlanCode(payload.code),
      name: payload.name,
      description: payload.description,
      priceCents: payload.priceCents,
      durationDays: payload.durationDays,
      color: payload.color,
      isActive: payload.isActive,
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  assertNoError(error);

  return data as Plan;
}

export async function updatePlan(id: number, payload: Partial<Plan>) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.plans)
    .update({
      code: normalizePlanCode(payload.code),
      name: payload.name,
      description: payload.description,
      priceCents: payload.priceCents,
      durationDays: payload.durationDays,
      color: payload.color,
      isActive: payload.isActive,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  assertNoError(error);

  return data as Plan;
}

function normalizePlanCode(code: string | undefined) {
  return code?.trim().toLowerCase() ?? '';
}

function buildSubscriptionNotification(
  type: Extract<
    AdminNotificationType,
    "SUBSCRIPTION_CREATED" | "SUBSCRIPTION_RENEWED" | "SUBSCRIPTION_CANCELED"
  >,
  user: User,
  subscription: Pick<Subscription, "id">,
  plan: Pick<Plan, "name">,
  occurredAt: string,
): AdminNotification {
  const titleByType = {
    SUBSCRIPTION_CREATED: "Nova assinatura",
    SUBSCRIPTION_RENEWED: "Assinatura renovada",
    SUBSCRIPTION_CANCELED: "Assinatura cancelada",
  } satisfies Record<typeof type, string>;

  const messageByType = {
    SUBSCRIPTION_CREATED: `${user.name} assinou o plano ${plan.name}.`,
    SUBSCRIPTION_RENEWED: `${user.name} renovou o plano ${plan.name}.`,
    SUBSCRIPTION_CANCELED: `${user.name} cancelou o plano ${plan.name}.`,
  } satisfies Record<typeof type, string>;

  return {
    id: `${type.toLowerCase()}:${subscription.id}:${occurredAt}`,
    type,
    title: titleByType[type],
    message: messageByType[type],
    eventKey: `${type.toLowerCase()}:${subscription.id}:${occurredAt}`,
    relatedUserId: user.id,
    relatedSubscriptionId: subscription.id,
    relatedPlanName: plan.name,
    actorName: user.name,
    actorEmail: user.email,
    occurredAt,
    readAt: null,
    createdAt: occurredAt,
  };
}

function buildPlayStoreCancellationNotification(
  event: GooglePlaySubscriptionEventRow,
  user: User,
  subscription: Subscription,
): AdminNotification {
  const occurredAt = event.eventTime || event.createdAt;

  return {
    id: `google-play-canceled:${event.id}`,
    type: "SUBSCRIPTION_CANCELED",
    title: "Assinatura cancelada",
    message: `${user.name} cancelou o plano ${subscription.plan.name} na Play Store.`,
    eventKey: `google-play-canceled:${event.id}`,
    relatedUserId: user.id,
    relatedSubscriptionId: subscription.id,
    relatedPlanName: subscription.plan.name,
    actorName: user.name,
    actorEmail: user.email,
    occurredAt,
    readAt: null,
    createdAt: event.createdAt,
  };
}

function buildUserCreatedNotification(user: User): AdminNotification {
  return {
    id: `user-created:${user.id}`,
    type: "USER_CREATED",
    title: "Novo usuario cadastrado",
    message: `${user.name} foi cadastrado no painel.`,
    eventKey: `user-created:${user.id}`,
    relatedUserId: user.id,
    relatedSubscriptionId: null,
    relatedPlanName: null,
    actorName: user.name,
    actorEmail: user.email,
    occurredAt: user.createdAt,
    readAt: null,
    createdAt: user.createdAt,
  };
}

async function listRecentGooglePlayCancellationEvents() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.googlePlaySubscriptionEvents)
    .select("id,purchaseToken,productId,notificationType,eventTime,createdAt")
    .in("notificationType", [3, 12])
    .order("createdAt", { ascending: false })
    .limit(50);

  assertNoError(error);

  return (data ?? []) as GooglePlaySubscriptionEventRow[];
}

function isReplacementCancellation(subscription: Subscription, subscriptions: Subscription[]) {
  if (!subscription.canceledAt) {
    return false;
  }

  const canceledAt = new Date(subscription.canceledAt).getTime();
  const replacementWindowMs = 5 * 60 * 1000;

  return subscriptions.some((candidate) => {
    if (candidate.id === subscription.id) {
      return false;
    }

    const createdAt = new Date(candidate.createdAt).getTime();
    const startDate = new Date(candidate.startDate).getTime();
    const replacementTime = Math.min(createdAt, startDate);

    return replacementTime >= canceledAt && replacementTime - canceledAt <= replacementWindowMs;
  });
}

export async function listAdminNotifications(options: { limit?: number } = {}): Promise<AdminNotificationsResponse> {
  const limit = Math.min(Math.max(Number(options.limit ?? 20), 1), 50);
  const [users, playCancellationEvents] = await Promise.all([
    listUsers(),
    listRecentGooglePlayCancellationEvents(),
  ]);
  const subscriptionsByPurchaseToken = new Map<string, { user: User; subscription: Subscription }>();

  for (const user of users) {
    for (const subscription of user.subscriptions) {
      if (subscription.googlePlayPurchaseToken) {
        subscriptionsByPurchaseToken.set(subscription.googlePlayPurchaseToken, { user, subscription });
      }
    }
  }

  const playStoreNotifications = playCancellationEvents.flatMap((event) => {
    if (!event.purchaseToken) {
      return [];
    }

    const match = subscriptionsByPurchaseToken.get(event.purchaseToken);
    if (!match) {
      return [];
    }

    return [buildPlayStoreCancellationNotification(event, match.user, match.subscription)];
  });

  const notifications = users.flatMap((user) => {
    const userNotifications: AdminNotification[] = [buildUserCreatedNotification(user)];

    for (const subscription of user.subscriptions) {
      userNotifications.push(
        buildSubscriptionNotification(
          "SUBSCRIPTION_CREATED",
          user,
          subscription,
          subscription.plan,
          subscription.createdAt,
        ),
      );

      if (subscription.canceledAt && !isReplacementCancellation(subscription, user.subscriptions)) {
        userNotifications.push(
          buildSubscriptionNotification(
            "SUBSCRIPTION_CANCELED",
            user,
            subscription,
            subscription.plan,
            subscription.canceledAt,
          ),
        );
      }

      if (
        ["ACTIVE", "TRIAL"].includes(subscription.status.toUpperCase()) &&
        subscription.updatedAt !== subscription.createdAt &&
        Math.abs(new Date(subscription.updatedAt).getTime() - new Date(subscription.startDate).getTime()) < 60_000
      ) {
        userNotifications.push(
          buildSubscriptionNotification(
            "SUBSCRIPTION_RENEWED",
            user,
            subscription,
            subscription.plan,
            subscription.updatedAt,
          ),
        );
      }
    }

    return userNotifications;
  }).concat(playStoreNotifications);

  const items = notifications
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit);

  return {
    items,
  };
}

function mapHelpVideo(row: HelpVideoRow): HelpVideo {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    videoUrl: row.video_url,
    youtubeVideoId: row.youtube_video_id,
    category: row.category ?? "",
    durationLabel: row.duration_label ?? "",
    thumbnailUrl: row.thumbnail_url ?? "",
    isFeatured: row.is_featured,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeYouTubeVideoId(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "";
  }

  try {
    const url = new URL(raw);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "").trim();
    }

    const watchId = url.searchParams.get("v");
    if (watchId) {
      return watchId.trim();
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const embedIndex = segments.indexOf("embed");
    if (embedIndex >= 0 && segments[embedIndex + 1]) {
      return segments[embedIndex + 1].trim();
    }
  } catch {
    return raw;
  }

  return raw;
}

function buildHelpVideoPayload(payload: Partial<HelpVideo>) {
  const title = String(payload.title ?? "").trim();
  const description = String(payload.description ?? "").trim();
  const youtubeVideoId = normalizeYouTubeVideoId(payload.youtubeVideoId);
  const videoUrl =
    String(payload.videoUrl ?? "").trim() ||
    `https://www.youtube.com/watch?v=${youtubeVideoId}`;

  if (!title) {
    throw new Error("Informe o titulo do video.");
  }

  if (!description) {
    throw new Error("Informe a descricao do video.");
  }

  if (!youtubeVideoId) {
    throw new Error("Informe o ID ou link do YouTube.");
  }

  return {
    title,
    description,
    video_url: videoUrl,
    youtube_video_id: youtubeVideoId,
    category: String(payload.category ?? "").trim(),
    duration_label: String(payload.durationLabel ?? "").trim(),
    thumbnail_url: String(payload.thumbnailUrl ?? "").trim(),
    is_featured: Boolean(payload.isFeatured),
    is_active: payload.isActive ?? true,
    sort_order: Number(payload.sortOrder ?? 0),
    updated_at: new Date().toISOString(),
  };
}

async function clearOtherFeaturedHelpVideos(currentVideoId: number) {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from(TABLES.helpVideos)
    .update({
      is_featured: false,
      updated_at: new Date().toISOString(),
    })
    .neq("id", currentVideoId)
    .eq("is_featured", true);

  assertNoError(error);
}

export async function listHelpVideos() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.helpVideos)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  assertNoError(error);

  return ((data ?? []) as HelpVideoRow[]).map(mapHelpVideo);
}

export async function createHelpVideo(payload: Partial<HelpVideo>) {
  const supabase = createServerSupabase();
  const normalizedPayload = buildHelpVideoPayload(payload);
  const { data, error } = await supabase
    .from(TABLES.helpVideos)
    .insert(normalizedPayload)
    .select()
    .single();

  assertNoError(error);

  if (normalizedPayload.is_featured) {
    await clearOtherFeaturedHelpVideos((data as HelpVideoRow).id);
  }

  return mapHelpVideo(data as HelpVideoRow);
}

export async function updateHelpVideo(id: number, payload: Partial<HelpVideo>) {
  const supabase = createServerSupabase();
  const normalizedPayload = buildHelpVideoPayload(payload);
  const { data, error } = await supabase
    .from(TABLES.helpVideos)
    .update(normalizedPayload)
    .eq("id", id)
    .select()
    .single();

  assertNoError(error);

  if (normalizedPayload.is_featured) {
    await clearOtherFeaturedHelpVideos(id);
  }

  return mapHelpVideo(data as HelpVideoRow);
}

export async function deleteHelpVideo(id: number) {
  const supabase = createServerSupabase();
  const { error } = await supabase.from(TABLES.helpVideos).delete().eq("id", id);
  assertNoError(error);

  return { ok: true };
}

export async function deletePlan(id: number) {
  const supabase = createServerSupabase();
  const { error } = await supabase.from(TABLES.plans).delete().eq("id", id);
  assertNoError(error);

  return { ok: true };
}

export async function changePlan(userId: number, planId: number) {
  const now = new Date();
  const plansById = await getPlansById([planId]);
  const plan = plansById.get(planId);

  if (!plan) {
    throw new Error("Plano nao encontrado.");
  }

  const supabase = createServerSupabase();
  const cancelCurrent = await supabase
    .from(TABLES.subscriptions)
    .update({
      status: "CANCELED",
      canceledAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
    .eq("userId", userId)
    .in("status", ["ACTIVE", "TRIAL"]);

  assertNoError(cancelCurrent.error);

  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + plan.durationDays);

  const { data, error } = await supabase
    .from(TABLES.subscriptions)
    .insert({
      userId,
      planId,
      status: "ACTIVE",
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: true,
      updatedAt: now.toISOString(),
    })
    .select()
    .single();

  assertNoError(error);

  return data;
}

export async function cancelSubscription(userId: number) {
  const now = new Date().toISOString();
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.subscriptions)
    .update({
      status: "CANCELED",
      canceledAt: now,
      updatedAt: now,
    })
    .eq("userId", userId)
    .in("status", ["ACTIVE", "TRIAL"])
    .select();

  assertNoError(error);

  return data;
}

export async function renewSubscription(userId: number, autoRenew?: boolean) {
  const user = await getUserById(userId);
  const subscription = user.activeSubscription;

  if (!subscription) {
    throw new Error("Usuario sem assinatura ativa para renovar.");
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + subscription.plan.durationDays);

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.subscriptions)
    .update({
      status: "ACTIVE",
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: autoRenew ?? subscription.autoRenew,
      updatedAt: now.toISOString(),
    })
    .eq("id", subscription.id)
    .select()
    .single();

  assertNoError(error);

  return data;
}

async function listDashboardNotifications() {
  try {
    return (await listAdminNotifications({ limit: 20 })).items;
  } catch {
    return [];
  }
}

type BillingSubscriptionRecord = {
  user: User;
  subscription: Subscription;
  plan: Plan;
};

function buildBillingHref(filters: BillingFilters, metric?: BillingMetric["id"]) {
  const params = new URLSearchParams();

  params.set("periodDays", String(filters.periodDays));
  params.set("renewalWindowDays", String(filters.renewalWindowDays));

  if (filters.planId) {
    params.set("planId", String(filters.planId));
  }

  if (metric) {
    params.set("metric", metric);
  }

  return `/billing?${params.toString()}`;
}

function buildBillingRecords(users: User[], filters: BillingFilters): BillingSubscriptionRecord[] {
  return users.flatMap((user) =>
    user.subscriptions
      .filter((subscription) => !filters.planId || subscription.plan.id === filters.planId)
      .map((subscription) => ({
        user,
        subscription,
        plan: subscription.plan,
      })),
  );
}

function countUniqueUsers(records: BillingSubscriptionRecord[]) {
  return new Set(records.map((record) => record.user.id)).size;
}

function isWithinPeriod(dateString: string | null | undefined, cutoff: Date, now: Date) {
  if (!dateString) {
    return false;
  }

  const date = new Date(dateString);
  return date >= cutoff && date <= now;
}

function isReplacementSubscriptionCreation(subscription: Subscription, subscriptions: Subscription[], windowMs = 5 * 60 * 1000) {
  const createdAt = Math.min(
    new Date(subscription.createdAt).getTime(),
    new Date(subscription.startDate).getTime(),
  );

  return subscriptions.some((candidate) => {
    if (candidate.id === subscription.id || !candidate.canceledAt) {
      return false;
    }

    const canceledAt = new Date(candidate.canceledAt).getTime();
    return createdAt >= canceledAt && createdAt - canceledAt <= windowMs;
  });
}

function buildBillingMetric(metric: Omit<BillingMetric, "href"> & { href?: string }, filters: BillingFilters): BillingMetric {
  return {
    ...metric,
    href: metric.href ?? buildBillingHref(filters, metric.id),
  };
}

function buildBillingSectionStates(
  users: User[],
  planBreakdown: BillingPlanBreakdown[],
  events: BillingEvent[],
  actionQueue: BillingActionItem[],
): BillingSectionState[] {
  return [
    {
      section: "summary",
      status: users.length > 0 ? "ready" : "empty",
      title: users.length > 0 ? "Resumo de faturamento" : "Ainda sem base para faturamento",
      message:
        users.length > 0
          ? "Indicadores calculados com assinaturas atuais, trials e cancelamentos recentes."
          : "Cadastre usuarios e planos para iniciar a leitura operacional de faturamento.",
      actionLabel: users.length > 0 ? undefined : "Ver usuarios",
      actionHref: users.length > 0 ? undefined : "/users",
    },
    {
      section: "planBreakdown",
      status: planBreakdown.length > 0 ? "ready" : "empty",
      title: planBreakdown.length > 0 ? "Receita por plano" : "Sem planos para analisar",
      message:
        planBreakdown.length > 0
          ? "Planos com assinantes, trials, novas assinaturas e cancelamentos do periodo."
          : "Crie ou ative planos para visualizar distribuicao de faturamento.",
      actionLabel: "Gerenciar planos",
      actionHref: "/plans",
    },
    {
      section: "events",
      status: events.length > 0 ? "ready" : "empty",
      title: events.length > 0 ? "Eventos de faturamento" : "Sem eventos no periodo",
      message:
        events.length > 0
          ? "Mudancas recentes que explicam crescimento, perda ou estabilidade da receita."
          : "Novas assinaturas, renovacoes, cancelamentos e trocas de plano aparecem aqui.",
    },
    {
      section: "actionQueue",
      status: actionQueue.length > 0 ? "ready" : "empty",
      title: actionQueue.length > 0 ? "Acoes prioritarias" : "Faturamento sem pendencias criticas",
      message:
        actionQueue.length > 0
          ? "Itens ordenados por prioridade e data para acompanhamento comercial."
          : "Nao ha renovacoes proximas, cancelamentos recentes ou inconsistencias exigindo acao.",
      actionLabel: "Ver usuarios",
      actionHref: "/users",
    },
  ];
}

export async function getAdminBilling(input: Partial<Record<keyof BillingFilters, unknown>> = {}): Promise<AdminBilling> {
  const filters = normalizeBillingFilters(input);
  const [users, plans] = await Promise.all([listUsers(), listPlans()]);
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - filters.periodDays);

  const records = buildBillingRecords(users, filters);
  const activePaidRecords = records.filter((record) =>
    record.user.isActive && isBillingPaidActive(record.subscription, now),
  );
  const trialRecords = records.filter((record) =>
    record.user.isActive && isBillingTrial(record.subscription, now),
  );
  const newSubscriptionRecords = records.filter((record) =>
    record.user.isActive &&
    isWithinPeriod(record.subscription.createdAt, cutoff, now) &&
    isBillingCommerciallyActive(record.subscription, now) &&
    !isReplacementSubscriptionCreation(record.subscription, record.user.subscriptions),
  );
  const cancellationRecords = records.filter((record) =>
    isWithinPeriod(record.subscription.canceledAt, cutoff, now) &&
    !isReplacementPlanChange(record.subscription, record.user.subscriptions),
  );
  const renewalRecords = records.filter((record) =>
    record.user.isActive && isBillingNearRenewal(record.subscription, filters.renewalWindowDays, now),
  );

  const estimatedMrrCents = activePaidRecords.reduce(
    (total, record) => total + normalizePlanMonthlyRevenueCents(record.plan),
    0,
  );

  const summary: BillingMetric[] = [
    buildBillingMetric(
      {
        id: "estimated_mrr",
        label: "MRR estimado",
        value: estimatedMrrCents,
        formattedValue: formatCurrencyFromCentsForBilling(estimatedMrrCents),
        description: "Assinaturas pagas ativas normalizadas para base mensal",
        periodLabel: "Agora",
        tone: estimatedMrrCents > 0 ? "positive" : "warning",
      },
      filters,
    ),
    buildBillingMetric(
      {
        id: "estimated_arr",
        label: "Receita anualizada",
        value: estimatedMrrCents * 12,
        formattedValue: formatCurrencyFromCentsForBilling(estimatedMrrCents * 12),
        description: "Projecao anual no ritmo atual",
        periodLabel: "12 meses",
        tone: estimatedMrrCents > 0 ? "positive" : "neutral",
      },
      filters,
    ),
    buildBillingMetric(
      {
        id: "paid_subscribers",
        label: "Assinantes pagos",
        value: countUniqueUsers(activePaidRecords),
        formattedValue: countUniqueUsers(activePaidRecords).toLocaleString("pt-BR"),
        description: "Usuarios ativos com assinatura paga vigente",
        periodLabel: "Agora",
        tone: activePaidRecords.length > 0 ? "positive" : "warning",
      },
      filters,
    ),
    buildBillingMetric(
      {
        id: "trial_subscribers",
        label: "Trials ativos",
        value: countUniqueUsers(trialRecords),
        formattedValue: countUniqueUsers(trialRecords).toLocaleString("pt-BR"),
        description: "Base comercial ativa ainda sem receita paga confirmada",
        periodLabel: "Agora",
        tone: trialRecords.length > 0 ? "neutral" : "neutral",
      },
      filters,
    ),
    buildBillingMetric(
      {
        id: "new_subscriptions",
        label: "Novas assinaturas",
        value: newSubscriptionRecords.length,
        formattedValue: newSubscriptionRecords.length.toLocaleString("pt-BR"),
        description: "Novos vinculos comerciais sem troca tecnica de plano",
        periodLabel: `${filters.periodDays} dias`,
        tone: newSubscriptionRecords.length > 0 ? "positive" : "neutral",
      },
      filters,
    ),
    buildBillingMetric(
      {
        id: "cancellations",
        label: "Cancelamentos",
        value: cancellationRecords.length,
        formattedValue: cancellationRecords.length.toLocaleString("pt-BR"),
        description: "Cancelamentos reais no periodo, sem substituicoes de plano",
        periodLabel: `${filters.periodDays} dias`,
        tone: cancellationRecords.length > 0 ? "danger" : "positive",
      },
      filters,
    ),
    buildBillingMetric(
      {
        id: "renewals_due",
        label: "Renovacoes proximas",
        value: renewalRecords.length,
        formattedValue: renewalRecords.length.toLocaleString("pt-BR"),
        description: "Assinaturas ativas vencendo na janela definida",
        periodLabel: `${filters.renewalWindowDays} dias`,
        tone: renewalRecords.length > 0 ? "warning" : "positive",
      },
      filters,
    ),
  ];

  const visiblePlans = plans.filter((plan) => !filters.planId || plan.id === filters.planId);
  const planBreakdown = visiblePlans
    .map((plan) => {
      const paid = activePaidRecords.filter((record) => record.plan.id === plan.id);
      const trials = trialRecords.filter((record) => record.plan.id === plan.id);
      const estimatedPlanMrrCents = paid.reduce(
        (total, record) => total + normalizePlanMonthlyRevenueCents(record.plan),
        0,
      );
      const newCount = newSubscriptionRecords.filter((record) => record.plan.id === plan.id).length;
      const cancellationCount = cancellationRecords.filter((record) => record.plan.id === plan.id).length;

      return {
        planId: plan.id,
        planName: plan.name,
        planCode: plan.code,
        isActive: plan.isActive,
        paidSubscriberCount: paid.length,
        trialSubscriberCount: trials.length,
        estimatedMrrCents: estimatedPlanMrrCents,
        sharePercent: estimatedMrrCents > 0 ? (estimatedPlanMrrCents / estimatedMrrCents) * 100 : null,
        newSubscriptionsCount: newCount,
        cancellationsCount: cancellationCount,
        href: `/plans/${plan.id}`,
      } satisfies BillingPlanBreakdown;
    })
    .filter((item) =>
      filters.planId ||
      item.isActive ||
      item.paidSubscriberCount > 0 ||
      item.trialSubscriberCount > 0 ||
      item.newSubscriptionsCount > 0 ||
      item.cancellationsCount > 0,
    )
    .sort((a, b) => b.estimatedMrrCents - a.estimatedMrrCents || b.paidSubscriberCount - a.paidSubscriberCount);

  const planChangeEvents: BillingEvent[] = records.flatMap((record) => {
    if (!isWithinPeriod(record.subscription.canceledAt, cutoff, now)) {
      return [];
    }

    const replacement = findReplacementSubscription(record.subscription, record.user.subscriptions);
    if (!replacement) {
      return [];
    }

    if (filters.planId && record.plan.id !== filters.planId && replacement.plan.id !== filters.planId) {
      return [];
    }

    const oldMrr = normalizePlanMonthlyRevenueCents(record.plan);
    const newMrr = normalizePlanMonthlyRevenueCents(replacement.plan);
    const delta = newMrr - oldMrr;

    return [
      {
        id: `plan_changed:${record.subscription.id}:${replacement.id}`,
        type: "plan_changed",
        title: delta > 0 ? "Upgrade de plano" : delta < 0 ? "Downgrade de plano" : "Troca de plano",
        description: `${record.user.name} mudou de ${record.plan.name} para ${replacement.plan.name}.`,
        impact: delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral",
        impactAmountCents: delta,
        actorName: record.user.name,
        actorEmail: record.user.email,
        relatedUserId: record.user.id,
        relatedSubscriptionId: replacement.id,
        relatedPlanName: `${record.plan.name} -> ${replacement.plan.name}`,
        occurredAt: replacement.createdAt,
        href: `/users/${record.user.id}`,
      },
    ] satisfies BillingEvent[];
  });

  const events: BillingEvent[] = [
    ...newSubscriptionRecords.map((record) => ({
      id: `subscription_created:${record.subscription.id}`,
      type: "subscription_created" as const,
      title: "Nova assinatura",
      description: `${record.user.name} assinou o plano ${record.plan.name}.`,
      impact: "positive" as const,
      impactAmountCents: isBillingPaidActive(record.subscription, now)
        ? normalizePlanMonthlyRevenueCents(record.plan)
        : null,
      actorName: record.user.name,
      actorEmail: record.user.email,
      relatedUserId: record.user.id,
      relatedSubscriptionId: record.subscription.id,
      relatedPlanName: record.plan.name,
      occurredAt: record.subscription.createdAt,
      href: `/users/${record.user.id}`,
    })),
    ...records
      .filter((record) =>
        isWithinPeriod(record.subscription.updatedAt, cutoff, now) &&
        record.subscription.updatedAt !== record.subscription.createdAt &&
        isBillingPaidActive(record.subscription, now) &&
        Math.abs(new Date(record.subscription.updatedAt).getTime() - new Date(record.subscription.startDate).getTime()) < 60_000,
      )
      .map((record) => ({
        id: `subscription_renewed:${record.subscription.id}:${record.subscription.updatedAt}`,
        type: "subscription_renewed" as const,
        title: "Assinatura renovada",
        description: `${record.user.name} renovou o plano ${record.plan.name}.`,
        impact: "positive" as const,
        impactAmountCents: normalizePlanMonthlyRevenueCents(record.plan),
        actorName: record.user.name,
        actorEmail: record.user.email,
        relatedUserId: record.user.id,
        relatedSubscriptionId: record.subscription.id,
        relatedPlanName: record.plan.name,
        occurredAt: record.subscription.updatedAt,
        href: `/users/${record.user.id}`,
      })),
    ...cancellationRecords.map((record) => ({
      id: `subscription_canceled:${record.subscription.id}:${record.subscription.canceledAt}`,
      type: "subscription_canceled" as const,
      title: "Assinatura cancelada",
      description: `${record.user.name} cancelou o plano ${record.plan.name}.`,
      impact: "negative" as const,
      impactAmountCents: -normalizePlanMonthlyRevenueCents(record.plan),
      actorName: record.user.name,
      actorEmail: record.user.email,
      relatedUserId: record.user.id,
      relatedSubscriptionId: record.subscription.id,
      relatedPlanName: record.plan.name,
      occurredAt: record.subscription.canceledAt ?? record.subscription.updatedAt,
      href: `/users/${record.user.id}`,
    })),
    ...planChangeEvents,
  ]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 12);

  const actionQueue: BillingActionItem[] = sortBillingActionItems([
    ...renewalRecords.map((record) => {
      const daysLeft = daysUntilBilling(record.subscription.endDate, now);

      return {
        id: `renewal_due:${record.subscription.id}`,
        type: "renewal_due" as const,
        title: daysLeft <= 2 ? "Renovacao critica" : "Renovacao proxima",
        description: `${record.user.name} tem ${record.plan.name} vencendo em ${daysLeft} dia${daysLeft === 1 ? "" : "s"}.`,
        priority: daysLeft <= 2 ? "high" as const : "medium" as const,
        relatedUserId: record.user.id,
        relatedPlanName: record.plan.name,
        occurredAt: record.subscription.endDate,
        href: `/users/${record.user.id}`,
      };
    }),
    ...cancellationRecords.slice(0, 6).map((record) => ({
      id: `recent_cancellation:${record.subscription.id}`,
      type: "recent_cancellation" as const,
      title: "Cancelamento recente",
      description: `${record.user.name} saiu do plano ${record.plan.name}.`,
      priority: "high" as const,
      relatedUserId: record.user.id,
      relatedPlanName: record.plan.name,
      occurredAt: record.subscription.canceledAt ?? record.subscription.updatedAt,
      href: `/users/${record.user.id}`,
    })),
    ...(!filters.planId
      ? users
          .filter((user) =>
            user.isActive && !user.subscriptions.some((subscription) => isBillingCommerciallyActive(subscription, now)),
          )
          .slice(0, 6)
          .map((user) => ({
            id: `user_without_plan:${user.id}`,
            type: "user_without_plan" as const,
            title: "Usuario ativo sem plano",
            description: `${user.name} esta ativo na base, mas sem assinatura comercial vigente.`,
            priority: "medium" as const,
            relatedUserId: user.id,
            relatedPlanName: null,
            occurredAt: user.createdAt,
            href: `/users/${user.id}`,
          }))
      : []),
    ...planBreakdown
      .filter((plan) => plan.isActive && plan.estimatedMrrCents === 0 && plan.paidSubscriberCount === 0)
      .slice(0, 4)
      .map((plan) => ({
        id: `plan_without_revenue:${plan.planId}`,
        type: "plan_without_revenue" as const,
        title: "Plano sem receita atual",
        description: `${plan.planName} esta ativo, mas nao possui assinantes pagos no recorte atual.`,
        priority: "low" as const,
        relatedUserId: null,
        relatedPlanName: plan.planName,
        occurredAt: now.toISOString(),
        href: plan.href,
      })),
  ]).slice(0, 10);

  return {
    generatedAt: now.toISOString(),
    filters,
    availablePlans: plans.map((plan) => ({
      planId: plan.id,
      planName: plan.name,
    })),
    summary,
    planBreakdown,
    events,
    actionQueue,
    sectionStates: buildBillingSectionStates(users, planBreakdown, events, actionQueue),
  };
}

type UsersOpsUserRecord = {
  user: User;
  subscriptionBucket: ReturnType<typeof getSubscriptionStatusBucket>;
  lastActivityAt: string;
  lastActivityLabel: string;
};

function buildUsersOpsMetric(metric: UsersOpsMetric): UsersOpsMetric {
  return metric;
}

function matchesUsersOpsFilters(record: UsersOpsUserRecord, filters: UsersOpsFilters) {
  const { user } = record;
  const normalizedSearch = filters.search.toLowerCase();

  if (filters.accessStatus === "active" && !user.isActive) {
    return false;
  }

  if (filters.accessStatus === "blocked" && user.isActive) {
    return false;
  }

  if (filters.subscriptionStatus !== "all" && record.subscriptionBucket !== filters.subscriptionStatus) {
    return false;
  }

  if (filters.planId && user.activeSubscription?.plan.id !== filters.planId) {
    return false;
  }

  if (normalizedSearch) {
    const searchable = `${user.name} ${user.email} ${user.phone ?? ""} ${user.role}`.toLowerCase();
    if (!searchable.includes(normalizedSearch)) {
      return false;
    }
  }

  return true;
}

function mapUsersOpsListItem(record: UsersOpsUserRecord): UsersOpsListItem {
  const { user } = record;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    activePlanName: user.activeSubscription?.plan.name ?? null,
    subscriptionStatus: user.activeSubscription?.status ?? null,
    subscriptionEndsAt: user.activeSubscription?.endDate ?? null,
    lifecycleStage: getUserLifecycleStage(user),
    lastActivityAt: record.lastActivityAt,
    lastActivityLabel: record.lastActivityLabel,
    href: `/users/${user.id}`,
  };
}

function buildUsersOpsSegments(records: UsersOpsUserRecord[], plans: Plan[]): UsersOpsSegment[] {
  const countByPlan = new Map<number, number>();

  for (const record of records) {
    const planId = record.user.activeSubscription?.plan.id;
    if (planId) {
      countByPlan.set(planId, (countByPlan.get(planId) ?? 0) + 1);
    }
  }

  const fixedSegments: UsersOpsSegment[] = [
    {
      id: "access-active",
      type: "access",
      label: "Acesso ativo",
      value: records.filter((record) => record.user.isActive).length,
      description: "Usuarios liberados para usar o app",
      tone: "positive",
      filters: { accessStatus: "active", page: 1 },
    },
    {
      id: "access-blocked",
      type: "access",
      label: "Bloqueados",
      value: records.filter((record) => !record.user.isActive).length,
      description: "Contas sem acesso operacional",
      tone: "danger",
      filters: { accessStatus: "blocked", page: 1 },
    },
    {
      id: "subscription-active",
      type: "subscription",
      label: "Pagantes",
      value: records.filter((record) => record.subscriptionBucket === "active").length,
      description: "Assinaturas pagas vigentes",
      tone: "positive",
      filters: { subscriptionStatus: "active", page: 1 },
    },
    {
      id: "subscription-trial",
      type: "subscription",
      label: "Trials",
      value: records.filter((record) => record.subscriptionBucket === "trial").length,
      description: "Usuarios em periodo de avaliacao",
      tone: "neutral",
      filters: { subscriptionStatus: "trial", page: 1 },
    },
  ];

  const planSegments = plans
    .map((plan) => ({
      id: `plan-${plan.id}`,
      type: "plan" as const,
      label: plan.name,
      value: countByPlan.get(plan.id) ?? 0,
      description: "Usuarios com este plano atual",
      tone: "neutral" as UsersOpsTone,
      filters: { planId: plan.id, page: 1 },
    }))
    .filter((segment) => segment.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return [...fixedSegments, ...planSegments];
}

function buildUsersOpsActionQueue(records: UsersOpsUserRecord[], filters: UsersOpsFilters, now: Date) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - filters.periodDays);

  const items: UsersOpsActionItem[] = [];

  for (const record of records) {
    const { user } = record;
    const activeSubscription = user.activeSubscription;

    if (!user.isActive && isUsersOpsCommerciallyActive(activeSubscription, now)) {
      items.push({
        id: `blocked-active-subscription:${user.id}`,
        type: "blocked_active_subscription",
        title: "Assinante com acesso bloqueado",
        description: `${user.name} possui assinatura comercial, mas o acesso esta bloqueado.`,
        priority: "high",
        relatedUserId: user.id,
        relatedPlanName: activeSubscription?.plan.name ?? null,
        occurredAt: user.updatedAt,
        href: `/users/${user.id}`,
        actionLabel: "Revisar acesso",
      });
    }

    if (user.isActive && record.subscriptionBucket === "none") {
      items.push({
        id: `user-without-plan:${user.id}`,
        type: "user_without_plan",
        title: "Usuario ativo sem plano",
        description: `${user.name} esta ativo, mas sem assinatura vigente.`,
        priority: "medium",
        relatedUserId: user.id,
        relatedPlanName: null,
        occurredAt: user.createdAt,
        href: `/users/${user.id}`,
        actionLabel: "Definir plano",
      });
    }

    if (activeSubscription && isUsersOpsNearRenewal(activeSubscription, filters.renewalWindowDays, now)) {
      const daysLeft = daysUntilUsersOps(activeSubscription.endDate, now);
      items.push({
        id: `renewal-due:${activeSubscription.id}`,
        type: activeSubscription.status.toUpperCase() === "TRIAL" && daysLeft <= 3 ? "trial_ending" : "renewal_due",
        title: daysLeft <= 2 ? "Vencimento critico" : "Assinatura vence em breve",
        description: `${user.name} tem ${activeSubscription.plan.name} vencendo em ${daysLeft} dia${daysLeft === 1 ? "" : "s"}.`,
        priority: daysLeft <= 2 ? "high" : "medium",
        relatedUserId: user.id,
        relatedPlanName: activeSubscription.plan.name,
        occurredAt: activeSubscription.endDate,
        href: `/users/${user.id}`,
        actionLabel: "Abrir usuario",
      });
    }

    for (const subscription of user.subscriptions) {
      if (
        subscription.canceledAt &&
        isWithinPeriod(subscription.canceledAt, cutoff, now) &&
        !isReplacementPlanChange(subscription, user.subscriptions)
      ) {
        items.push({
          id: `recent-cancellation:${subscription.id}:${subscription.canceledAt}`,
          type: "recent_cancellation",
          title: "Cancelamento recente",
          description: `${user.name} cancelou o plano ${subscription.plan.name}.`,
          priority: "high",
          relatedUserId: user.id,
          relatedPlanName: subscription.plan.name,
          occurredAt: subscription.canceledAt,
          href: `/users/${user.id}`,
          actionLabel: "Ver historico",
        });
      }
    }
  }

  return sortUsersOpsActionItems(
    Array.from(new Map(items.map((item) => [item.id, item])).values()),
  ).slice(0, 10);
}

function buildUsersOpsSectionStates(
  records: UsersOpsUserRecord[],
  paginatedUsers: UsersOpsListItem[],
  actionQueue: UsersOpsActionItem[],
): UsersOpsSectionState[] {
  return [
    {
      section: "summary",
      status: records.length > 0 ? "ready" : "empty",
      title: records.length > 0 ? "Resumo de usuarios" : "Sem usuarios no recorte",
      message:
        records.length > 0
          ? "Indicadores calculados com os filtros atuais."
          : "Ajuste filtros ou sincronize usuarios para montar a leitura operacional.",
    },
    {
      section: "segments",
      status: records.length > 0 ? "ready" : "empty",
      title: records.length > 0 ? "Segmentos operacionais" : "Sem segmentos disponiveis",
      message:
        records.length > 0
          ? "Segmentos usam o mesmo recorte da tela."
          : "Os segmentos aparecem quando houver usuarios no recorte.",
    },
    {
      section: "list",
      status: paginatedUsers.length > 0 ? "ready" : "empty",
      title: paginatedUsers.length > 0 ? "Lista operacional" : "Nenhum usuario encontrado",
      message:
        paginatedUsers.length > 0
          ? "Usuarios ordenados por atividade recente."
          : "Nenhum usuario atende aos filtros atuais.",
      actionLabel: "Limpar filtros",
      actionHref: "/users",
    },
    {
      section: "actionQueue",
      status: actionQueue.length > 0 ? "ready" : "empty",
      title: actionQueue.length > 0 ? "Fila prioritaria" : "Operacao em dia",
      message:
        actionQueue.length > 0
          ? "Itens ordenados por prioridade e data."
          : "Nao ha usuarios exigindo acao imediata nesse recorte.",
    },
  ];
}

function buildUsersOpsTimeline(user: User): UsersOpsTimelineEvent[] {
  const events: UsersOpsTimelineEvent[] = [
    {
      id: `user-created:${user.id}`,
      type: "user_created",
      title: "Usuario cadastrado",
      description: `${user.name} entrou na base administrativa.`,
      occurredAt: user.createdAt,
      relatedPlanName: null,
      tone: "neutral",
    },
  ];

  if (user.updatedAt !== user.createdAt) {
    events.push({
      id: `access-updated:${user.id}:${user.updatedAt}`,
      type: "access_updated",
      title: user.isActive ? "Acesso ativo" : "Acesso bloqueado",
      description: user.isActive ? "Conta liberada para uso." : "Conta bloqueada administrativamente.",
      occurredAt: user.updatedAt,
      relatedPlanName: null,
      tone: user.isActive ? "positive" : "danger",
    });
  }

  for (const subscription of user.subscriptions) {
    const replacement = findReplacementSubscription(subscription, user.subscriptions);

    if (replacement) {
      events.push({
        id: `plan-changed:${subscription.id}:${replacement.id}`,
        type: "plan_changed",
        title: "Troca de plano",
        description: `${user.name} mudou de ${subscription.plan.name} para ${replacement.plan.name}.`,
        occurredAt: replacement.createdAt,
        relatedPlanName: `${subscription.plan.name} -> ${replacement.plan.name}`,
        tone: "neutral",
      });
    } else {
      events.push({
        id: `subscription-created:${subscription.id}`,
        type: "subscription_created",
        title: subscription.status.toUpperCase() === "TRIAL" ? "Trial iniciado" : "Assinatura criada",
        description: `${user.name} iniciou o plano ${subscription.plan.name}.`,
        occurredAt: subscription.createdAt,
        relatedPlanName: subscription.plan.name,
        tone: subscription.status.toUpperCase() === "TRIAL" ? "neutral" : "positive",
      });
    }

    if (subscription.canceledAt && !isReplacementPlanChange(subscription, user.subscriptions)) {
      events.push({
        id: `subscription-canceled:${subscription.id}:${subscription.canceledAt}`,
        type: "subscription_canceled",
        title: "Assinatura cancelada",
        description: `${user.name} cancelou o plano ${subscription.plan.name}.`,
        occurredAt: subscription.canceledAt,
        relatedPlanName: subscription.plan.name,
        tone: "danger",
      });
    }

    if (
      ["ACTIVE", "TRIAL"].includes(subscription.status.toUpperCase()) &&
      subscription.updatedAt !== subscription.createdAt &&
      Math.abs(new Date(subscription.updatedAt).getTime() - new Date(subscription.startDate).getTime()) < 60_000
    ) {
      events.push({
        id: `subscription-renewed:${subscription.id}:${subscription.updatedAt}`,
        type: "subscription_renewed",
        title: "Assinatura renovada",
        description: `${user.name} renovou o plano ${subscription.plan.name}.`,
        occurredAt: subscription.updatedAt,
        relatedPlanName: subscription.plan.name,
        tone: "positive",
      });
    }
  }

  return Array.from(new Map(events.map((event) => [event.id, event])).values())
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 20);
}

export async function getUsersOperations(input: Partial<Record<keyof UsersOpsFilters, unknown>> = {}): Promise<UsersOperationsDashboard> {
  const filters = normalizeUsersOpsFilters(input);
  const [users, plans] = await Promise.all([listUsers(), listPlans()]);
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - filters.periodDays);

  const allRecords = users.map((user) => {
    const activity = getUserActivitySnapshot(user, now);

    return {
      user,
      subscriptionBucket: getSubscriptionStatusBucket(user.activeSubscription, now),
      lastActivityAt: activity.lastActivityAt,
      lastActivityLabel: activity.lastActivityLabel,
    } satisfies UsersOpsUserRecord;
  });

  const filteredRecords = allRecords
    .filter((record) => matchesUsersOpsFilters(record, filters))
    .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());

  const activeUsers = filteredRecords.filter((record) => record.user.isActive);
  const newUsers = filteredRecords.filter((record) => isWithinPeriod(record.user.createdAt, cutoff, now));
  const recentCancellations = filteredRecords.filter((record) =>
    record.user.subscriptions.some((subscription) =>
      isWithinPeriod(subscription.canceledAt, cutoff, now) &&
      !isReplacementPlanChange(subscription, record.user.subscriptions),
    ),
  );
  const usersWithTrialInPeriod = filteredRecords.filter((record) =>
    record.user.subscriptions.some((subscription) =>
      subscription.status.toUpperCase() === "TRIAL" && isWithinPeriod(subscription.createdAt, cutoff, now),
    ),
  );
  const paidAfterTrial = usersWithTrialInPeriod.filter((record) =>
    record.user.subscriptions.some((subscription) => subscription.status.toUpperCase() === "ACTIVE"),
  );
  const conversionRate =
    usersWithTrialInPeriod.length > 0 ? (paidAfterTrial.length / usersWithTrialInPeriod.length) * 100 : null;

  const summary: UsersOpsMetric[] = [
    buildUsersOpsMetric({
      id: "active_users",
      label: "Usuarios ativos",
      value: activeUsers.length,
      formattedValue: activeUsers.length.toLocaleString("pt-BR"),
      description: filteredRecords.length > 0 ? `${formatUsersOpsPercent((activeUsers.length / filteredRecords.length) * 100)} da base filtrada` : "Sem base no recorte",
      periodLabel: "Agora",
      tone: activeUsers.length > 0 ? "positive" : "warning",
    }),
    buildUsersOpsMetric({
      id: "new_users",
      label: "Novos usuarios",
      value: newUsers.length,
      formattedValue: newUsers.length.toLocaleString("pt-BR"),
      description: "Cadastros dentro do periodo selecionado",
      periodLabel: `${filters.periodDays} dias`,
      tone: newUsers.length > 0 ? "positive" : "neutral",
    }),
    buildUsersOpsMetric({
      id: "recent_cancellations",
      label: "Cancelados recentes",
      value: recentCancellations.length,
      formattedValue: recentCancellations.length.toLocaleString("pt-BR"),
      description: "Cancelamentos reais, sem trocas tecnicas de plano",
      periodLabel: `${filters.periodDays} dias`,
      tone: recentCancellations.length > 0 ? "danger" : "positive",
    }),
    buildUsersOpsMetric({
      id: "trial_to_paid_conversion",
      label: "Trial para pago",
      value: Math.round(conversionRate ?? 0),
      formattedValue: formatUsersOpsPercent(conversionRate),
      description: `${paidAfterTrial.length} de ${usersWithTrialInPeriod.length} trials viraram assinatura paga`,
      periodLabel: `${filters.periodDays} dias`,
      tone: conversionRate === null ? "neutral" : conversionRate >= 40 ? "positive" : "warning",
    }),
  ];

  const startIndex = (filters.page - 1) * filters.limit;
  const paginatedUsers = filteredRecords.slice(startIndex, startIndex + filters.limit).map(mapUsersOpsListItem);
  const actionQueue = buildUsersOpsActionQueue(filteredRecords, filters, now);

  return {
    generatedAt: now.toISOString(),
    filters,
    availablePlans: mapPlanOptions(plans),
    summary,
    segments: buildUsersOpsSegments(filteredRecords, plans),
    users: paginatedUsers,
    actionQueue,
    pagination: {
      total: filteredRecords.length,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.max(1, Math.ceil(filteredRecords.length / filters.limit)),
    },
    sectionStates: buildUsersOpsSectionStates(filteredRecords, paginatedUsers, actionQueue),
  };
}

export async function getUserOperationsTimeline(userId: number) {
  const user = await getUserById(userId);
  const events = buildUsersOpsTimeline(user);

  return {
    userId,
    generatedAt: new Date().toISOString(),
    events,
    sectionState: {
      section: "timeline",
      status: events.length > 0 ? "ready" : "empty",
      title: events.length > 0 ? "Timeline operacional" : "Sem eventos operacionais",
      message:
        events.length > 0
          ? "Eventos relevantes derivados de cadastro, acesso e assinaturas."
          : "Cadastros, assinaturas, cancelamentos e renovacoes aparecem aqui quando existirem.",
    } satisfies UsersOpsSectionState,
  };
}

function buildPlanDistribution(users: User[]): PlanDistributionItem[] {
  const activeSubscribers = users.filter((user) =>
    user.isActive && isCommerciallyActiveSubscription(user.activeSubscription) && user.activeSubscription?.plan,
  );
  const activePaidSubscribers = activeSubscribers.filter((user) => isActiveSubscription(user.activeSubscription));
  const estimatedRevenueCents = activePaidSubscribers.reduce(
    (total, user) => total + (user.activeSubscription?.plan.priceCents ?? 0),
    0,
  );
  const distribution = activeSubscribers.reduce<Record<number, PlanDistributionItem>>((acc, user) => {
    const subscription = user.activeSubscription;
    const plan = subscription?.plan;

    if (!subscription || !plan) {
      return acc;
    }

    const current = acc[plan.id] ?? {
      planId: plan.id,
      planName: plan.name,
      planCode: plan.code,
      isActive: plan.isActive,
      subscriberCount: 0,
      estimatedRevenueCents: 0,
      sharePercent: 0,
      href: `/plans/${plan.id}`,
    };

    current.subscriberCount += 1;
    if (isActiveSubscription(subscription)) {
      current.estimatedRevenueCents += plan.priceCents;
    }

    acc[plan.id] = current;
    return acc;
  }, {});

  return Object.values(distribution)
    .map((item) => ({
      ...item,
      sharePercent: estimatedRevenueCents > 0 ? (item.estimatedRevenueCents / estimatedRevenueCents) * 100 : 0,
    }))
    .sort((a, b) => b.estimatedRevenueCents - a.estimatedRevenueCents);
}

function mapNotificationToRecentEvent(notification: AdminNotification): RecentOperationalEvent {
  const typeByNotification: Record<AdminNotificationType, RecentOperationalEvent["type"]> = {
    SUBSCRIPTION_CREATED: "subscription_created",
    SUBSCRIPTION_RENEWED: "subscription_renewed",
    SUBSCRIPTION_CANCELED: "subscription_canceled",
    USER_CREATED: "user_created",
  };

  return {
    id: notification.id,
    type: typeByNotification[notification.type],
    title: notification.title,
    description: notification.message,
    actorName: notification.actorName,
    actorEmail: notification.actorEmail,
    relatedUserId: notification.relatedUserId,
    relatedSubscriptionId: notification.relatedSubscriptionId,
    relatedPlanName: notification.relatedPlanName,
    occurredAt: notification.occurredAt,
    href: notification.relatedUserId ? `/users/${notification.relatedUserId}` : "/users",
  };
}

function buildOperationalQueue(users: User[], notifications: AdminNotification[], renewalWindowDays: number) {
  const now = new Date();
  const recentCutoff = new Date(now);
  recentCutoff.setDate(recentCutoff.getDate() - 7);
  const queue: OperationalQueueItem[] = [];

  for (const user of users) {
    if (user.isActive && !isCommerciallyActiveSubscription(user.activeSubscription)) {
      const isRecent = new Date(user.createdAt) >= recentCutoff;
      queue.push({
        id: `user-without-plan:${user.id}`,
        type: "user_without_plan",
        title: isRecent ? "Novo usuario sem plano" : "Usuario sem plano ativo",
        description: `${user.name} esta na base sem assinatura ativa para acompanhamento comercial.`,
        priority: isRecent ? "medium" : "low",
        relatedUserId: user.id,
        relatedPlanName: null,
        occurredAt: user.createdAt,
        href: `/users/${user.id}`,
      });
    }

    const activeSubscription = user.activeSubscription;
    if (isSubscriptionNearRenewal(activeSubscription, renewalWindowDays, now) && activeSubscription) {
      const daysLeft = daysUntil(activeSubscription.endDate, now);
      queue.push({
        id: `renewal-due:${activeSubscription.id}`,
        type: "renewal_due",
        title: daysLeft <= 2 ? "Renovacao critica" : "Assinatura vence em breve",
        description: `${user.name} tem ${activeSubscription.plan.name} vencendo em ${daysLeft} dia${daysLeft === 1 ? "" : "s"}.`,
        priority: daysLeft <= 2 ? "high" : "medium",
        relatedUserId: user.id,
        relatedPlanName: activeSubscription.plan.name,
        occurredAt: activeSubscription.endDate,
        href: `/users/${user.id}`,
      });
    }

    for (const subscription of user.subscriptions) {
      if (subscription.canceledAt && new Date(subscription.canceledAt) >= recentCutoff) {
        queue.push({
          id: `recent-cancellation:${subscription.id}:${subscription.canceledAt}`,
          type: "recent_cancellation",
          title: "Cancelamento recente",
          description: `${user.name} cancelou o plano ${subscription.plan.name}.`,
          priority: "high",
          relatedUserId: user.id,
          relatedPlanName: subscription.plan.name,
          occurredAt: subscription.canceledAt,
          href: `/users/${user.id}`,
        });
      }
    }
  }

  for (const notification of notifications.filter((item) => item.type === "SUBSCRIPTION_CANCELED").slice(0, 3)) {
    queue.push({
      id: `notification:${notification.eventKey}`,
      type: "unread_notification",
      title: notification.title,
      description: notification.message,
      priority: "high",
      relatedUserId: notification.relatedUserId,
      relatedPlanName: notification.relatedPlanName,
      occurredAt: notification.occurredAt,
      href: notification.relatedUserId ? `/users/${notification.relatedUserId}` : "/billing",
    });
  }

  const deduped = Array.from(new Map(queue.map((item) => [item.id, item])).values());
  return sortByPriorityThenDate(deduped).slice(0, 8);
}

function buildSectionStates(
  users: User[],
  planDistribution: PlanDistributionItem[],
  operationalQueue: OperationalQueueItem[],
  recentEvents: RecentOperationalEvent[],
): DashboardSectionState[] {
  return [
    {
      section: "summary",
      status: users.length > 0 ? "ready" : "empty",
      title: users.length > 0 ? "Resumo operacional" : "Ainda sem usuarios cadastrados",
      message:
        users.length > 0
          ? "Indicadores calculados com a base administrativa atual."
          : "Cadastre ou sincronize usuarios para comecar a leitura operacional.",
      actionLabel: users.length > 0 ? undefined : "Ver usuarios",
      actionHref: users.length > 0 ? undefined : "/users",
    },
    {
      section: "planDistribution",
      status: planDistribution.length > 0 ? "ready" : "empty",
      title: planDistribution.length > 0 ? "Receita por plano" : "Sem assinaturas ativas por plano",
      message:
        planDistribution.length > 0
          ? "Distribuicao calculada com assinaturas ativas e trials identificados."
          : "Quando houver assinantes ativos, a distribuicao de receita estimada aparece aqui.",
      actionLabel: "Gerenciar planos",
      actionHref: "/plans",
    },
    {
      section: "operationalQueue",
      status: operationalQueue.length > 0 ? "ready" : "empty",
      title: operationalQueue.length > 0 ? "Proximas acoes" : "Operacao em dia",
      message:
        operationalQueue.length > 0
          ? "Pendencias ordenadas por prioridade e data."
          : "Nao ha pendencias criticas com os dados atuais.",
      actionLabel: "Ver usuarios",
      actionHref: "/users",
    },
    {
      section: "recentEvents",
      status: recentEvents.length > 0 ? "ready" : "empty",
      title: recentEvents.length > 0 ? "Eventos recentes" : "Sem eventos recentes",
      message:
        recentEvents.length > 0
          ? "Eventos recentes derivados de cadastros, assinaturas e notificacoes."
          : "Novos cadastros, assinaturas e cancelamentos aparecem aqui quando existirem.",
      actionLabel: "Ver notificacoes",
      actionHref: "/",
    },
  ];
}

export async function getDashboard(): Promise<DashboardOperacional> {
  const [users, notifications] = await Promise.all([
    listUsers(),
    listDashboardNotifications(),
  ]);
  const now = new Date();
  const recentDays = 7;
  const renewalWindowDays = 7;
  const recentCutoff = new Date(now);
  recentCutoff.setDate(recentCutoff.getDate() - recentDays);

  const activeUsers = users.filter((user) => user.isActive);
  const activeSubscribers = users.filter((user) =>
    user.isActive && isCommerciallyActiveSubscription(user.activeSubscription),
  );
  const paidSubscribers = users.filter((user) => user.isActive && isActiveSubscription(user.activeSubscription));
  const newUsers = users.filter((user) => new Date(user.createdAt) >= recentCutoff);
  const estimatedMrrCents = paidSubscribers.reduce(
    (total, user) => total + (user.activeSubscription?.plan.priceCents ?? 0),
    0,
  );

  const summary: OperationalMetric[] = [
    {
      id: "total_users",
      label: "Usuarios totais",
      value: users.length,
      formattedValue: users.length.toLocaleString("pt-BR"),
      description: "Base administrativa cadastrada",
      periodLabel: "Agora",
      tone: "neutral",
      href: "/users",
    },
    {
      id: "active_users",
      label: "Usuarios ativos",
      value: activeUsers.length,
      formattedValue: activeUsers.length.toLocaleString("pt-BR"),
      description: users.length > 0 ? `${formatPercent((activeUsers.length / users.length) * 100)} da base` : "Sem base suficiente",
      periodLabel: "Agora",
      tone: activeUsers.length > 0 ? "positive" : "warning",
      href: "/users",
    },
    {
      id: "active_subscribers",
      label: "Assinantes ativos",
      value: activeSubscribers.length,
      formattedValue: activeSubscribers.length.toLocaleString("pt-BR"),
      description: users.length > 0 ? `${formatPercent((activeSubscribers.length / users.length) * 100)} dos usuarios` : "Sem base suficiente",
      periodLabel: "Ativos e trials",
      tone: activeSubscribers.length > 0 ? "positive" : "warning",
      href: "/billing",
    },
    {
      id: "new_users",
      label: "Novos usuarios",
      value: newUsers.length,
      formattedValue: newUsers.length.toLocaleString("pt-BR"),
      description: `Cadastros nos ultimos ${recentDays} dias`,
      periodLabel: `${recentDays} dias`,
      tone: newUsers.length > 0 ? "positive" : "neutral",
      href: "/users",
    },
    {
      id: "estimated_mrr",
      label: "Receita mensal estimada",
      value: estimatedMrrCents,
      formattedValue: formatCurrencyFromCentsForDashboard(estimatedMrrCents),
      description: "Baseada em assinaturas pagas ativas",
      periodLabel: "MRR estimado",
      tone: estimatedMrrCents > 0 ? "positive" : "warning",
      href: "/billing",
    },
  ];

  const planDistribution = buildPlanDistribution(users);
  const recentEvents = notifications
    .map(mapNotificationToRecentEvent)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 8);
  const operationalQueue = buildOperationalQueue(users, notifications, renewalWindowDays);
  const sectionStates = buildSectionStates(users, planDistribution, operationalQueue, recentEvents);

  return {
    generatedAt: now.toISOString(),
    period: {
      recentDays,
      renewalWindowDays,
    },
    summary,
    planDistribution,
    operationalQueue,
    recentEvents,
    sectionStates,
  };
}

export type CompanySettings = {
  id: number;
  supportPhone: string | null;
  googleApiKey: string | null;
  referralSettings: ReferralSettings;
  updatedAt?: string;
};

export type ReferralSettings = {
  enabled: boolean;
  showEntryPoint: boolean;
  showRegisterInput: boolean;
  rewardCents: number;
  minimumWithdrawalCents: number;
  requiresPaidSubscription: boolean;
};

const defaultReferralSettings: ReferralSettings = {
  enabled: true,
  showEntryPoint: true,
  showRegisterInput: true,
  rewardCents: 500,
  minimumWithdrawalCents: 2500,
  requiresPaidSubscription: true,
};

function normalizeReferralSettings(value: unknown): ReferralSettings {
  const source = typeof value === "object" && value !== null ? value as Record<string, unknown> : {};

  return {
    enabled: typeof source.enabled === "boolean" ? source.enabled : defaultReferralSettings.enabled,
    showEntryPoint: typeof source.showEntryPoint === "boolean" ? source.showEntryPoint : defaultReferralSettings.showEntryPoint,
    showRegisterInput: typeof source.showRegisterInput === "boolean" ? source.showRegisterInput : defaultReferralSettings.showRegisterInput,
    rewardCents: normalizePositiveInt(source.rewardCents, defaultReferralSettings.rewardCents),
    minimumWithdrawalCents: normalizePositiveInt(source.minimumWithdrawalCents, defaultReferralSettings.minimumWithdrawalCents),
    requiresPaidSubscription: typeof source.requiresPaidSubscription === "boolean" ? source.requiresPaidSubscription : defaultReferralSettings.requiresPaidSubscription,
  };
}

function normalizePositiveInt(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.round(parsed);
}

export async function getCompanySettings() {
  const supabase = createServerSupabase();

  const baseResult = await supabase
    .from(TABLES.company)
    .select("id,supportPhone,updatedAt")
    .eq("id", 1)
    .maybeSingle();

  assertNoError(baseResult.error);

  if (!baseResult.data) {
    return {
      id: 1,
      supportPhone: null,
      googleApiKey: null,
      referralSettings: defaultReferralSettings,
    } satisfies CompanySettings;
  }

  const googleApiResult = await supabase
    .from(TABLES.company)
    .select("googleApiKey")
    .eq("id", 1)
    .maybeSingle();

  if (isMissingGoogleApiKeyColumn(googleApiResult.error)) {
    return {
      ...(baseResult.data as Omit<CompanySettings, "googleApiKey">),
      googleApiKey: null,
      referralSettings: defaultReferralSettings,
    };
  }

  assertNoError(googleApiResult.error);

  const referralSettingsResult = await supabase
    .from(TABLES.company)
    .select("referralSettings")
    .eq("id", 1)
    .maybeSingle();

  return {
    ...(baseResult.data as Omit<CompanySettings, "googleApiKey">),
    googleApiKey: (googleApiResult.data as Pick<CompanySettings, "googleApiKey"> | null)?.googleApiKey ?? null,
    referralSettings: normalizeReferralSettings(
      (referralSettingsResult.data as Pick<CompanySettings, "referralSettings"> | null)?.referralSettings,
    ),
  };
}

export async function updateCompanySettings(payload: Partial<CompanySettings>) {
  const supabase = createServerSupabase();
  const updatePayload: Record<string, unknown> = {
    id: 1,
    updatedAt: new Date().toISOString(),
  };

  if ("googleApiKey" in payload) {
    updatePayload.googleApiKey = payload.googleApiKey;
  }

  if ("referralSettings" in payload) {
    updatePayload.referralSettings = normalizeReferralSettings(payload.referralSettings);
  }

  const { data, error } = await supabase
    .from(TABLES.company)
    .upsert(updatePayload, { onConflict: "id" })
    .select("id,supportPhone,googleApiKey,referralSettings,updatedAt")
    .single();

  if (isMissingGoogleApiKeyColumn(error)) {
    throw new Error("A coluna Company.googleApiKey ainda nao existe no Supabase. Aplique a migration em supabase/migrations/20260527172000_add_google_api_key_to_company.sql.");
  }

  assertNoError(error);
  const settings = data as CompanySettings;
  return {
    ...settings,
    referralSettings: normalizeReferralSettings(settings.referralSettings),
  } satisfies CompanySettings;
}
