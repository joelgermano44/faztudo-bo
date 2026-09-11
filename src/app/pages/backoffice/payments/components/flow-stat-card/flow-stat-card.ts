import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-flow-stat-card',
  styleUrl: './flow-stat-card.css',
  templateUrl: './flow-stat-card.html',
})
export class FlowStatCard {
  readonly icon = input.required<string>();
  readonly iconBg = input('bg-[#E9F7E4]');
  readonly title = input.required<string>();
  readonly value = input.required<string>();
  readonly valueColor = input('text-[#0B2E13]');
  readonly subtitle = input('');
  readonly trend = input<string | null>(null);
  readonly trendPositive = input(true);
}
