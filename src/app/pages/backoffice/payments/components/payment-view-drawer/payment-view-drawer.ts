import { Component, computed, input, output } from '@angular/core';
import { Drawer } from '../../../../../shared/ui/drawer/drawer';
import { ProfessionalPayoutStatus } from '../../../../../../core/features/payouts/models/payout.model';
import { PayoutStatusHistoryItem } from '../../../../../../core/features/wallet/models/wallet.model';
import { FinancialFlowRow } from '../payments-table/payments-table';

interface StatusStyle {
  label: string;
  badge: string;
}

const STATUS_STYLES: Record<ProfessionalPayoutStatus, StatusStyle> = {
  [ProfessionalPayoutStatus.PENDING]: { label: 'Pendente', badge: 'bg-amber-50 text-[#CCA830]' },
  [ProfessionalPayoutStatus.PAID]: { label: 'Pago', badge: 'bg-[#80F98B33] text-emerald-700' },
};

@Component({
  imports: [Drawer],
  selector: 'app-payment-view-drawer',
  styleUrl: './payment-view-drawer.css',
  templateUrl: './payment-view-drawer.html',
})
export class PaymentViewDrawer {
  readonly open = input(false);
  readonly row = input<FinancialFlowRow | null>(null);
  readonly history = input<PayoutStatusHistoryItem[]>([]);
  readonly historyLoading = input(false);

  readonly closed = output<void>();
  readonly markPaid = output<number>();

  readonly statusStyle = computed(() => {
    const row = this.row();
    return row ? STATUS_STYLES[row.status] : null;
  });

  readonly historyStatusStyle = (status: ProfessionalPayoutStatus): StatusStyle => STATUS_STYLES[status];

  requestClose(): void {
    this.closed.emit();
  }

  requestMarkPaid(): void {
    const row = this.row();
    if (row) {
      this.markPaid.emit(row.payoutId);
    }
  }

  formatMoney(amount: number): string {
    return `${amount.toLocaleString('de-DE', { maximumFractionDigits: 0 })} KZ`;
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    return new Date(value).toLocaleString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
