import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { FlowStatCard } from './components/flow-stat-card/flow-stat-card';
import { FlowCommissionCard } from './components/flow-commission-card/flow-commission-card';
import { FinancialFlowRow, PaymentsTable } from './components/payments-table/payments-table';
import { PaymentViewDrawer } from './components/payment-view-drawer/payment-view-drawer';
import { PayoutService } from '../../../../core/features/payouts/services/payout.service';
import { ProfessionalPayout, ProfessionalPayoutStatus } from '../../../../core/features/payouts/models/payout.model';
import { PaymentService } from '../../../../core/features/payments/services/payment.service';
import { Payment, PaymentStatus } from '../../../../core/features/payments/models/payment.model';
import { OrderService } from '../../../../core/features/orders/services/order.service';
import { Order } from '../../../../core/features/orders/models/order.model';
import { WalletService } from '../../../../core/features/wallet/services/wallet.service';
import { PayoutStatusHistoryItem } from '../../../../core/features/wallet/models/wallet.model';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';
import { buildAvatarUrl } from '../../../../core/shared/util/media-url';

type StatusFilter = 'Todos' | ProfessionalPayoutStatus;
type DateSort = 'recent' | 'oldest';
type PeriodFilter = 'all' | 'thisMonth' | 'lastMonth';

function isSameMonth(iso: string, reference: Date): boolean {
  const date = new Date(iso);
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

function formatMoney(amount: number): string {
  return amount.toLocaleString('de-DE', { maximumFractionDigits: 0 });
}

function csvEscape(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

@Component({
  imports: [TitleHeader, FlowStatCard, FlowCommissionCard, PaymentsTable, PaymentViewDrawer],
  selector: 'app-payments',
  styleUrl: './payments.css',
  templateUrl: './payments.html',
})
export class Payments {
  private readonly payoutService = inject(PayoutService);
  private readonly paymentService = inject(PaymentService);
  private readonly orderService = inject(OrderService);
  private readonly walletService = inject(WalletService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly elementRef = inject(ElementRef);

  readonly filters: StatusFilter[] = ['Todos', ProfessionalPayoutStatus.PENDING, ProfessionalPayoutStatus.PAID];

  readonly filterLabels: Record<StatusFilter, string> = {
    Todos: 'Todos os Estados',
    [ProfessionalPayoutStatus.PENDING]: 'Pendentes',
    [ProfessionalPayoutStatus.PAID]: 'Pagos',
  };

  readonly dateSorts: DateSort[] = ['recent', 'oldest'];
  readonly dateSortLabels: Record<DateSort, string> = {
    recent: 'Mais recentes',
    oldest: 'Mais antigos',
  };

  readonly periodFilters: PeriodFilter[] = ['all', 'thisMonth', 'lastMonth'];
  readonly periodFilterLabels: Record<PeriodFilter, string> = {
    all: 'Todo o Período',
    thisMonth: 'Este Mês',
    lastMonth: 'Mês Passado',
  };

  readonly activeFilter = signal<StatusFilter>('Todos');
  readonly dateSort = signal<DateSort>('recent');
  readonly periodFilter = signal<PeriodFilter>('thisMonth');
  readonly methodFilter = signal('Todos');
  readonly isStatusMenuOpen = signal(false);
  readonly isDateMenuOpen = signal(false);
  readonly isTableStatusMenuOpen = signal(false);
  readonly isPeriodMenuOpen = signal(false);
  readonly isMethodMenuOpen = signal(false);
  readonly searchTerm = signal('');

  private readonly payouts = signal<ProfessionalPayout[]>([]);
  private readonly payments = signal<Payment[]>([]);
  private readonly ordersById = signal<Map<number, Order>>(new Map());

  readonly isViewDrawerOpen = signal(false);
  readonly viewingPayoutId = signal<number | null>(null);
  readonly viewingHistory = signal<PayoutStatusHistoryItem[]>([]);
  readonly historyLoading = signal(false);

  readonly rows = computed<FinancialFlowRow[]>(() => {
    const orders = this.ordersById();
    return this.payouts().map((payout) => this.toRow(payout, orders));
  });

  readonly methodOptions = computed(() => {
    const methods = new Set(
      this.rows()
        .map((row) => row.methodName)
        .filter((name) => name && name !== '—'),
    );
    return ['Todos', ...Array.from(methods)];
  });

  readonly filteredRows = computed<FinancialFlowRow[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();
    const sort = this.dateSort();
    const period = this.periodFilter();
    const method = this.methodFilter();
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return this.rows()
      .filter((row) => filter === 'Todos' || row.status === filter)
      .filter((row) => method === 'Todos' || row.methodName === method)
      .filter((row) => {
        if (period === 'all') {
          return true;
        }
        const reference = period === 'thisMonth' ? now : lastMonth;
        return isSameMonth(row.createdAtIso, reference);
      })
      .filter((row) => {
        if (!term) {
          return true;
        }
        return (
          row.reference.toLowerCase().includes(term) ||
          row.clientName.toLowerCase().includes(term) ||
          row.professionalName.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const diff = new Date(a.createdAtIso).getTime() - new Date(b.createdAtIso).getTime();
        return sort === 'recent' ? -diff : diff;
      });
  });

  readonly viewingRow = computed<FinancialFlowRow | null>(() => {
    const id = this.viewingPayoutId();
    return id ? (this.rows().find((row) => row.payoutId === id) ?? null) : null;
  });

  readonly paymentsRealizados = computed(() => {
    const now = new Date();
    return this.payments()
      .filter((payment) => payment.status === PaymentStatus.SUCCESS && isSameMonth(payment.created_at, now))
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
  });

  readonly paymentsRealizadosTrend = computed(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthSum = this.paymentsRealizados();
    const lastMonthSum = this.payments()
      .filter((payment) => payment.status === PaymentStatus.SUCCESS && isSameMonth(payment.created_at, lastMonth))
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    if (lastMonthSum === 0) {
      return thisMonthSum > 0 ? '+100%' : '+0%';
    }
    const variation = ((thisMonthSum - lastMonthSum) / lastMonthSum) * 100;
    const sign = variation >= 0 ? '+' : '';
    return `${sign}${variation.toFixed(0)}%`;
  });

  readonly pendingPayouts = computed(() =>
    this.payouts().filter((payout) => payout.status === ProfessionalPayoutStatus.PENDING),
  );

  readonly pagamentosPendentes = computed(() =>
    this.pendingPayouts().reduce((sum, payout) => sum + Number(payout.amount), 0),
  );

  readonly professionaisAguardando = computed(
    () => new Set(this.pendingPayouts().map((payout) => payout.professional_id)).size,
  );

  readonly totalComissoes = computed(() =>
    this.payouts().reduce((sum, payout) => sum + Number(payout.commission_amount ?? 0), 0),
  );

  /** % da comissão total já realizada: repasses PAID face ao total de repasses (PAID + PENDING). */
  readonly comissoesPagasPercent = computed(() => {
    const payouts = this.payouts();
    if (payouts.length === 0) {
      return 0;
    }
    const total = payouts.reduce((sum, payout) => sum + Number(payout.commission_amount ?? 0), 0);
    if (total === 0) {
      return 0;
    }
    const paid = payouts
      .filter((payout) => payout.status === ProfessionalPayoutStatus.PAID)
      .reduce((sum, payout) => sum + Number(payout.commission_amount ?? 0), 0);
    return Math.round((paid / total) * 100);
  });

  constructor() {
    this.loadData();
  }

  private toRow(payout: ProfessionalPayout, orders: Map<number, Order>): FinancialFlowRow {
    const order = orders.get(payout.order_id);
    const client = order?.client;
    const professional = payout.professional;
    const totalAmount = payout.amount + Number(payout.commission_amount ?? 0);

    return {
      payoutId: payout.id,
      orderId: payout.order_id,
      reference: order?.first_payment?.reference || `#PED-${payout.order_id}`,
      clientName: client?.name ?? 'Cliente removido',
      clientAvatar: client ? buildAvatarUrl(this.baseUrl, 'clients', client.image) : null,
      professionalName: professional?.name ?? 'Profissional removido',
      professionalProfession: order?.service?.name ?? '—',
      totalAmount,
      commissionAmount: payout.commission_amount ?? null,
      commissionPercent: payout.commission_percent ?? null,
      payoutAmount: payout.amount,
      methodName: order?.first_payment?.payment_method?.method_name ?? '—',
      paymentReceived: order?.first_payment?.status === PaymentStatus.SUCCESS,
      createdAt: this.formatDate(payout.created_at),
      createdAtIso: payout.created_at,
      status: payout.status,
    };
  }

  private formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private loadData(): void {
    forkJoin({
      payouts: this.payoutService.findAll(),
      payments: this.paymentService.findAll(),
      orders: this.orderService.findAll(),
    }).subscribe({
      next: ({ payouts, payments, orders }) => {
        this.payouts.set(payouts);
        this.payments.set(payments);
        this.ordersById.set(new Map(orders.map((order) => [order.id, order])));
      },
      error: (err) => console.error('Erro ao carregar fluxo financeiro', err),
    });
  }

  toggleStatusMenu(): void {
    this.isStatusMenuOpen.update((open) => !open);
    this.isDateMenuOpen.set(false);
  }

  toggleDateMenu(): void {
    this.isDateMenuOpen.update((open) => !open);
    this.isStatusMenuOpen.set(false);
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
    this.isStatusMenuOpen.set(false);
  }

  setDateSort(sort: DateSort): void {
    this.dateSort.set(sort);
    this.isDateMenuOpen.set(false);
  }

  toggleTableStatusMenu(): void {
    this.isTableStatusMenuOpen.update((open) => !open);
    this.isPeriodMenuOpen.set(false);
    this.isMethodMenuOpen.set(false);
  }

  togglePeriodMenu(): void {
    this.isPeriodMenuOpen.update((open) => !open);
    this.isTableStatusMenuOpen.set(false);
    this.isMethodMenuOpen.set(false);
  }

  toggleMethodMenu(): void {
    this.isMethodMenuOpen.update((open) => !open);
    this.isTableStatusMenuOpen.set(false);
    this.isPeriodMenuOpen.set(false);
  }

  setTableStatusFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
    this.isTableStatusMenuOpen.set(false);
  }

  setPeriodFilter(period: PeriodFilter): void {
    this.periodFilter.set(period);
    this.isPeriodMenuOpen.set(false);
  }

  setMethodFilter(method: string): void {
    this.methodFilter.set(method);
    this.isMethodMenuOpen.set(false);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isStatusMenuOpen.set(false);
      this.isDateMenuOpen.set(false);
      this.isTableStatusMenuOpen.set(false);
      this.isPeriodMenuOpen.set(false);
      this.isMethodMenuOpen.set(false);
    }
  }

  openViewDrawer(payoutId: number): void {
    this.viewingPayoutId.set(payoutId);
    this.viewingHistory.set([]);
    this.isViewDrawerOpen.set(true);

    const row = this.rows().find((item) => item.payoutId === payoutId);
    if (row) {
      this.historyLoading.set(true);
      this.walletService.getOrderHistory(row.orderId).subscribe({
        next: (history) => {
          this.historyLoading.set(false);
          this.viewingHistory.set(history);
        },
        error: () => this.historyLoading.set(false),
      });
    }
  }

  closeViewDrawer(): void {
    this.isViewDrawerOpen.set(false);
  }

  markPaid(payoutId: number): void {
    this.payoutService.markPaid(payoutId).subscribe({
      next: (updated) => {
        this.payouts.update((current) => current.map((payout) => (payout.id === updated.id ? updated : payout)));
      },
      error: (err) => console.error('Erro ao marcar payout como pago', err),
    });
  }

  exportCsv(): void {
    const header = ['Referência', 'Cliente', 'Profissional', 'Valor Total', 'Comissão', 'Repasse', 'Data', 'Estado'];
    const lines = this.filteredRows().map((row) =>
      [
        row.reference,
        row.clientName,
        row.professionalName,
        formatMoney(row.totalAmount),
        formatMoney(row.commissionAmount ?? 0),
        formatMoney(row.payoutAmount),
        row.createdAt,
        row.status,
      ]
        .map((value) => csvEscape(String(value)))
        .join(';'),
    );

    const csvContent = [header.join(';'), ...lines].join('\n');
    const blob = new Blob([`﻿${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'fluxo-financeiro.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  formatMoney(amount: number): string {
    return formatMoney(amount);
  }
}
