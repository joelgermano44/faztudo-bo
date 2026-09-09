import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../../core/features/auth/services/auth.service';
import { NotificationService } from '../../../../../../core/features/notifications/services/notification.service';
import {
  formatNotificationTimestamp,
  notificationIcon,
} from '../../../../../../core/features/notifications/notification.util';

@Component({
  imports: [RouterLink],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  readonly isMenuOpen = signal(false);
  readonly isNotificationsOpen = signal(false);
  readonly currentUser = this.authService.currentUser;

  readonly unreadCount = this.notificationService.unreadCount;
  readonly recentNotifications = computed(() => this.notificationService.notifications().slice(0, 4));

  constructor() {
    this.notificationService.refresh();
    this.notificationService.refreshUnreadCount();
  }

  notificationIcon(eventType: string): string {
    return notificationIcon(eventType);
  }

  notificationTimestamp(iso: string): string {
    return formatNotificationTimestamp(iso);
  }

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
    this.isNotificationsOpen.set(false);
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.update((open) => !open);
    this.isMenuOpen.set(false);
  }

  onNotificationClick(id: number): void {
    this.notificationService.markAsRead(id);
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  /** Rótulo do `role` do JWT (`'admin'` -> `'Admin'`). */
  roleLabel(): string {
    const role = this.currentUser()?.role;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
  }

  logout(): void {
    this.isMenuOpen.set(false);
    this.notificationService.disconnect();
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
      this.isNotificationsOpen.set(false);
    }
  }
}
