import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { toast } from 'ngx-sonner';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { AuthService } from '../../auth/services/auth.service';
import { AdminNotification, AdminNotificationUnreadCount } from '../models/notification.model';
import { notificationTarget } from '../notification.util';

/**
 * Notificações administrativas (T25): caixa de entrada persistida via REST
 * (`/admin-notifications`) + avisos em tempo real via WebSocket, namespace
 * `/admin-notifications` (Socket.IO, autenticado com o JWT do admin em `auth.token`).
 *
 * A notificação é partilhada entre administradores: assim que uma é marcada como
 * lida, fica lida para todos — não há estado de leitura por administrador.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly resource = `${this.baseUrl}/admin-notifications`;

  private socket: Socket | null = null;

  private readonly notificationsSignal = signal<AdminNotification[]>([]);
  private readonly unreadCountSignal = signal(0);

  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = this.unreadCountSignal.asReadonly();

  constructor() {
    // `connect()` isolado no construtor só corria uma vez, e a `sessionExpiredInterceptor`
    // injeta este serviço logo na primeira chamada HTTP — antes do login, portanto
    // sem sessão ainda. Reagimos à sessão em vez de tentar ligar só ao arrancar,
    // para ligar assim que o login acontece (e desligar ao terminar sessão).
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  /** `GET /admin-notifications` — lista as notificações, mais recentes primeiro (até 100). */
  refresh(onlyUnread = false): void {
    this.http
      .get<AdminNotification[]>(this.resource, { params: onlyUnread ? { unread: 'true' } : {} })
      .subscribe({
        next: (notifications) => this.notificationsSignal.set(notifications),
        error: (err) => console.error('Erro ao carregar notificações', err),
      });
  }

  /** `GET /admin-notifications/unread-count` */
  refreshUnreadCount(): void {
    this.http
      .get<AdminNotificationUnreadCount>(`${this.resource}/unread-count`)
      .subscribe((response) => this.unreadCountSignal.set(response.count));
  }

  /** `PATCH /admin-notifications/:id/read` — idempotente. */
  markAsRead(id: number): void {
    this.http.patch<AdminNotification>(`${this.resource}/${id}/read`, {}).subscribe({
      next: (updated) => {
        this.notificationsSignal.update((items) =>
          items.map((item) => (item.id === id ? updated : item)),
        );
        this.refreshUnreadCount();
      },
      error: (err) => console.error('Erro ao marcar notificação como lida', err),
    });
  }

  /** `PATCH /admin-notifications/read-all` */
  markAllAsRead(): void {
    this.http.patch<void>(`${this.resource}/read-all`, {}).subscribe({
      next: () => {
        const now = new Date().toISOString();
        this.notificationsSignal.update((items) =>
          items.map((item) => ({ ...item, read_at: item.read_at ?? now })),
        );
        this.unreadCountSignal.set(0);
      },
      error: (err) => console.error('Erro ao marcar notificações como lidas', err),
    });
  }

  /** Liga ao WebSocket `/admin-notifications`. Sem efeito fora do browser ou sem sessão ativa. */
  private connect(): void {
    if (!this.isBrowser || this.socket || !this.authService.isAuthenticated()) {
      return;
    }
    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    const origin = this.baseUrl.replace(/\/+$/, '');
    this.socket = io(`${origin}/admin-notifications`, {
      transports: ['websocket'],
      auth: { token },
    });

    this.socket.on('admin-notification:unread-count', ({ count }: AdminNotificationUnreadCount) => {
      this.unreadCountSignal.set(count);
    });

    this.socket.on('admin-notification:new', (notification: AdminNotification) => {
      this.notificationsSignal.update((items) => [notification, ...items]);
      this.unreadCountSignal.update((count) => count + 1);
      this.notifyToast(notification);
    });

    this.socket.on('connect_error', (err: Error) => {
      console.error('[admin-notifications] falha na ligação', err.message);
    });
  }

  /** Mostra um toast para uma notificação recebida em tempo real, com atalho para a página relacionada. */
  private notifyToast(notification: AdminNotification): void {
    const target = notificationTarget(notification);
    toast(notification.title, {
      description: notification.body,
      duration: 8000,
      action: {
        label: 'Ver',
        onClick: () => {
          this.router.navigate(target.commands, { queryParams: target.queryParams });
        },
      },
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
