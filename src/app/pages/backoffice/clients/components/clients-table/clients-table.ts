import { Component, computed, effect, input, output, signal } from '@angular/core';

export type ClientStatus = 'Ativo' | 'Inativo';

export interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  bi: string;
  avatar: string | null;
  contractsCount: number;
  createdAt: string;
  createdAtIso: string;
  status: ClientStatus;
}

interface StatusStyle {
  badge: string;
}

const STATUS_STYLES: Record<ClientStatus, StatusStyle> = {
  Ativo: { badge: 'bg-primary text-[#161E00]' },
  Inativo: { badge: 'bg-gray-100 text-[#436746]' },
};

const PAGE_SIZE = 8;

@Component({
  imports: [],
  selector: 'app-clients-table',
  styleUrl: './clients-table.css',
  templateUrl: './clients-table.html',
})
export class ClientsTable {
  readonly clients = input<ClientRow[]>([]);

  readonly view = output<string>();
  readonly edit = output<string>();
  readonly remove = output<string>();

  readonly page = signal(1);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.clients().length / PAGE_SIZE)));

  readonly pagedClients = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.clients().slice(start, start + PAGE_SIZE);
  });

  readonly pageItems = computed<(number | 'ellipsis')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const items = new Set<number>([1, total, current, current - 1, current + 1]);
    const sorted = Array.from(items)
      .filter((page) => page >= 1 && page <= total)
      .sort((a, b) => a - b);

    const result: (number | 'ellipsis')[] = [];
    sorted.forEach((page, index) => {
      if (index > 0 && page - sorted[index - 1] > 1) {
        result.push('ellipsis');
      }
      result.push(page);
    });
    return result;
  });

  readonly rangeStart = computed(() =>
    this.clients().length === 0 ? 0 : (this.currentPage() - 1) * PAGE_SIZE + 1,
  );

  readonly rangeEnd = computed(() => Math.min(this.currentPage() * PAGE_SIZE, this.clients().length));

  private currentPage(): number {
    return Math.min(this.page(), this.totalPages());
  }

  constructor() {
    effect(() => {
      this.clients();
      this.page.set(1);
    });
  }

  statusStyle(status: ClientStatus): StatusStyle {
    return STATUS_STYLES[status];
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
