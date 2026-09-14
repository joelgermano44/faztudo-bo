import { Component, computed, effect, input, output, signal } from '@angular/core';
import { ReportStatus } from '../../../../../../core/features/reports/models/report.model';
import { Skeleton } from '../../../../../shared/ui/skeleton/skeleton';
import { EmptyState } from '../../../../../shared/ui/empty-state/empty-state';

export interface ReportRow {
  id: number;
  orderId: number;
  reason: string;
  description: string;
  status: ReportStatus;
  resolutionNote: string | null;
  createdAt: string;
  createdAtIso: string;
  client: { id: string; name: string; avatar: string | null };
  professional: { id: number; name: string; avatar: string | null };
}

interface StatusStyle {
  label: string;
  badge: string;
}

const STATUS_STYLES: Record<ReportStatus, StatusStyle> = {
  [ReportStatus.SUBMITTED]: { label: 'Submetida', badge: 'bg-gray-100 text-gray-600' },
  [ReportStatus.IN_ANALYSIS]: { label: 'Em Análise', badge: 'bg-amber-50 text-amber-700' },
  [ReportStatus.RESOLVED]: { label: 'Resolvida', badge: 'bg-[#80F98B33] text-emerald-700' },
};

const PAGE_SIZE = 8;

@Component({
  imports: [Skeleton, EmptyState],
  selector: 'app-reports-table',
  styleUrl: './reports-table.css',
  templateUrl: './reports-table.html',
})
export class ReportsTable {
  readonly reports = input<ReportRow[]>([]);
  readonly isLoading = input(false);
  readonly loadError = input(false);

  readonly view = output<number>();
  readonly retry = output<void>();

  readonly skeletonRows = [0, 1, 2, 3, 4];

  readonly page = signal(1);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.reports().length / PAGE_SIZE)));

  readonly pagedReports = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.reports().slice(start, start + PAGE_SIZE);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, index) => index + 1);
  });

  readonly rangeStart = computed(() =>
    this.reports().length === 0 ? 0 : (this.currentPage() - 1) * PAGE_SIZE + 1,
  );

  readonly rangeEnd = computed(() => Math.min(this.currentPage() * PAGE_SIZE, this.reports().length));

  private currentPage(): number {
    return Math.min(this.page(), this.totalPages());
  }

  constructor() {
    effect(() => {
      this.reports();
      this.page.set(1);
    });
  }

  statusStyle(status: ReportStatus): StatusStyle {
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
