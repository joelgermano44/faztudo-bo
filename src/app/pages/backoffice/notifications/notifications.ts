import { Component, computed, inject, signal } from '@angular/core';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { NotificationService } from '../../../../core/features/notifications/services/notification.service';
import {
  AdminNotification,
  NotificationEventType,
} from '../../../../core/features/notifications/models/notification.model';
import {
  formatNotificationTimestamp,
  notificationIcon,
} from '../../../../core/features/notifications/notification.util';

type NotificationFilter = 'Todas' | 'Não lidas' | 'Profissionais';

@Component({
  imports: [TitleHeader],
  selector: 'app-notifications',
  styleUrl: './notifications.css',
  templateUrl: './notifications.html',
})
export class Notifications {
  private readonly notificationService = inject(NotificationService);

  readonly filters: NotificationFilter[] = ['Todas', 'Não lidas', 'Profissionais'];

  readonly activeFilter = signal<NotificationFilter>('Todas');

  readonly unreadCount = this.notificationService.unreadCount;

  readonly filteredNotifications = computed<AdminNotification[]>(() => {
    const filter = this.activeFilter();
    return this.notificationService.notifications().filter((notification) => {
      if (filter === 'Todas') return true;
      if (filter === 'Não lidas') return !notification.read_at;
      return notification.event_type === NotificationEventType.PROFESSIONAL_APPLICATION_SUBMITTED;
    });
  });

  constructor() {
    this.notificationService.refresh();
    this.notificationService.refreshUnreadCount();
  }

  setFilter(filter: NotificationFilter): void {
    this.activeFilter.set(filter);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id);
  }

  icon(eventType: string): string {
    return notificationIcon(eventType);
  }

  timestamp(iso: string): string {
    return formatNotificationTimestamp(iso);
  }
}
