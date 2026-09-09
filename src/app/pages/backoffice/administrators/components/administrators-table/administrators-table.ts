import { Component, computed, effect, input, signal } from '@angular/core';

export type AdminStatus = 'Ativo' | 'Inativo';

export interface AdminRow {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  bi: string;
  birthdate: string;
  avatar: string | null;
  status: AdminStatus;
}

interface StatusStyle {
  badge: string;
}

const STATUS_STYLES: Record<AdminStatus, StatusStyle> = {
  Ativo: { badge: 'bg-[#80F98B33] text-emerald-700' },
  Inativo: { badge: 'bg-gray-100 text-[#436746]' },
};

const PAGE_SIZE = 8;

@Component({
  imports: [],
  selector: 'app-administrators-table',
  styleUrl: './administrators-table.css',
  templateUrl: './administrators-table.html',
})
export class AdministratorsTable {
  readonly admins = input<AdminRow[]>([]);

  readonly page = signal(1);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.admins().length / PAGE_SIZE)));

  readonly pagedAdmins = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.admins().slice(start, start + PAGE_SIZE);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, index) => index + 1);
  });

  readonly rangeStart = computed(() =>
    this.admins().length === 0 ? 0 : (this.currentPage() - 1) * PAGE_SIZE + 1,
  );

  readonly rangeEnd = computed(() => Math.min(this.currentPage() * PAGE_SIZE, this.admins().length));

  private currentPage(): number {
    return Math.min(this.page(), this.totalPages());
  }

  constructor() {
    effect(() => {
      this.admins();
      this.page.set(1);
    });
  }

  statusStyle(status: AdminStatus): StatusStyle {
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
