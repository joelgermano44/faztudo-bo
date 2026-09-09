import { Component, input } from '@angular/core';

export type ServiceCardStatus = 'Ativo' | 'Inativo';

interface StatusStyle {
  badge: string;
}

const STATUS_STYLES: Record<ServiceCardStatus, StatusStyle> = {
  Ativo: { badge: 'bg-[#80F98B33] text-emerald-700' },
  Inativo: { badge: 'bg-gray-100 text-[#436746]' },
};

@Component({
  imports: [],
  selector: 'app-service-card',
  styleUrl: './service-card.css',
  templateUrl: './service-card.html',
})
export class ServiceCard {
  readonly name = input.required<string>();
  readonly description = input.required<string>();
  readonly image = input<string | null>(null);
  readonly gallery = input<string[]>([]);
  readonly category = input.required<string>();
  readonly status = input.required<ServiceCardStatus>();

  statusBadge(): string {
    return STATUS_STYLES[this.status()].badge;
  }
}
