import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Drawer } from '../../../../../shared/ui/drawer/drawer';
import { ImageViewer } from '../../../../../shared/ui/image-viewer/image-viewer';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildMediaUrl } from '../../../../../../core/shared/util/media-url';
import { Advertisement } from '../../../../../../core/features/advertisements/models/advertisement.model';

@Component({
  imports: [Drawer, ImageViewer],
  selector: 'app-advertisement-view-drawer',
  styleUrl: './advertisement-view-drawer.css',
  templateUrl: './advertisement-view-drawer.html',
})
export class AdvertisementViewDrawer {
  private readonly baseUrl = inject(API_BASE_URL);

  readonly open = input(false);
  readonly advertisement = input<Advertisement | null>(null);

  readonly closed = output<void>();

  readonly images = computed(() =>
    (this.advertisement()?.images ?? []).map((media) => buildMediaUrl(this.baseUrl, media)),
  );

  readonly statusBadgeClass = computed(() =>
    this.advertisement()?.is_active ? 'bg-primary text-[#161E00]' : 'bg-gray-100 text-[#436746]',
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
