import { Component, computed, inject, input, output } from '@angular/core';
import { Drawer } from '../../../../../shared/ui/drawer/drawer';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildMediaUrl } from '../../../../../../core/shared/util/media-url';
import { CategoryWithServices } from '../../../../../../core/features/categories/models/category.model';

@Component({
  imports: [Drawer],
  selector: 'app-category-view-drawer',
  styleUrl: './category-view-drawer.css',
  templateUrl: './category-view-drawer.html',
})
export class CategoryViewDrawer {
  private readonly baseUrl = inject(API_BASE_URL);

  readonly open = input(false);
  readonly category = input<CategoryWithServices | null>(null);

  readonly closed = output<void>();

  readonly isActive = computed(() => this.category()?.deleted_at === null);

  readonly statusBadgeClass = computed(() =>
    this.isActive() ? 'bg-primary text-[#161E00]' : 'bg-gray-100 text-[#436746]',
  );

  requestClose(): void {
    this.closed.emit();
  }

  serviceImage(service: CategoryWithServices['services'][number]): string | null {
    return service.image ? buildMediaUrl(this.baseUrl, service.image) : null;
  }

  serviceStatus(service: CategoryWithServices['services'][number]): 'Activo' | 'Inactivo' {
    return service.deleted_at ? 'Inactivo' : 'Activo';
  }

  serviceStatusBadge(service: CategoryWithServices['services'][number]): string {
    return service.deleted_at
      ? 'bg-gray-100 text-[#436746]'
      : 'bg-primary text-[#161E00]';
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
