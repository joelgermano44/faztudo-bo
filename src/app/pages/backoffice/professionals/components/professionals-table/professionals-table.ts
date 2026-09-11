import { Component, computed, effect, input, output, signal } from '@angular/core';
import { ProfessionalAvailabilityStatus } from '../../../../../../core/features/professionals/models/professional.model';

export interface ProfessionalRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  professions: string[];
  averageRating: number | null;
  ratingsCount: number;
  availability: ProfessionalAvailabilityStatus;
  createdAt: string;
  createdAtIso: string;
}

interface AvailabilityStyle {
  label: string;
  badge: string;
}

const AVAILABILITY_STYLES: Record<ProfessionalAvailabilityStatus, AvailabilityStyle> = {
  [ProfessionalAvailabilityStatus.AVAILABLE]: {
    label: 'Disponível',
    badge: 'bg-[#80F98B33] text-emerald-700',
  },
  [ProfessionalAvailabilityStatus.UNAVAILABLE]: {
    label: 'Indisponível',
    badge: 'bg-gray-100 text-gray-500',
  },
};

const PAGE_SIZE = 8;

@Component({
  imports: [],
  selector: 'app-professionals-table',
  styleUrl: './professionals-table.css',
  templateUrl: './professionals-table.html',
})
export class ProfessionalsTable {
  readonly professionals = input<ProfessionalRow[]>([]);

  readonly view = output<number>();
  readonly edit = output<number>();
  readonly toggleAvailability = output<number>();
  readonly remove = output<number>();

  readonly page = signal(1);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.professionals().length / PAGE_SIZE)),
  );

  readonly pagedProfessionals = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.professionals().slice(start, start + PAGE_SIZE);
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
    this.professionals().length === 0 ? 0 : (this.currentPage() - 1) * PAGE_SIZE + 1,
  );

  readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * PAGE_SIZE, this.professionals().length),
  );

  private currentPage(): number {
    return Math.min(this.page(), this.totalPages());
  }

  constructor() {
    effect(() => {
      this.professionals();
      this.page.set(1);
    });
  }

  availabilityStyle(status: ProfessionalAvailabilityStatus): AvailabilityStyle {
    return AVAILABILITY_STYLES[status];
  }

  isAvailable(status: ProfessionalAvailabilityStatus): boolean {
    return status === ProfessionalAvailabilityStatus.AVAILABLE;
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
