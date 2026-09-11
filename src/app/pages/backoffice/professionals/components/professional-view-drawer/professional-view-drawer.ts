import { Component, computed, inject, input, output, signal } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { Drawer } from '../../../../../shared/ui/drawer/drawer';
import {
  Professional,
  ProfessionalAbsence,
  ProfessionalAvailabilityStatus,
  ProfessionalWorkingHours,
  DayOfWeek,
} from '../../../../../../core/features/professionals/models/professional.model';
import { ProfessionalService } from '../../../../../../core/features/professionals/services/professional.service';
import { ServiceCatalogService } from '../../../../../../core/features/services/services/service.service';
import { Service } from '../../../../../../core/features/services/models/service.model';
import { RatingService } from '../../../../../../core/features/ratings/services/rating.service';
import { Rating } from '../../../../../../core/features/ratings/models/rating.model';
import { WalletService } from '../../../../../../core/features/wallet/services/wallet.service';
import { WalletStatementItem, WalletSummary } from '../../../../../../core/features/wallet/models/wallet.model';
import { PayoutService } from '../../../../../../core/features/payouts/services/payout.service';
import { ProfessionalPayoutStatus } from '../../../../../../core/features/payouts/models/payout.model';
import { OrderService } from '../../../../../../core/features/orders/services/order.service';
import { Order, OrderStatus } from '../../../../../../core/features/orders/models/order.model';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildAvatarUrl, buildMediaUrl } from '../../../../../../core/shared/util/media-url';

export type ProfessionalTab =
  | 'perfil'
  | 'curriculo'
  | 'servicos'
  | 'agenda'
  | 'financeiro'
  | 'avaliacoes'
  | 'pedidos';

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

const PAYOUT_STATUS_STYLES: Record<ProfessionalPayoutStatus, OrderStatusStyle> = {
  [ProfessionalPayoutStatus.PENDING]: { label: 'Pendente', badge: 'bg-amber-50 text-[#CCA830]' },
  [ProfessionalPayoutStatus.PAID]: { label: 'Pago', badge: 'bg-[#80F98B33] text-emerald-700' },
};

const WEEKDAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.SUNDAY]: 'Domingo',
  [DayOfWeek.MONDAY]: 'Segunda-feira',
  [DayOfWeek.TUESDAY]: 'Terça-feira',
  [DayOfWeek.WEDNESDAY]: 'Quarta-feira',
  [DayOfWeek.THURSDAY]: 'Quinta-feira',
  [DayOfWeek.FRIDAY]: 'Sexta-feira',
  [DayOfWeek.SATURDAY]: 'Sábado',
};

const WEEKDAY_ORDER: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

@Component({
  imports: [Drawer],
  selector: 'app-professional-view-drawer',
  styleUrl: './professional-view-drawer.css',
  templateUrl: './professional-view-drawer.html',
})
export class ProfessionalViewDrawer {
  private readonly professionalService = inject(ProfessionalService);
  private readonly serviceCatalogService = inject(ServiceCatalogService);
  private readonly ratingService = inject(RatingService);
  private readonly walletService = inject(WalletService);
  private readonly payoutService = inject(PayoutService);
  private readonly orderService = inject(OrderService);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly open = input(false);
  readonly professional = input<Professional | null>(null);

  readonly closed = output<void>();
  readonly edit = output<number>();
  readonly remove = output<number>();
  readonly toggleAvailability = output<number>();

  readonly activeTab = signal<ProfessionalTab>('perfil');
  readonly weekdayOrder = WEEKDAY_ORDER;

  readonly avatarUrl = computed(() => {
    const professional = this.professional();
    return professional ? buildAvatarUrl(this.baseUrl, 'professionals', professional.image) : null;
  });

  readonly isAvailable = computed(
    () => this.professional()?.availability_status === ProfessionalAvailabilityStatus.AVAILABLE,
  );

  readonly availabilityBadge = computed(() =>
    this.isAvailable() ? 'bg-[#80F98B33] text-emerald-700' : 'bg-gray-100 text-gray-500',
  );

  // --- Agenda (working hours + absences) ---
  readonly agendaLoaded = signal(false);
  readonly agendaLoading = signal(false);
  readonly workingHours = signal<ProfessionalWorkingHours[]>([]);
  readonly absences = signal<ProfessionalAbsence[]>([]);

  // --- Serviços (catálogo para resolver nomes) ---
  readonly servicesLoaded = signal(false);
  readonly servicesLoading = signal(false);
  private readonly serviceCatalog = signal<Map<number, Service>>(new Map());

  // --- Financeiro ---
  readonly financeiroLoaded = signal(false);
  readonly financeiroLoading = signal(false);
  readonly walletSummary = signal<WalletSummary | null>(null);
  readonly statement = signal<WalletStatementItem[]>([]);
  readonly markingPaidId = signal<number | null>(null);

  // --- Avaliações ---
  readonly ratingsLoaded = signal(false);
  readonly ratingsLoading = signal(false);
  readonly ratings = signal<Rating[]>([]);
  readonly ratingsHasMore = signal(false);
  private readonly ratingsPageSize = 10;

  // --- Pedidos ---
  readonly ordersLoaded = signal(false);
  readonly ordersLoading = signal(false);
  readonly orders = signal<Order[]>([]);

  readonly workingHoursByDay = computed(() => {
    const map = new Map<DayOfWeek, ProfessionalWorkingHours[]>();
    this.workingHours().forEach((entry) => {
      const list = map.get(entry.day_of_week) ?? [];
      list.push(entry);
      map.set(entry.day_of_week, list);
    });
    return map;
  });

  setTab(tab: ProfessionalTab): void {
    this.activeTab.set(tab);

    if (tab === 'agenda' && !this.agendaLoaded()) {
      this.loadAgenda();
    }
    if (tab === 'servicos' && !this.servicesLoaded()) {
      this.loadServiceCatalog();
    }
    if (tab === 'financeiro' && !this.financeiroLoaded()) {
      this.loadFinanceiro();
    }
    if (tab === 'avaliacoes' && !this.ratingsLoaded()) {
      this.loadRatings();
    }
    if (tab === 'pedidos' && !this.ordersLoaded()) {
      this.loadOrders();
    }
  }

  tabClass(tab: ProfessionalTab): string {
    return this.activeTab() === tab
      ? 'text-[#0B2E13] border-b-2 border-[#0B2E13]'
      : 'text-gray-500 border-b-2 border-transparent';
  }

  private loadAgenda(): void {
    const professional = this.professional();
    if (!professional) {
      return;
    }
    this.agendaLoading.set(true);
    forkJoin({
      workingHours: this.professionalService.getWorkingHours(professional.id),
      absences: this.professionalService.getAbsences(professional.id),
    }).subscribe({
      next: ({ workingHours, absences }) => {
        this.agendaLoading.set(false);
        this.agendaLoaded.set(true);
        this.workingHours.set(workingHours);
        this.absences.set(absences);
      },
      error: () => {
        this.agendaLoading.set(false);
        this.agendaLoaded.set(true);
      },
    });
  }

  private loadServiceCatalog(): void {
    this.servicesLoading.set(true);
    this.serviceCatalogService.findAllAsAdmin().subscribe({
      next: (services) => {
        this.servicesLoading.set(false);
        this.servicesLoaded.set(true);
        this.serviceCatalog.set(new Map(services.map((service) => [service.id, service])));
      },
      error: () => {
        this.servicesLoading.set(false);
        this.servicesLoaded.set(true);
      },
    });
  }

  private loadFinanceiro(): void {
    const professional = this.professional();
    if (!professional) {
      return;
    }
    this.financeiroLoading.set(true);
    forkJoin({
      summary: this.walletService.getSummary(professional.id).pipe(catchError(() => of(null))),
      statement: this.walletService.getStatement(professional.id).pipe(catchError(() => of([]))),
    }).subscribe(({ summary, statement }) => {
      this.financeiroLoading.set(false);
      this.financeiroLoaded.set(true);
      this.walletSummary.set(summary);
      this.statement.set(statement);
    });
  }

  private loadRatings(): void {
    const professional = this.professional();
    if (!professional) {
      return;
    }
    this.ratingsLoading.set(true);
    this.ratingService.findForProfessional(professional.id, { take: this.ratingsPageSize }).subscribe({
      next: ({ items, total }) => {
        this.ratingsLoading.set(false);
        this.ratingsLoaded.set(true);
        this.ratings.set(items);
        this.ratingsHasMore.set(items.length < total);
      },
      error: () => {
        this.ratingsLoading.set(false);
        this.ratingsLoaded.set(true);
      },
    });
  }

  loadMoreRatings(): void {
    const professional = this.professional();
    if (!professional || this.ratingsLoading()) {
      return;
    }
    this.ratingsLoading.set(true);
    this.ratingService
      .findForProfessional(professional.id, { take: this.ratingsPageSize, skip: this.ratings().length })
      .subscribe({
        next: ({ items, total }) => {
          this.ratingsLoading.set(false);
          this.ratings.update((current) => [...current, ...items]);
          this.ratingsHasMore.set(this.ratings().length < total);
        },
        error: () => this.ratingsLoading.set(false),
      });
  }

  private loadOrders(): void {
    const professional = this.professional();
    if (!professional) {
      return;
    }
    this.ordersLoading.set(true);
    this.orderService.findByProfessional(professional.id).subscribe({
      next: (orders) => {
        this.ordersLoading.set(false);
        this.ordersLoaded.set(true);
        this.orders.set(orders);
      },
      error: () => {
        this.ordersLoading.set(false);
        this.ordersLoaded.set(true);
      },
    });
  }

  markPayoutPaid(payoutId: number): void {
    this.markingPaidId.set(payoutId);
    this.payoutService.markPaid(payoutId).subscribe({
      next: () => {
        this.markingPaidId.set(null);
        this.statement.update((current) =>
          current.map((item) =>
            item.payout_id === payoutId
              ? { ...item, status: ProfessionalPayoutStatus.PAID, paid_at: new Date().toISOString() }
              : item,
          ),
        );
      },
      error: () => this.markingPaidId.set(null),
    });
  }

  weekdayLabel(day: DayOfWeek): string {
    return WEEKDAY_LABELS[day];
  }

  orderStatusStyle(status: OrderStatus): OrderStatusStyle {
    return ORDER_STATUS_STYLES[status];
  }

  payoutStatusStyle(status: ProfessionalPayoutStatus): OrderStatusStyle {
    return PAYOUT_STATUS_STYLES[status];
  }

  serviceName(serviceId: number): string {
    return this.serviceCatalog().get(serviceId)?.name ?? `Serviço #${serviceId}`;
  }

  serviceImage(serviceId: number): string | null {
    const service = this.serviceCatalog().get(serviceId);
    return service?.image ? buildMediaUrl(this.baseUrl, service.image) : null;
  }

  certificateImageUrl(image: { path: string } | null): string | null {
    return image ? buildMediaUrl(this.baseUrl, image as never) : null;
  }

  clientAvatar(rating: Rating): string | null {
    return rating.client?.image ? buildAvatarUrl(this.baseUrl, 'clients', rating.client.image) : null;
  }

  requestClose(): void {
    this.closed.emit();
  }

  requestEdit(): void {
    const professional = this.professional();
    if (professional) {
      this.edit.emit(professional.id);
    }
  }

  requestRemove(): void {
    const professional = this.professional();
    if (professional) {
      this.remove.emit(professional.id);
    }
  }

  requestToggleAvailability(): void {
    const professional = this.professional();
    if (professional) {
      this.toggleAvailability.emit(professional.id);
    }
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    return new Date(value).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatMoney(amount: number): string {
    return `${amount.toLocaleString('de-DE', { maximumFractionDigits: 0 })} KZ`;
  }
}
