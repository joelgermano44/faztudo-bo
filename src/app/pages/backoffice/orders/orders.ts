import { Component, computed, inject, signal } from '@angular/core';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { OrderDisplayStatus, OrderRow, OrdersTable } from './components/orders-table/orders-table';
import { OrderService } from '../../../../core/features/orders/services/order.service';
import { Order, OrderStatus } from '../../../../core/features/orders/models/order.model';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';

/** A API só devolve o nome do ficheiro; os uploads ficam servidos em `uploads/<pasta>/<ficheiro>`. */
function buildImageUrl(baseUrl: string, folder: string, filename: string | null): string | null {
  if (!filename) {
    return null;
  }
  if (/^https?:\/\//.test(filename)) {
    return filename;
  }
  return `${baseUrl}uploads/${folder}/${filename}`;
}

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
    client: {
      name: order.client.name,
      avatar: buildImageUrl(baseUrl, 'clients', order.client.image),
    },
    provider: {
      name: order.professional.name,
      avatar: buildImageUrl(baseUrl, 'professionals', order.professional.image),
    },
    service: order.service.name,
    value: formatMoney(order.first_payment?.amount ?? 0),
    startDate: formatDate(order.created_at),
    status: statusLabel(order.status),
  };
}

@Component({
  imports: [TitleHeader, OrdersTable],
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

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }
}
