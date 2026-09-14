import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Drawer } from '../../../../../shared/ui/drawer/drawer';
import { Report, ReportStatus } from '../../../../../../core/features/reports/models/report.model';

interface StatusStyle {
  label: string;
  badge: string;
}

const STATUS_STYLES: Record<ReportStatus, StatusStyle> = {
  [ReportStatus.SUBMITTED]: { label: 'Submetida', badge: 'bg-gray-100 text-gray-600' },
  [ReportStatus.IN_ANALYSIS]: { label: 'Em Análise', badge: 'bg-amber-50 text-amber-700' },
  [ReportStatus.RESOLVED]: { label: 'Resolvida', badge: 'bg-[#80F98B33] text-emerald-700' },
};

@Component({
  imports: [Drawer, RouterLink],
  selector: 'app-report-view-drawer',
  styleUrl: './report-view-drawer.css',
  templateUrl: './report-view-drawer.html',
})
export class ReportViewDrawer {
  readonly open = input(false);
  readonly report = input<Report | null>(null);
  readonly reviewing = input(false);

  readonly closed = output<void>();
  readonly review = output<number>();
  readonly resolve = output<number>();

  readonly ReportStatus = ReportStatus;

  readonly statusStyle = computed(() => {
    const report = this.report();
    return report ? STATUS_STYLES[report.status] : null;
  });

  readonly canReview = computed(() => this.report()?.status === ReportStatus.SUBMITTED);

  readonly canResolve = computed(() => {
    const status = this.report()?.status;
    return status === ReportStatus.SUBMITTED || status === ReportStatus.IN_ANALYSIS;
  });

  requestClose(): void {
    this.closed.emit();
  }

  formatDateTime(value: string): string {
    return new Date(value).toLocaleString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
