import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { API_BASE_URL } from '../../../../../core/shared/http/api-config';
import { OrderService } from '../../../../../core/features/orders/services/order.service';
import { PayoutService } from '../../../../../core/features/payouts/services/payout.service';
import {
  Order,
  OrderChatMessage,
  OrderConversation,
  OrderLocationType,
  OrderStatus,
  OrderTimelineEvent,
} from '../../../../../core/features/orders/models/order.model';
import { Payment, PaymentStatus } from '../../../../../core/features/payments/models/payment.model';
import { ProfessionalPayout, ProfessionalPayoutStatus } from '../../../../../core/features/payouts/models/payout.model';
import { OrderHeader } from './components/order-header/order-header';
import { ServiceDetails } from './components/service-details/service-details';
import { ClientCard } from './components/client-card/client-card';
import { ProfessionalCard } from './components/professional-card/professional-card';
import { FinancialSummary } from './components/financial-summary/financial-summary';
import { ContractTimeline, TimelineEntry } from './components/contract-timeline/contract-timeline';
import { OrderChat } from './components/order-chat/order-chat';
import { Modal } from '../../../../shared/ui/modal/modal';
import {
  buildAvatarUrl as buildImageUrl,
  buildMediaUrl,
} from '../../../../../core/shared/util/media-url';

type PendingActionKind = 'cancel' | 'reject' | 'pay';

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
  [OrderStatus.ACCEPTED]: { label: 'Aceito', badge: 'bg-blue-50 text-blue-600' },
  [OrderStatus.IN_PROGRESS]: { label: 'Em Execução', badge: 'bg-[#80F98B33] text-emerald-700' },
  [OrderStatus.DONE]: { label: 'Concluído', badge: 'bg-teal-50 text-teal-700' },
  [OrderStatus.CANCELED]: { label: 'Cancelado', badge: 'bg-gray-100 text-gray-500' },
  [OrderStatus.REJECTED]: { label: 'Rejeitado', badge: 'bg-red-50 text-red-600' },
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
    OrderChat,
    Modal,
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

  readonly PaymentStatus = PaymentStatus;
  readonly ProfessionalPayoutStatus = ProfessionalPayoutStatus;
  readonly OrderStatus = OrderStatus;
  readonly OrderLocationType = OrderLocationType;

  readonly pendingAction = signal<PendingActionKind | null>(null);
  readonly rejectReason = signal('');
  readonly isProcessingAction = signal(false);
  readonly isActionModalOpen = computed(() => this.pendingAction() !== null);

  readonly activeTab = signal<'details' | 'chat'>('details');
  readonly chatLoaded = signal(false);
  readonly chatLoading = signal(false);
  readonly chatConversation = signal<OrderConversation | null>(null);
  readonly chatMessages = signal<OrderChatMessage[]>([]);
  readonly chatNextCursor = signal<number | null>(null);
  readonly chatHasMore = signal(false);

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

  serviceImage(): string | null {
    const image = this.order()?.service.image;
    return image ? buildMediaUrl(this.baseUrl, image) : null;
  }

  serviceGallery(): string[] {
    const images = this.order()?.service.images ?? [];
    return images.map((media) => buildMediaUrl(this.baseUrl, media));
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

  setTab(tab: 'details' | 'chat'): void {
    this.activeTab.set(tab);
    if (tab === 'chat' && !this.chatLoaded()) {
      this.loadChat();
    }
  }

  tabClass(tab: 'details' | 'chat'): string {
    return this.activeTab() === tab
      ? 'text-[#0B2E13] border-b-2 border-[#0B2E13]'
      : 'text-gray-500 border-b-2 border-transparent';
  }

  private loadChat(before?: number): void {
    const order = this.order();
    if (!order) {
      return;
    }

    this.chatLoading.set(true);
    this.orderService.getChat(order.id, before ? { before } : undefined).subscribe({
      next: (view) => {
        this.chatLoading.set(false);
        this.chatLoaded.set(true);
        this.chatConversation.set(view.conversation);
        this.chatMessages.update((current) =>
          before ? [...view.messages.data, ...current] : view.messages.data,
        );
        this.chatNextCursor.set(view.messages.next_cursor);
        this.chatHasMore.set(view.messages.has_more);
      },
      error: (err) => {
        this.chatLoading.set(false);
        this.chatLoaded.set(true);
        toast.error('Não foi possível carregar a conversa', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }

  loadMoreChat(): void {
    const cursor = this.chatNextCursor();
    if (cursor !== null && !this.chatLoading()) {
      this.loadChat(cursor);
    }
  }

  canCancel(): boolean {
    const status = this.order()?.status;
    return status === OrderStatus.REQUESTED || status === OrderStatus.ACCEPTED;
  }

  canReject(): boolean {
    return this.order()?.status === OrderStatus.REQUESTED;
  }

  canPayProfessional(): boolean {
    return this.payout()?.status === ProfessionalPayoutStatus.PENDING;
  }

  requestCancel(): void {
    this.pendingAction.set('cancel');
  }

  requestReject(): void {
    this.rejectReason.set('');
    this.pendingAction.set('reject');
  }

  requestPay(): void {
    this.pendingAction.set('pay');
  }

  cancelPendingAction(): void {
    if (this.isProcessingAction()) {
      return;
    }
    this.pendingAction.set(null);
  }

  actionModalTitle(): string {
    switch (this.pendingAction()) {
      case 'cancel':
        return 'Cancelar contrato';
      case 'reject':
        return 'Rejeitar contrato';
      case 'pay':
        return 'Pagar prestador';
      default:
        return '';
    }
  }

  confirmPendingAction(): void {
    const action = this.pendingAction();
    const order = this.order();
    if (!action || !order || this.isProcessingAction()) {
      return;
    }

    if (action === 'reject') {
      const reason = this.rejectReason().trim();
      if (!reason) {
        return;
      }
      this.isProcessingAction.set(true);
      this.orderService.reject(order.id, { reason }).subscribe({
        next: (updated) => {
          this.isProcessingAction.set(false);
          this.pendingAction.set(null);
          this.order.set(updated);
          toast.success('Contrato rejeitado');
        },
        error: (err) => {
          this.isProcessingAction.set(false);
          toast.error('Não foi possível rejeitar o contrato', {
            description: err?.error?.message ?? 'Tente novamente mais tarde.',
          });
        },
      });
      return;
    }

    if (action === 'cancel') {
      this.isProcessingAction.set(true);
      this.orderService.cancel(order.id).subscribe({
        next: (updated) => {
          this.isProcessingAction.set(false);
          this.pendingAction.set(null);
          this.order.set(updated);
          toast.success('Contrato cancelado');
        },
        error: (err) => {
          this.isProcessingAction.set(false);
          toast.error('Não foi possível cancelar o contrato', {
            description: err?.error?.message ?? 'Tente novamente mais tarde.',
          });
        },
      });
      return;
    }

    const payout = this.payout();
    if (!payout) {
      return;
    }
    this.isProcessingAction.set(true);
    this.payoutService.markPaid(payout.id).subscribe({
      next: (updated) => {
        this.isProcessingAction.set(false);
        this.pendingAction.set(null);
        this.payout.set(updated);
        toast.success('Pagamento ao prestador confirmado');
      },
      error: (err) => {
        this.isProcessingAction.set(false);
        toast.error('Não foi possível marcar o pagamento como concluído', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
