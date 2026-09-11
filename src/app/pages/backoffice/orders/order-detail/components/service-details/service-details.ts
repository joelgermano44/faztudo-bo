import { Component, computed, input, signal } from '@angular/core';
import { ImageViewer } from '../../../../../../shared/ui/image-viewer/image-viewer';

@Component({
  imports: [ImageViewer],
  selector: 'app-service-details',
  styleUrl: './service-details.css',
  templateUrl: './service-details.html',
})
export class ServiceDetails {
  readonly modalityLabel = input.required<string>();
  readonly scheduledDate = input.required<string>();
  readonly description = input.required<string>();
  readonly serviceName = input.required<string>();
  readonly image = input<string | null>(null);
  readonly gallery = input<string[]>([]);

  readonly allImages = computed(() => {
    const image = this.image();
    return image ? [image, ...this.gallery()] : this.gallery();
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
}
