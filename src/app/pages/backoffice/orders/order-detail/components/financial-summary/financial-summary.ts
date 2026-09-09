import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-order-financial-summary',
  styleUrl: './financial-summary.css',
  templateUrl: './financial-summary.html',
})
export class FinancialSummary {
  readonly baseAmount = input.required<string>();
  readonly commissionPercent = input<number | null>(null);
  readonly commissionAmount = input.required<string>();
  readonly totalAmount = input.required<string>();
  readonly paymentStatusLabel = input<string | null>(null);
  readonly paymentReference = input<string | null>(null);
}
