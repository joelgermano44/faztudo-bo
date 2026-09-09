/** Tipo de evento que originou a notificação (`AdminNotification.event_type`). */
export enum NotificationEventType {
  PROFESSIONAL_APPLICATION_SUBMITTED = 'professional_application.submitted',
}

/** Notificação administrativa (T25): entidade devolvida por `/admin-notifications` e pelo WebSocket. */
export interface AdminNotification {
  id: number;
  event_type: string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

/** Resposta de `GET /admin-notifications/unread-count` e do evento `admin-notification:unread-count`. */
export interface AdminNotificationUnreadCount {
  count: number;
}
