import { NotificationEventType } from './models/notification.model';

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
};
const DEFAULT_NOTIFICATION_ICON = '/icons/dashboard/notification.svg';

/** Ícone associado ao `event_type` da notificação, com um ícone genérico como fallback. */
export function notificationIcon(eventType: string): string {
  return NOTIFICATION_ICON[eventType] ?? DEFAULT_NOTIFICATION_ICON;
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
