import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { API_BASE_URL } from '../../../../../core/shared/http/api-config';
import { OrderService } from '../../../../../core/features/orders/services/order.service';
import { PayoutService } from '../../../../../core/features/payouts/services/payout.service';
import { Order, OrderLocationType, OrderStatus, OrderTimelineEvent } from '../../../../../core/features/orders/models/order.model';
import { Payment, PaymentStatus } from '../../../../../core/features/payments/models/payment.model';
import { ProfessionalPayout, ProfessionalPayoutStatus } from '../../../../../core/features/payouts/models/payout.model';
import { OrderHeader } from './components/order-header/order-header';
import { ServiceDetails } from './components/service-details/service-details';
import { ClientCard } from './components/client-card/client-card';
import { ProfessionalCard } from './components/professional-card/professional-card';
import { FinancialSummary } from './components/financial-summary/financial-summary';
import { ContractTimeline, TimelineEntry } from './components/contract-timeline/contract-timeline';

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

interface StatusStyle {
  label: string;
  badge: string;
}

const STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  [OrderStatus.REQUESTED]: { label: 'Pendente', badge: 'bg-amber-50 text-[#CCA830]' },
  [OrderStatus.ACCEPTED]: { label: 'Aceito', badge: 'bg-amber-50 text-[#CCA830]' },
  [OrderStatus.IN_PROGRESS]: { label: 'Em Execução', badge: 'bg-[#80F98B33] text-emerald-700' },
  [OrderStatus.DONE]: { label: 'Concluído', badge: 'bg-gray-100 text-[#436746]' },
  [OrderStatus.CANCELED]: { label: 'Cancelado', badge: 'bg-gray-100 text-[#436746]' },
  [OrderStatus.REJECTED]: { label: 'Rejeitado', badge: 'bg-gray-100 text-[#436746]' },
};

const STATUS_EVENT_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.REQUESTED]: 'Pedido Criado',
  [OrderStatus.ACCEPTED]: 'Prestador Atribuído',
  [OrderStatus.IN_PROGRESS]: 'Em Execução',
  [OrderStatus.DONE]: 'Conclusão Confirmada',
  [OrderStatus.CANCELED]: 'Pedido Cancelado',
  [OrderStatus.REJECTED]: 'Pedido Rejeitado',
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Aguardando Pagamento',
  [PaymentStatus.PROCESSING]: 'Pagamento em Processamento',
  [PaymentStatus.SUCCESS]: 'Pago pelo Cliente',
  [PaymentStatus.FAILED]: 'Pagamento Falhou',
  [PaymentStatus.EXPIRED]: 'Pagamento Expirado',
  [PaymentStatus.REFUNDED]: 'Reembolsado',
};

interface TimelineItem {
  label: string;
  description: string;
  occurredAt: Date;
}

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

function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}, ${hours}:${minutes}`;
}

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${MONTH_ABBR[date.getMonth()]}, ${hours}:${minutes}`;
}

function formatMoney(amount: number): string {
  return `${amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AOA`;
}

@Component({
  imports: [
    RouterLink,
    OrderHeader,
    ServiceDetails,
    ClientCard,
    ProfessionalCard,
    FinancialSummary,
    ContractTimeline,
  ],
  selector: 'app-order-detail',
  styleUrl: './order-detail.css',
  templateUrl: './order-detail.html',
})
export class OrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly payoutService = inject(PayoutService);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly order = signal<Order | null>(null);
  readonly payment = signal<Payment | null>(null);
  readonly payout = signal<ProfessionalPayout | null>(null);
  readonly timeline = signal<TimelineItem[]>([]);
  readonly actionError = signal<string | null>(null);

  readonly PaymentStatus = PaymentStatus;
  readonly ProfessionalPayoutStatus = ProfessionalPayoutStatus;
  readonly OrderStatus = OrderStatus;
  readonly OrderLocationType = OrderLocationType;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  private load(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.findOne(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
        this.loadPayment(order);
        this.loadPayout(order);
        this.loadTimeline(order.id);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Não foi possível carregar este contrato.');
      },
    });
  }

  private loadPayment(order: Order): void {
    if (order.first_payment) {
      this.payment.set(order.first_payment);
      return;
    }
    this.orderService.getOrderPayments(order.id).subscribe({
      next: (payments) => this.payment.set(payments[0] ?? null),
      error: () => this.payment.set(null),
    });
  }

  private loadPayout(order: Order): void {
    this.payoutService.findAll(order.professional_id).subscribe({
      next: (payouts) => {
        this.payout.set(payouts.find((payout) => payout.order_id === order.id) ?? null);
      },
      error: () => this.payout.set(null),
    });
  }

  private loadTimeline(id: number): void {
    this.orderService.getTimeline(id).subscribe({
      next: (timeline) => {
        const items = timeline.events
          .map((event) => this.toTimelineItem(event))
          .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
        this.timeline.set(items);
      },
      error: () => this.timeline.set([]),
    });
  }

  private toTimelineItem(event: OrderTimelineEvent): TimelineItem {
    if (event.type === 'status_change') {
      const status = event['status'] as OrderStatus | undefined;
      const reason = event['reason'] as string | null | undefined;
      return {
        label: status ? STATUS_EVENT_LABEL[status] : 'Mudança de Estado',
        description: reason ?? '',
        occurredAt: new Date(event.occurred_at),
      };
    }
    const amount = event['amount'] as number | undefined;
    return {
      label: 'Pagamento ao Prestador',
      description: amount ? formatMoney(amount) : '',
      occurredAt: new Date(event.occurred_at),
    };
  }

  statusStyle(status: OrderStatus): StatusStyle {
    return STATUS_STYLES[status];
  }

  paymentStatusLabel(status: PaymentStatus): string {
    return PAYMENT_STATUS_LABEL[status];
  }

  clientAvatar(): string | null {
    return buildImageUrl(this.baseUrl, 'clients', this.order()?.client.image ?? null);
  }

  professionalAvatar(): string | null {
    return buildImageUrl(this.baseUrl, 'professionals', this.order()?.professional.image ?? null);
  }

  formatDate(iso: string): string {
    return formatDate(iso);
  }

  formatShortDate(iso: string): string {
    return formatShortDate(iso);
  }

  formatMoney(amount: number): string {
    return formatMoney(amount);
  }

  clientSince(): string {
    const order = this.order();
    if (!order) {
      return '';
    }
    const date = new Date(order.client.created_at);
    return `Cliente desde ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
  }

  professionalProfession(): string {
    const professions = this.order()?.professional.professions ?? [];
    return professions[0]?.name ?? 'Profissional';
  }

  modalityLabel(): string {
    return this.order()?.location_type === OrderLocationType.CLIENT_ADDRESS
      ? 'Ao Domicílio'
      : 'No Local do Prestador';
  }

  clientLocation(): string | null {
    const address = this.order()?.address;
    return address ? `${address.address}, ${address.municiple}, ${address.province}` : null;
  }

  timelineEntries(): TimelineEntry[] {
    return this.timeline().map((item) => ({
      label: item.label,
      description: item.description,
      date: formatShortDate(item.occurredAt.toISOString()),
    }));
  }

  canCancel(): boolean {
    const status = this.order()?.status;
    return status === OrderStatus.REQUESTED || status === OrderStatus.ACCEPTED;
  }

  canPayProfessional(): boolean {
    return this.payout()?.status === ProfessionalPayoutStatus.PENDING;
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order || !confirm('Tem a certeza que quer cancelar este contrato?')) {
      return;
    }
    this.actionError.set(null);
    this.orderService.cancel(order.id).subscribe({
      next: (updated) => this.order.set(updated),
      error: () => this.actionError.set('Não foi possível cancelar o contrato.'),
    });
  }

  payProfessional(): void {
    const payout = this.payout();
    if (!payout || !confirm('Confirma o pagamento ao prestador?')) {
      return;
    }
    this.actionError.set(null);
    this.payoutService.markPaid(payout.id).subscribe({
      next: (updated) => this.payout.set(updated),
      error: () => this.actionError.set('Não foi possível marcar o pagamento como concluído.'),
    });
  }
}
