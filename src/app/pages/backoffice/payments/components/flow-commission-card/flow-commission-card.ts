import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-flow-commission-card',
  styleUrl: './flow-commission-card.css',
  templateUrl: './flow-commission-card.html',
})
export class FlowCommissionCard {
  readonly title = input('Total Comissões (Plataforma)');
  readonly value = input.required<string>();
  /** % da comissão total já realizada (repasses com status PAID) face ao total (PAID + PENDING). */
  readonly paidPercent = input(0);
}
