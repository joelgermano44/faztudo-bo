import { Component, computed, effect, input, output, signal } from '@angular/core';

export interface AdvertisementRow {
  id: number;
  title: string;
  description: string | null;
  link: string;
  isActive: boolean;
  clicks: number;
  thumbnail: string | null;
  createdAt: string;
}

const PAGE_SIZE = 8;

@Component({
  imports: [],
  selector: 'app-advertisements-table',
  styleUrl: './advertisements-table.css',
  templateUrl: './advertisements-table.html',
})
export class AdvertisementsTable {
  readonly advertisements = input<AdvertisementRow[]>([]);

  readonly view = output<number>();
  readonly edit = output<number>();
  readonly toggleActive = output<number>();
  readonly remove = output<number>();

  readonly page = signal(1);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.advertisements().length / PAGE_SIZE)),
  );

  readonly pagedAdvertisements = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.advertisements().slice(start, start + PAGE_SIZE);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, index) => index + 1);
  });

  readonly rangeStart = computed(() =>
    this.advertisements().length === 0 ? 0 : (this.currentPage() - 1) * PAGE_SIZE + 1,
  );

  readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * PAGE_SIZE, this.advertisements().length),
  );

  private currentPage(): number {
    return Math.min(this.page(), this.totalPages());
  }

  constructor() {
    effect(() => {
      this.advertisements();
      this.page.set(1);
    });
  }

  statusBadge(isActive: boolean): string {
    return isActive ? 'bg-primary text-[#161E00]' : 'bg-gray-100 text-[#436746]';
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
