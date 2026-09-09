import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-order-header',
  styleUrl: './order-header.css',
  templateUrl: './order-header.html',
})
export class OrderHeader {
  readonly orderId = input.required<number>();
  readonly statusLabel = input.required<string>();
  readonly statusBadgeClass = input.required<string>();
  readonly serviceName = input.required<string>();
  readonly canCancel = input(false);
  readonly canPayProfessional = input(false);
  readonly actionError = input<string | null>(null);

  readonly cancel = output<void>();
  readonly payProfessional = output<void>();
}
