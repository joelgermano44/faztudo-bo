import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Drawer } from '../../../../../shared/ui/drawer/drawer';
import { ImageViewer } from '../../../../../shared/ui/image-viewer/image-viewer';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildMediaUrl } from '../../../../../../core/shared/util/media-url';
import { Service } from '../../../../../../core/features/services/models/service.model';

@Component({
  imports: [Drawer, ImageViewer],
  selector: 'app-service-view-drawer',
  styleUrl: './service-view-drawer.css',
  templateUrl: './service-view-drawer.html',
})
export class ServiceViewDrawer {
  private readonly baseUrl = inject(API_BASE_URL);

  readonly open = input(false);
  readonly service = input<Service | null>(null);

  readonly closed = output<void>();
  readonly remove = output<number>();

  readonly cover = computed(() => {
    const service = this.service();
    return service?.image ? buildMediaUrl(this.baseUrl, service.image) : null;
  });

  readonly gallery = computed(() => {
    const service = this.service();
    return (service?.images ?? []).map((media) => buildMediaUrl(this.baseUrl, media));
  });

  readonly allImages = computed(() => {
    const cover = this.cover();
    return cover ? [cover, ...this.gallery()] : this.gallery();
  });

  readonly isActive = computed(() => this.service()?.deleted_at === null);

  readonly statusBadgeClass = computed(() =>
    this.isActive() ? 'bg-primary text-[#161E00]' : 'bg-gray-100 text-[#436746]',
  );

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

  requestDelete(): void {
    const service = this.service();
    if (service) {
      this.remove.emit(service.id);
    }
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
}
