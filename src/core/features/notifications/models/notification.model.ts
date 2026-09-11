/**
 * Tipo de evento que originou a notificação (`AdminNotification.event_type`).
 *
 * A API não documenta a lista fechada destes valores — os que aqui constam
 * foram confirmados a partir de notificações reais devolvidas pelo backend.
 * `event_type`, no modelo, fica como `string` (não este enum) precisamente
 * por a API poder emitir outros que ainda não vimos.
 */
export enum NotificationEventType {
  PROFESSIONAL_APPLICATION_SUBMITTED = 'professional_application.submitted',
  ORDER_STATUS_CHANGED = 'order.status_changed',
  ORDER_PROFESSIONAL_REQUESTED = 'order.professional_requested',
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
