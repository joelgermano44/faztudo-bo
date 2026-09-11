import { Component, computed, effect, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderStatus } from '../../../../../../core/features/orders/models/order.model';

export type OrderDisplayStatus = 'Ativo' | 'Pendente' | 'Finalizado' | 'Cancelado';

export interface OrderRow {
  id: number;
  rawStatus: OrderStatus;
  client: {
    name: string;
    avatar: string | null;
  };
  provider: {
    name: string;
    avatar: string | null;
  };
  service: string;
  serviceImage: string | null;
  value: string;
  startDate: string;
  status: OrderDisplayStatus;
}

interface OrderStatusStyle {
  badge: string;
  dot: string;
}

const ORDER_STATUS_STYLES: Record<OrderDisplayStatus, OrderStatusStyle> = {
  Ativo: {
    badge: 'bg-[#80F98B33] text-emerald-700',
    dot: 'bg-[#006E25]',
  },
  Pendente: {
    badge: 'bg-amber-50 text-[#CCA830]',
    dot: 'bg-[#CCA830]',
  },
  Finalizado: {
    badge: 'bg-teal-50 text-teal-700',
    dot: 'bg-teal-600',
  },
  Cancelado: {
    badge: 'bg-gray-100 text-gray-500',
    dot: 'bg-gray-400',
  },
};

const PAGE_SIZE = 8;

@Component({
  imports: [RouterLink],
  selector: 'app-orders-table',
  styleUrl: './orders-table.css',
  templateUrl: './orders-table.html',
})
export class OrdersTable {
  readonly orders = input<OrderRow[]>([]);

  readonly reject = output<number>();

  readonly page = signal(1);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.orders().length / PAGE_SIZE)));

  readonly pagedOrders = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.orders().slice(start, start + PAGE_SIZE);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, index) => index + 1);
  });

  readonly rangeStart = computed(() =>
    this.orders().length === 0 ? 0 : (this.currentPage() - 1) * PAGE_SIZE + 1,
  );

  readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * PAGE_SIZE, this.orders().length),
  );

  private currentPage(): number {
    return Math.min(this.page(), this.totalPages());
  }

  constructor() {
    effect(() => {
      this.orders();
      this.page.set(1);
    });
  }

  statusStyle(status: OrderDisplayStatus): OrderStatusStyle {
    return ORDER_STATUS_STYLES[status];
  }

  canReject(row: OrderRow): boolean {
    return row.rawStatus === OrderStatus.REQUESTED;
  }

  onReject(event: Event, id: number): void {
    event.stopPropagation();
    this.reject.emit(id);
  }

  goToPage(page: number): void {
    this.page.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }
}
