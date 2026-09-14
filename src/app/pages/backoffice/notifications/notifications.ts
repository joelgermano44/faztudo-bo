import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { NotificationService } from '../../../../core/features/notifications/services/notification.service';
import {
  AdminNotification,
  NotificationEventType,
} from '../../../../core/features/notifications/models/notification.model';
import {
  formatNotificationTimestamp,
  notificationIcon,
  notificationTarget,
} from '../../../../core/features/notifications/notification.util';

type NotificationFilter = 'Todas' | 'Não lidas' | 'Candidaturas' | 'Contratos' | 'Denúncias';

/** Grupos de `event_type` cobertos por cada filtro de categoria. */
const CATEGORY_EVENT_TYPES: Partial<Record<NotificationFilter, NotificationEventType[]>> = {
  Candidaturas: [NotificationEventType.PROFESSIONAL_APPLICATION_SUBMITTED],
  Contratos: [
    NotificationEventType.ORDER_STATUS_CHANGED,
    NotificationEventType.ORDER_PROFESSIONAL_REQUESTED,
  ],
  Denúncias: [NotificationEventType.REPORT_SUBMITTED],
};

@Component({
  imports: [TitleHeader, EmptyState],
  selector: 'app-notifications',
  styleUrl: './notifications.css',
  templateUrl: './notifications.html',
})
export class Notifications {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly filters: NotificationFilter[] = [
    'Todas',
    'Não lidas',
    'Candidaturas',
    'Contratos',
    'Denúncias',
  ];

  readonly activeFilter = signal<NotificationFilter>('Todas');
  readonly searchTerm = signal('');

  readonly unreadCount = this.notificationService.unreadCount;

  readonly filteredNotifications = computed<AdminNotification[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();
    const eventTypes = CATEGORY_EVENT_TYPES[filter];

    return this.notificationService
      .notifications()
      .filter((notification) => {
        if (filter === 'Todas') return true;
        if (filter === 'Não lidas') return !notification.read_at;
        return eventTypes?.includes(notification.event_type as NotificationEventType) ?? true;
      })
      .filter(
        (notification) =>
          !term ||
          notification.title.toLowerCase().includes(term) ||
          notification.body.toLowerCase().includes(term),
      );
  });

  constructor() {
    const query = this.route.snapshot.queryParamMap.get('q');
    if (query) {
      this.searchTerm.set(query);
    }
    this.notificationService.refresh();
    this.notificationService.refreshUnreadCount();
  }

  setFilter(filter: NotificationFilter): void {
    this.activeFilter.set(filter);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  markAsRead(notification: AdminNotification): void {
    this.notificationService.markAsRead(notification.id);
    const target = notificationTarget(notification);
    this.router.navigate(target.commands, { queryParams: target.queryParams });
  }

  icon(eventType: string): string {
    return notificationIcon(eventType);
  }

  timestamp(iso: string): string {
    return formatNotificationTimestamp(iso);
  }
}
