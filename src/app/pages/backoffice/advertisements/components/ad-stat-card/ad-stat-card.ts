import { Component, input } from '@angular/core';

export type AdStatBadgeDirection = 'up' | 'down' | 'neutral';

@Component({
  imports: [],
  selector: 'app-ad-stat-card',
  styleUrl: './ad-stat-card.css',
  templateUrl: './ad-stat-card.html',
})
export class AdStatCard {
  readonly icon = input.required<string>();
  readonly iconBg = input('bg-[#E9F7E4]');
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly unit = input('');
  readonly badge = input<string | null>(null);
  readonly badgeDirection = input<AdStatBadgeDirection>('up');

  readonly badgeClass = (): string => {
    if (this.badgeDirection() === 'down') {
      return 'bg-red-50 text-red-700';
    }
    if (this.badgeDirection() === 'neutral') {
      return 'bg-gray-100 text-gray-500';
    }
    return 'bg-[#26611F] text-[#B1F4A0]';
  };
}
