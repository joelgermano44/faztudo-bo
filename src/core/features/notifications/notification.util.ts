import { AdminNotification, NotificationEventType } from './models/notification.model';

const MONTH_ABBR = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const NOTIFICATION_ICON: Record<string, string> = {
  [NotificationEventType.PROFESSIONAL_APPLICATION_SUBMITTED]: '/icons/orders/team.svg',
  [NotificationEventType.ORDER_STATUS_CHANGED]: '/icons/orders/history.svg',
  [NotificationEventType.ORDER_PROFESSIONAL_REQUESTED]: '/icons/orders/team.svg',
};
const DEFAULT_NOTIFICATION_ICON = '/icons/dashboard/notification.svg';

/** Ícone associado ao `event_type` da notificação, com um ícone genérico como fallback. */
export function notificationIcon(eventType: string): string {
  return NOTIFICATION_ICON[eventType] ?? DEFAULT_NOTIFICATION_ICON;
}

/** Para onde navegar ao clicar numa notificação, com base no `event_type` e no `payload`. */
export interface NotificationTarget {
  commands: unknown[];
  queryParams?: Record<string, string>;
}

/**
 * `payload` não tem schema documentado pela API — por isso só lemos chaves
 * que, a existirem, são inequivocamente o identificador em causa (nunca
 * assumimos outros campos por adivinhação).
 */
function extractId(payload: Record<string, unknown> | null, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === 'number' || typeof value === 'string') {
      return String(value);
    }
  }
  return null;
}

/** Rota relacionada com a notificação, para navegação ao clicar nela. */
export function notificationTarget(notification: AdminNotification): NotificationTarget {
  switch (notification.event_type) {
    case NotificationEventType.PROFESSIONAL_APPLICATION_SUBMITTED: {
      const professionalId = extractId(notification.payload, 'professional_id', 'id');
      return {
        commands: ['/dashboard/professional-applications'],
        queryParams: professionalId ? { q: professionalId } : undefined,
      };
    }
    case NotificationEventType.ORDER_STATUS_CHANGED:
    case NotificationEventType.ORDER_PROFESSIONAL_REQUESTED: {
      const orderId = extractId(notification.payload, 'orderId', 'order_id');
      if (orderId) {
        return { commands: ['/dashboard/orders', orderId] };
      }
      return { commands: ['/dashboard/orders'] };
    }
    default: {
      // A API pode emitir outros `event_type` ligados a um pedido que ainda
      // não mapeámos — se o payload trouxer um `orderId`/`order_id`, é mais
      // útil abrir esse pedido do que cair na lista genérica.
      const orderId = extractId(notification.payload, 'orderId', 'order_id');
      if (orderId) {
        return { commands: ['/dashboard/orders', orderId] };
      }
      return { commands: ['/dashboard/notifications'] };
    }
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/** Formata `created_at` como "Hoje, HH:mm" / "Ontem, HH:mm" / "DD Mon AAAA, HH:mm". */
export function formatNotificationTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) {
    return `Hoje, ${formatTime(date)}`;
  }
  if (isSameDay(date, yesterday)) {
    return `Ontem, ${formatTime(date)}`;
  }
  return `${date.getDate().toString().padStart(2, '0')} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}, ${formatTime(date)}`;
}
