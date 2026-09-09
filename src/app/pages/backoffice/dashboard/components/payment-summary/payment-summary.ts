import { Component, inject, signal } from '@angular/core';
import { PaymentService } from '../../../../../../core/features/payments/services/payment.service';
import { PaymentStatus } from '../../../../../../core/features/payments/models/payment.model';
import { PayoutService } from '../../../../../../core/features/payouts/services/payout.service';

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
  imports: [],
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

  constructor() {
    this.paymentService.findAll().subscribe({
      next: (payments) => {
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

        this.items.update((items) => [
          { ...items[0], value: formatKz(pending) },
          { ...items[1], value: formatKz(doneThisMonth) },
          items[2],
        ]);
      },
      error: (err) => console.error('Erro ao carregar pagamentos', err),
    });

    this.payoutService.findAll().subscribe({
      next: (payouts) => {
        const commissions = payouts.reduce(
          (sum, payout) => sum + (payout.commission_amount ?? 0),
          0,
        );

        this.items.update((items) => [
          items[0],
          items[1],
          { ...items[2], value: formatKz(commissions) },
        ]);
      },
      error: (err) => console.error('Erro ao carregar payouts', err),
    });
  }
}
