import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../../../../core/features/notifications/services/notification.service';
import { AdminNotification } from '../../../../../../core/features/notifications/models/notification.model';
import { formatNotificationTimestamp } from '../../../../../../core/features/notifications/notification.util';

const MAX_ACTIVITIES = 6;

@Component({
  imports: [RouterLink],
  selector: 'app-recent-activities',
  styleUrl: './recent-activities.css',
  templateUrl: './recent-activities.html',
})
export class RecentActivities {
  private readonly notificationService = inject(NotificationService);

  readonly activities = computed<AdminNotification[]>(() =>
    this.notificationService.notifications().slice(0, MAX_ACTIVITIES),
  );

  constructor() {
    this.notificationService.refresh();
  }

  colorClass(notification: AdminNotification): string {
    return notification.read_at ? 'bg-gray-300' : 'bg-emerald-400';
  }

  timestamp(iso: string): string {
    return formatNotificationTimestamp(iso);
  }
}
