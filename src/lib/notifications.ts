export type AdminNotificationType =
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_RENEWED"
  | "SUBSCRIPTION_CANCELED"
  | "USER_CREATED";

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  eventKey: string;
  relatedUserId: number | null;
  relatedSubscriptionId: number | null;
  relatedPlanName: string | null;
  actorName: string | null;
  actorEmail: string | null;
  occurredAt: string;
  readAt: string | null;
  createdAt: string;
}

export interface AdminNotificationsResponse {
  items: AdminNotification[];
}
