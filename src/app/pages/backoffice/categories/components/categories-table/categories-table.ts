import { Component, computed, effect, input, output, signal } from '@angular/core';

export type CategoryStatus = 'Ativa' | 'Inativa';

export interface CategoryRow {
  id: number;
  name: string;
  servicesCount: number;
  createdAt: string;
  status: CategoryStatus;
}

const PAGE_SIZE = 8;

@Component({
  imports: [],
  selector: 'app-categories-table',
  styleUrl: './categories-table.css',
  templateUrl: './categories-table.html',
})
export class CategoriesTable {
  readonly categories = input<CategoryRow[]>([]);

  readonly view = output<number>();
  readonly edit = output<number>();
  readonly remove = output<number>();

  readonly page = signal(1);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.categories().length / PAGE_SIZE)),
  );

  readonly pagedCategories = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.categories().slice(start, start + PAGE_SIZE);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, index) => index + 1);
  });

  readonly rangeStart = computed(() =>
    this.categories().length === 0 ? 0 : (this.currentPage() - 1) * PAGE_SIZE + 1,
  );

  readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * PAGE_SIZE, this.categories().length),
  );

  private currentPage(): number {
    return Math.min(this.page(), this.totalPages());
  }

  constructor() {
    effect(() => {
      this.categories();
      this.page.set(1);
    });
  }

  statusBadge(status: CategoryStatus): string {
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
