import { Component, computed, input, output, signal } from '@angular/core';
import { Drawer } from '../../../../../shared/ui/drawer/drawer';
import { ImageViewer } from '../../../../../shared/ui/image-viewer/image-viewer';
import { Admin } from '../../../../../../core/features/admins/models/admin.model';

@Component({
  imports: [Drawer, ImageViewer],
  selector: 'app-admin-view-drawer',
  styleUrl: './admin-view-drawer.css',
  templateUrl: './admin-view-drawer.html',
})
export class AdminViewDrawer {
  readonly open = input(false);
  readonly admin = input<Admin | null>(null);
  readonly avatarUrl = input<string | null>(null);

  readonly closed = output<void>();

  readonly isActive = computed(() => this.admin()?.deleted_at === null);

  readonly statusBadgeClass = computed(() =>
    this.isActive() ? 'bg-primary text-[#161E00]' : 'bg-gray-100 text-[#436746]',
  );

  readonly lightboxOpen = signal(false);

  openLightbox(): void {
    if (this.avatarUrl()) {
      this.lightboxOpen.set(true);
    }
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
