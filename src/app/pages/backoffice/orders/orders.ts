import { Component, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { toast } from 'ngx-sonner';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { OrderDisplayStatus, OrderRow, OrdersTable } from './components/orders-table/orders-table';
import { Modal } from '../../../shared/ui/modal/modal';
import { OrderService } from '../../../../core/features/orders/services/order.service';
import { Order, OrderStatus } from '../../../../core/features/orders/models/order.model';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';
import {
  buildAvatarUrl as buildImageUrl,
  buildMediaUrl,
} from '../../../../core/shared/util/media-url';

type StatusFilter = 'Todos' | OrderDisplayStatus;

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

function statusLabel(status: OrderStatus): OrderDisplayStatus {
  switch (status) {
    case OrderStatus.IN_PROGRESS:
      return 'Ativo';
    case OrderStatus.DONE:
      return 'Finalizado';
    case OrderStatus.CANCELED:
    case OrderStatus.REJECTED:
      return 'Cancelado';
    case OrderStatus.REQUESTED:
    case OrderStatus.ACCEPTED:
    default:
      return 'Pendente';
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = date.getDate().toString().padStart(2, '0');
  return `${day} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

function formatMoney(amount: number): string {
  return `${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KZ`;
}

function toOrderRow(order: Order, baseUrl: string): OrderRow {
  return {
    id: order.id,
    rawStatus: order.status,
    client: {
      name: order.client.name,
      avatar: buildImageUrl(baseUrl, 'clients', order.client.image),
    },
    provider: {
      name: order.professional.name,
      avatar: buildImageUrl(baseUrl, 'professionals', order.professional.image),
    },
    service: order.service.name,
    serviceImage: order.service.image ? buildMediaUrl(baseUrl, order.service.image) : null,
    value: formatMoney(order.first_payment?.amount ?? 0),
    startDate: formatDate(order.created_at),
    status: statusLabel(order.status),
  };
}

@Component({
  imports: [TitleHeader, OrdersTable, Modal],
  selector: 'app-orders',
  styleUrl: './orders.css',
  templateUrl: './orders.html',
})
export class Orders {
  private readonly orderService = inject(OrderService);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly filters: StatusFilter[] = ['Todos', 'Ativo', 'Pendente', 'Finalizado', 'Cancelado'];
  readonly filterLabels: Record<StatusFilter, string> = {
    Todos: 'Todos',
    Ativo: 'Ativos',
    Pendente: 'Pendentes',
    Finalizado: 'Finalizados',
    Cancelado: 'Cancelados',
  };

  readonly activeFilter = signal<StatusFilter>('Todos');
  readonly searchTerm = signal('');

  private readonly orders = signal<Order[]>([]);

  readonly rejectingOrder = signal<Order | null>(null);
  readonly rejectReason = signal('');
  readonly isRejecting = signal(false);
  readonly isRejectModalOpen = computed(() => this.rejectingOrder() !== null);

  readonly filteredOrders = computed<OrderRow[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();

    return this.orders()
      .map((order) => toOrderRow(order, this.baseUrl))
      .filter((order) => filter === 'Todos' || order.status === filter)
      .filter((order) => {
        if (!term) {
          return true;
        }
        return (
          order.id.toString().includes(term) ||
          order.client.name.toLowerCase().includes(term) ||
          order.provider.name.toLowerCase().includes(term) ||
          order.service.toLowerCase().includes(term)
        );
      });
  });

  constructor() {
    this.orderService
      .findAll()
      .pipe(
        switchMap((orders) => {
          if (orders.length === 0) {
            return of(orders);
          }
          // `GET /orders` não embute o pagamento; buscamos à parte quando falta.
          return forkJoin(
            orders.map((order) =>
              order.first_payment
                ? of(order)
                : this.orderService.getOrderPayments(order.id).pipe(
                    map((payments) => ({ ...order, first_payment: payments[0] })),
                    catchError(() => of(order)),
                  ),
            ),
          );
        }),
      )
      .subscribe({
        next: (orders) => this.orders.set(orders),
        error: (err) => console.error('Erro ao carregar pedidos', err),
      });
  }

  private findOrderById(id: number): Order | null {
    return this.orders().find((order) => order.id === id) ?? null;
  }

  private replaceOrder(updated: Order): void {
    this.orders.update((list) =>
      list.map((order) => (order.id === updated.id ? { ...order, ...updated } : order)),
    );
  }

  requestReject(id: number): void {
    this.rejectingOrder.set(this.findOrderById(id));
    this.rejectReason.set('');
  }

  cancelReject(): void {
    if (this.isRejecting()) {
      return;
    }
    this.rejectingOrder.set(null);
  }

  confirmReject(): void {
    const order = this.rejectingOrder();
    const reason = this.rejectReason().trim();
    if (!order || !reason || this.isRejecting()) {
      return;
    }

    this.isRejecting.set(true);
    this.orderService.reject(order.id, { reason }).subscribe({
      next: (updated) => {
        this.isRejecting.set(false);
        this.rejectingOrder.set(null);
        this.replaceOrder(updated);
        toast.success('Contrato rejeitado');
      },
      error: (err) => {
        this.isRejecting.set(false);
        toast.error('Não foi possível rejeitar o contrato', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }
}
