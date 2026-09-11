import { Component, computed, effect, input, output, signal } from '@angular/core';

export type AddressStatus = 'Ativa' | 'Inativa';

export interface AddressRow {
  id: number;
  street: string;
  municiple: string;
  province: string;
  coordinates: string | null;
  usageCount: number;
  createdAt: string;
  createdAtIso: string;
  status: AddressStatus;
}

const PAGE_SIZE = 8;

@Component({
  imports: [],
  selector: 'app-addresses-table',
  styleUrl: './addresses-table.css',
  templateUrl: './addresses-table.html',
})
export class AddressesTable {
  readonly addresses = input<AddressRow[]>([]);

  readonly view = output<number>();
  readonly edit = output<number>();
  readonly remove = output<number>();

  readonly page = signal(1);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.addresses().length / PAGE_SIZE)),
  );

  readonly pagedAddresses = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.addresses().slice(start, start + PAGE_SIZE);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, index) => index + 1);
  });

  readonly rangeStart = computed(() =>
    this.addresses().length === 0 ? 0 : (this.currentPage() - 1) * PAGE_SIZE + 1,
  );

  readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * PAGE_SIZE, this.addresses().length),
  );

  private currentPage(): number {
    return Math.min(this.page(), this.totalPages());
  }

  constructor() {
    effect(() => {
      this.addresses();
      this.page.set(1);
    });
  }

  statusBadge(status: AddressStatus): string {
    return status === 'Ativa' ? 'bg-primary text-[#161E00]' : 'bg-gray-100 text-[#436746]';
  }

  goToPage(page: number): void {
    this.page.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }
}
