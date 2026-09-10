import { Component, input, output } from '@angular/core';

export type ServiceCardStatus = 'Activo' | 'Inactivo';

interface StatusStyle {
  badge: string;
}

const STATUS_STYLES: Record<ServiceCardStatus, StatusStyle> = {
  Activo: { badge: 'bg-primary text-[#161E00]' },
  Inactivo: { badge: 'bg-gray-100 text-[#436746]' },
};

@Component({
  imports: [],
  selector: 'app-service-card',
  styleUrl: './service-card.css',
  templateUrl: './service-card.html',
})
export class ServiceCard {
  readonly id = input.required<number>();
  readonly name = input.required<string>();
  readonly description = input.required<string>();
  readonly image = input<string | null>(null);
  readonly gallery = input<string[]>([]);
  readonly category = input.required<string>();
  readonly status = input.required<ServiceCardStatus>();

  readonly edit = output<number>();
  readonly view = output<number>();
  readonly remove = output<number>();

  statusBadge(): string {
    return STATUS_STYLES[this.status()].badge;
  }
}
