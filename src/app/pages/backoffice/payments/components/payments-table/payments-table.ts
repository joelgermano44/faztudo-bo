import { Component, computed, effect, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { ProfessionalPayoutStatus } from '../../../../../../core/features/payouts/models/payout.model';

export interface FinancialFlowRow {
  payoutId: number;
  orderId: number;
  reference: string;
  clientName: string;
  clientAvatar: string | null;
  professionalName: string;
  professionalProfession: string;
  totalAmount: number;
  commissionAmount: number | null;
  commissionPercent: number | null;
  payoutAmount: number;
  methodName: string;
  paymentReceived: boolean;
  createdAt: string;
  createdAtIso: string;
  status: ProfessionalPayoutStatus;
}

interface StatusStyle {
  label: string;
  badge: string;
  icon: string;
}

const STATUS_STYLES: Record<ProfessionalPayoutStatus, StatusStyle> = {
  [ProfessionalPayoutStatus.PENDING]: {
    label: 'Pendente',
    badge: 'bg-amber-50 text-[#CCA830]',
    icon: '/icons/payments/status-pending.svg',
  },
  [ProfessionalPayoutStatus.PAID]: {
    label: 'Pago',
    badge: 'bg-[#80F98B33] text-emerald-700',
    icon: '/icons/payments/status-paid.svg',
  },
};

const PAGE_SIZE = 10;

function formatMoney(amount: number): string {
  return amount.toLocaleString('de-DE', { maximumFractionDigits: 0 });
}

@Component({
  imports: [],
  selector: 'app-payments-table',
  styleUrl: './payments-table.css',
  templateUrl: './payments-table.html',
})
export class PaymentsTable {
  private readonly elementRef = inject(ElementRef);

  readonly rows = input<FinancialFlowRow[]>([]);

  readonly view = output<number>();
  readonly markPaid = output<number>();

  readonly page = signal(1);
  readonly openMenuId = signal<number | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.rows().length / PAGE_SIZE)));

  readonly pagedRows = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.rows().slice(start, start + PAGE_SIZE);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, index) => index + 1);
  });

  readonly rangeStart = computed(() => (this.rows().length === 0 ? 0 : (this.currentPage() - 1) * PAGE_SIZE + 1));

  readonly rangeEnd = computed(() => Math.min(this.currentPage() * PAGE_SIZE, this.rows().length));

  private currentPage(): number {
    return Math.min(this.page(), this.totalPages());
  }

  constructor() {
    effect(() => {
      this.rows();
      this.page.set(1);
    });
  }

  statusStyle(status: ProfessionalPayoutStatus): StatusStyle {
    return STATUS_STYLES[status];
  }

  formatMoney(amount: number): string {
    return formatMoney(amount);
  }

  toggleMenu(id: number): void {
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.openMenuId.set(null);
    }
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
