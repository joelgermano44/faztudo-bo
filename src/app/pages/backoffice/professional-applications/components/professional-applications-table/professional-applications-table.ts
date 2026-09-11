import { Component, computed, effect, input, output, signal } from '@angular/core';
import { ProfessionalApplicationStatus } from '../../../../../../core/features/professional-applications/models/professional-application.model';

export interface ApplicationRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  bi: string;
  avatar: string | null;
  professionNames: string[];
  submittedAt: string;
  status: ProfessionalApplicationStatus;
}

interface StatusStyle {
  label: string;
  badge: string;
}

const STATUS_STYLES: Record<ProfessionalApplicationStatus, StatusStyle> = {
  [ProfessionalApplicationStatus.SUBMETIDA]: {
    label: 'Submetida',
    badge: 'bg-gray-100 text-gray-600',
  },
  [ProfessionalApplicationStatus.EM_ANALISE]: {
    label: 'Em Análise',
    badge: 'bg-amber-50 text-amber-700',
  },
  [ProfessionalApplicationStatus.APROVADA]: {
    label: 'Aprovada',
    badge: 'bg-[#80F98B33] text-emerald-700',
  },
  [ProfessionalApplicationStatus.REJEITADA]: {
    label: 'Rejeitada',
    badge: 'bg-red-50 text-red-600',
  },
};

const PAGE_SIZE = 8;

@Component({
  imports: [],
  selector: 'app-professional-applications-table',
  styleUrl: './professional-applications-table.css',
  templateUrl: './professional-applications-table.html',
})
export class ProfessionalApplicationsTable {
  readonly applications = input<ApplicationRow[]>([]);

  readonly view = output<number>();

  readonly page = signal(1);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.applications().length / PAGE_SIZE)),
  );

  readonly pagedApplications = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.applications().slice(start, start + PAGE_SIZE);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, index) => index + 1);
  });

  readonly rangeStart = computed(() =>
    this.applications().length === 0 ? 0 : (this.currentPage() - 1) * PAGE_SIZE + 1,
  );

  readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * PAGE_SIZE, this.applications().length),
  );

  private currentPage(): number {
    return Math.min(this.page(), this.totalPages());
  }

  constructor() {
    effect(() => {
      this.applications();
      this.page.set(1);
    });
  }

  statusStyle(status: ProfessionalApplicationStatus): StatusStyle {
    return STATUS_STYLES[status];
  }

  professionsLabel(row: ApplicationRow): string {
    if (row.professionNames.length === 0) {
      return '—';
    }
    const [first, ...rest] = row.professionNames;
    return rest.length > 0 ? `${first} +${rest.length}` : first;
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
