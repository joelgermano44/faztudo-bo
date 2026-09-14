import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PaymentService } from '../../../../../../core/features/payments/services/payment.service';
import { PaymentStatus } from '../../../../../../core/features/payments/models/payment.model';
import { PayoutService } from '../../../../../../core/features/payouts/services/payout.service';
import { Skeleton } from '../../../../../shared/ui/skeleton/skeleton';
import { EmptyState } from '../../../../../shared/ui/empty-state/empty-state';

interface PaymentItem {
  label: string;
  value: string;
  dotColor: string;
  valueColor?: string;
}

function formatKz(amount: number): string {
  return `${amount.toLocaleString('de-DE', { maximumFractionDigits: 0 })} KZ`;
}

@Component({
  imports: [Skeleton, EmptyState],
  selector: 'app-payment-summary',
  styleUrl: './payment-summary.css',
  templateUrl: './payment-summary.html',
})
export class PaymentSummary {
  private readonly paymentService = inject(PaymentService);
  private readonly payoutService = inject(PayoutService);

  title = 'Resumo de Pagamentos';

  readonly items = signal<PaymentItem[]>([
    {
      label: 'Pendentes',
      value: formatKz(0),
      dotColor: '#727970',
    },
    {
      label: 'Realizados/Mês',
      value: formatKz(0),
      dotColor: '#A9D1A9',
    },
    {
      label: 'Comissões Plataforma',
      value: formatKz(0),
      dotColor: '#0B2E13',
    },
  ]);

  readonly isLoading = signal(true);
  readonly loadError = signal(false);

  constructor() {
    this.loadSummary();
  }

  private loadSummary(): void {
    this.isLoading.set(true);
    this.loadError.set(false);

    forkJoin({
      payments: this.paymentService.findAll(),
      payouts: this.payoutService.findAll(),
    }).subscribe({
      next: ({ payments, payouts }) => {
        this.isLoading.set(false);

        const now = new Date();
        const pending = payments
          .filter((payment) => payment.status === PaymentStatus.PENDING)
          .reduce((sum, payment) => sum + payment.amount, 0);
        const doneThisMonth = payments
          .filter((payment) => {
            const createdAt = new Date(payment.created_at);
            return (
              payment.status === PaymentStatus.SUCCESS &&
              createdAt.getFullYear() === now.getFullYear() &&
              createdAt.getMonth() === now.getMonth()
            );
          })
          .reduce((sum, payment) => sum + payment.amount, 0);
        const commissions = payouts.reduce(
          (sum, payout) => sum + (payout.commission_amount ?? 0),
          0,
        );

        this.items.update((items) => [
          { ...items[0], value: formatKz(pending) },
          { ...items[1], value: formatKz(doneThisMonth) },
          { ...items[2], value: formatKz(commissions) },
        ]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set(true);
        console.error('Erro ao carregar resumo de pagamentos', err);
      },
    });
  }

  retryLoad(): void {
    this.loadSummary();
  }
}
