import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Drawer } from '../../../../../shared/ui/drawer/drawer';
import { ImageViewer } from '../../../../../shared/ui/image-viewer/image-viewer';
import { Report, ReportStatus } from '../../../../../../core/features/reports/models/report.model';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildAvatarUrl, buildMediaUrl } from '../../../../../../core/shared/util/media-url';
import { OrderLocationType } from '../../../../../../core/features/orders/models/order.model';

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
  imports: [Drawer, RouterLink, ImageViewer],
  selector: 'app-report-view-drawer',
  styleUrl: './report-view-drawer.css',
  templateUrl: './report-view-drawer.html',
})
export class ReportViewDrawer {
  private readonly baseUrl = inject(API_BASE_URL);

  readonly open = input(false);
  readonly report = input<Report | null>(null);
  readonly reviewing = input(false);
  readonly loadingDetails = input(false);

  readonly closed = output<void>();
  readonly review = output<number>();
  readonly resolve = output<number>();

  readonly ReportStatus = ReportStatus;
  readonly OrderLocationType = OrderLocationType;

  readonly statusStyle = computed(() => {
    const report = this.report();
    return report ? STATUS_STYLES[report.status] : null;
  });

  readonly canReview = computed(() => this.report()?.status === ReportStatus.SUBMITTED);

  readonly canResolve = computed(() => {
    const status = this.report()?.status;
    return status === ReportStatus.SUBMITTED || status === ReportStatus.IN_ANALYSIS;
  });

  readonly reporterAvatar = computed(() => {
    const client = this.report()?.client;
    return client ? buildAvatarUrl(this.baseUrl, 'clients', client.image) : null;
  });

  readonly reportedAvatar = computed(() => {
    const professional = this.report()?.professional;
    return professional ? buildAvatarUrl(this.baseUrl, 'professionals', professional.image) : null;
  });

  readonly service = computed(() => this.report()?.order?.service ?? null);

  readonly serviceImage = computed(() => {
    const service = this.service();
    return service?.image ? buildMediaUrl(this.baseUrl, service.image) : null;
  });

  readonly serviceGallery = computed(() => {
    const service = this.service();
    return (service?.images ?? []).map((media) => buildMediaUrl(this.baseUrl, media));
  });

  readonly serviceImages = computed(() => {
    const cover = this.serviceImage();
    const gallery = this.serviceGallery();
    return cover ? [cover, ...gallery.filter((url) => url !== cover)] : gallery;
  });

  readonly lightboxOpen = signal(false);
  readonly lightboxIndex = signal(0);

  openLightbox(index: number): void {
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

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

  orderStatusLabel(): string {
    const status = this.report()?.order?.status;
    switch (status) {
      case 'REQUESTED':
        return 'Solicitado';
      case 'ACCEPTED':
        return 'Aceite';
      case 'IN_PROGRESS':
        return 'Em curso';
      case 'DONE':
        return 'Concluído';
      case 'CANCELED':
        return 'Cancelado';
      case 'REJECTED':
        return 'Rejeitado';
      default:
        return '—';
    }
  }
}
