import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Drawer } from '../../../../../shared/ui/drawer/drawer';
import { ImageViewer } from '../../../../../shared/ui/image-viewer/image-viewer';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildAvatarUrl } from '../../../../../../core/shared/util/media-url';
import { Client } from '../../../../../../core/features/users-clients/models/client.model';
import { Order, OrderStatus } from '../../../../../../core/features/orders/models/order.model';
import { Rating } from '../../../../../../core/features/ratings/models/rating.model';
import { SupportInboxItem } from '../../../../../../core/features/support-chat/models/support-chat.model';

interface OrderStatusStyle {
  label: string;
  badge: string;
}

const ORDER_STATUS_STYLES: Record<OrderStatus, OrderStatusStyle> = {
  [OrderStatus.REQUESTED]: { label: 'Pendente', badge: 'bg-amber-50 text-[#CCA830]' },
  [OrderStatus.ACCEPTED]: { label: 'Aceito', badge: 'bg-blue-50 text-blue-600' },
  [OrderStatus.IN_PROGRESS]: { label: 'Em Execução', badge: 'bg-[#80F98B33] text-emerald-700' },
  [OrderStatus.DONE]: { label: 'Concluído', badge: 'bg-teal-50 text-teal-700' },
  [OrderStatus.CANCELED]: { label: 'Cancelado', badge: 'bg-gray-100 text-gray-500' },
  [OrderStatus.REJECTED]: { label: 'Rejeitado', badge: 'bg-red-50 text-red-600' },
};

const MONTH_ABBR = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate().toString().padStart(2, '0')} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

function formatMoney(amount: number): string {
  return `${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AOA`;
}

@Component({
  imports: [Drawer, ImageViewer, RouterLink],
  selector: 'app-client-view-drawer',
  styleUrl: './client-view-drawer.css',
  templateUrl: './client-view-drawer.html',
})
export class ClientViewDrawer {
  private readonly baseUrl = inject(API_BASE_URL);

  readonly open = input(false);
  readonly client = input<Client | null>(null);

  readonly orders = input<Order[]>([]);
  readonly ordersLoading = input(false);
  readonly ratings = input<Map<number, Rating>>(new Map());

  readonly conversations = input<SupportInboxItem[]>([]);
  readonly conversationsLoading = input(false);

  readonly closed = output<void>();
  readonly edit = output<string>();
  readonly remove = output<string>();

  readonly avatarUrl = computed(() => {
    const client = this.client();
    return client?.image ? buildAvatarUrl(this.baseUrl, 'clients', client.image) : null;
  });

  readonly isActive = computed(() => this.client()?.deleted_at === null);

  readonly statusBadgeClass = computed(() =>
    this.isActive() ? 'bg-primary text-[#161E00]' : 'bg-gray-100 text-[#436746]',
  );

  readonly activeOrdersCount = computed(
    () =>
      this.orders().filter((order) =>
        [OrderStatus.REQUESTED, OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS].includes(
          order.status,
        ),
      ).length,
  );

  readonly totalSpent = computed(() =>
    this.orders().reduce((sum, order) => {
      const amount = order.first_payment?.amount;
      return amount ? sum + amount : sum;
    }, 0),
  );

  readonly averageRating = computed(() => {
    const values = Array.from(this.ratings().values());
    if (values.length === 0) {
      return null;
    }
    return values.reduce((sum, rating) => sum + rating.stars, 0) / values.length;
  });

  readonly totalUnreadConversations = computed(() =>
    this.conversations().reduce((sum, conversation) => sum + conversation.unread_count, 0),
  );

  readonly lightboxOpen = signal(false);

  openLightbox(): void {
    if (this.avatarUrl()) {
      this.lightboxOpen.set(true);
    }
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  requestClose(): void {
    this.closed.emit();
  }

  requestEdit(): void {
    const client = this.client();
    if (client) {
      this.edit.emit(client.id);
    }
  }

  requestDelete(): void {
    const client = this.client();
    if (client) {
      this.remove.emit(client.id);
    }
  }

  orderStatusStyle(status: OrderStatus): OrderStatusStyle {
    return ORDER_STATUS_STYLES[status];
  }

  ratingFor(orderId: number): Rating | null {
    return this.ratings().get(orderId) ?? null;
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '—';
    }
    return new Date(value).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatShortDate(iso: string): string {
    return formatShortDate(iso);
  }

  formatMoney(amount: number): string {
    return formatMoney(amount);
  }

  formatAddress(client: Client): string {
    const address = client.address;
    if (!address) {
      return '—';
    }
    return [address.address, address.municiple, address.province].filter(Boolean).join(', ');
  }

  conversationTimestamp(iso: string | null): string {
    if (!iso) {
      return '—';
    }
    return formatShortDate(iso);
  }
}
