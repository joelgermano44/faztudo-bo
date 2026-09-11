import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Drawer } from '../../../../../shared/ui/drawer/drawer';
import { ImageViewer } from '../../../../../shared/ui/image-viewer/image-viewer';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildMediaUrl } from '../../../../../../core/shared/util/media-url';
import {
  ProfessionalApplication,
  ProfessionalApplicationStatus,
  ProfessionalApplicationStatusHistory,
} from '../../../../../../core/features/professional-applications/models/professional-application.model';

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

@Component({
  imports: [Drawer, ImageViewer],
  selector: 'app-application-view-drawer',
  styleUrl: './application-view-drawer.css',
  templateUrl: './application-view-drawer.html',
})
export class ApplicationViewDrawer {
  private readonly baseUrl = inject(API_BASE_URL);

  readonly open = input(false);
  readonly application = input<ProfessionalApplication | null>(null);
  readonly avatarUrl = input<string | null>(null);
  readonly history = input<ProfessionalApplicationStatusHistory[]>([]);

  readonly reviewing = input(false);
  readonly approving = input(false);

  readonly closed = output<void>();
  readonly review = output<number>();
  readonly approve = output<number>();
  readonly reject = output<number>();

  readonly ProfessionalApplicationStatus = ProfessionalApplicationStatus;

  readonly statusStyle = computed(() => {
    const application = this.application();
    return application ? STATUS_STYLES[application.application_status] : null;
  });

  readonly canReview = computed(
    () => this.application()?.application_status === ProfessionalApplicationStatus.SUBMETIDA,
  );

  readonly canDecide = computed(() => {
    const status = this.application()?.application_status;
    return (
      status === ProfessionalApplicationStatus.SUBMETIDA ||
      status === ProfessionalApplicationStatus.EM_ANALISE
    );
  });

  readonly certificateImages = computed(() =>
    (this.application()?.certificates ?? [])
      .filter((certificate) => certificate.image !== null)
      .map((certificate) => buildMediaUrl(this.baseUrl, certificate.image!)),
  );

  readonly lightboxOpen = signal(false);
  readonly lightboxIndex = signal(0);
  readonly lightboxImages = signal<string[]>([]);

  openAvatarLightbox(): void {
    const avatar = this.avatarUrl();
    if (!avatar) {
      return;
    }
    this.lightboxImages.set([avatar]);
    this.lightboxIndex.set(0);
    this.lightboxOpen.set(true);
  }

  openCertificateLightbox(index: number): void {
    this.lightboxImages.set(this.certificateImages());
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  requestClose(): void {
    this.closed.emit();
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '—';
    }
    return new Date(value).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatAddress(application: ProfessionalApplication): string {
    const address = application.address;
    if (!address) {
      return '—';
    }
    return [address.address, address.municiple, address.province].filter(Boolean).join(', ');
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

  statusLabel(status: ProfessionalApplicationStatus): string {
    return STATUS_STYLES[status].label;
  }
}
