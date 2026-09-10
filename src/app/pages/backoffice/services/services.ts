import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { ServiceCard, ServiceCardStatus } from './components/service-card/service-card';
import { ServiceFormModal } from './components/service-form-modal/service-form-modal';
import { ServiceViewDrawer } from './components/service-view-drawer/service-view-drawer';
import { Modal } from '../../../shared/ui/modal/modal';
import { ServiceCatalogService } from '../../../../core/features/services/services/service.service';
import { Service } from '../../../../core/features/services/models/service.model';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';
import { buildMediaUrl } from '../../../../core/shared/util/media-url';

interface ServiceRow {
  id: number;
  name: string;
  description: string;
  image: string | null;
  gallery: string[];
  category: string;
  status: ServiceCardStatus;
}

type StatusFilter = 'Todos os Status' | ServiceCardStatus;

function toServiceRow(service: Service, baseUrl: string): ServiceRow {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    image: service.image ? buildMediaUrl(baseUrl, service.image) : null,
    gallery: (service.images ?? []).map((media) => buildMediaUrl(baseUrl, media)),
    category: service.category.name,
    status: service.deleted_at ? 'Inactivo' : 'Activo',
  };
}

@Component({
  imports: [TitleHeader, ServiceCard, ServiceFormModal, ServiceViewDrawer, Modal],
  selector: 'app-services',
  styleUrl: './services.css',
  templateUrl: './services.html',
})
export class Services {
  private readonly serviceCatalogService = inject(ServiceCatalogService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly elementRef = inject(ElementRef);

  readonly statusFilters: StatusFilter[] = ['Todos os Status', 'Activo', 'Inactivo'];
  readonly statusFilter = signal<StatusFilter>('Todos os Status');
  readonly isStatusMenuOpen = signal(false);

  readonly categoryFilter = signal<string>('Todas as Categorias');
  readonly isCategoryMenuOpen = signal(false);

  private readonly services = signal<Service[]>([]);

  readonly isFormModalOpen = signal(false);
  readonly editingService = signal<Service | null>(null);

  readonly isViewDrawerOpen = signal(false);
  readonly viewingService = signal<Service | null>(null);

  readonly deletingService = signal<Service | null>(null);
  readonly isDeleting = signal(false);
  readonly isDeleteConfirmOpen = computed(() => this.deletingService() !== null);

  readonly categoryFilters = computed<string[]>(() => {
    const names = new Set(this.services().map((service) => service.category.name));
    return ['Todas as Categorias', ...Array.from(names).sort()];
  });

  readonly filteredServices = computed<ServiceRow[]>(() => {
    const status = this.statusFilter();
    const category = this.categoryFilter();

    return this.services()
      .map((service) => toServiceRow(service, this.baseUrl))
      .filter((service) => status === 'Todos os Status' || service.status === status)
      .filter((service) => category === 'Todas as Categorias' || service.category === category);
  });

  constructor() {
    this.loadServices();
  }

  private loadServices(): void {
    this.serviceCatalogService.findAllAsAdmin().subscribe({
      next: (services) => this.services.set(services),
      error: (err) => console.error('Erro ao carregar serviços', err),
    });
  }

  private findServiceById(id: number): Service | null {
    return this.services().find((service) => service.id === id) ?? null;
  }

  openCreateModal(): void {
    this.editingService.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(id: number): void {
    this.editingService.set(this.findServiceById(id));
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
  }

  onServiceSaved(): void {
    this.isFormModalOpen.set(false);
    this.loadServices();
  }

  openViewDrawer(id: number): void {
    this.viewingService.set(this.findServiceById(id));
    this.isViewDrawerOpen.set(true);
  }

  closeViewDrawer(): void {
    this.isViewDrawerOpen.set(false);
  }

  requestDelete(id: number): void {
    this.deletingService.set(this.findServiceById(id));
  }

  cancelDelete(): void {
    if (this.isDeleting()) {
      return;
    }
    this.deletingService.set(null);
  }

  confirmDelete(): void {
    const service = this.deletingService();
    if (!service || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.serviceCatalogService.removeAsAdmin(service.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deletingService.set(null);
        toast.success('Serviço eliminado com sucesso');

        if (this.editingService()?.id === service.id) {
          this.isFormModalOpen.set(false);
        }
        if (this.viewingService()?.id === service.id) {
          this.isViewDrawerOpen.set(false);
        }

        this.loadServices();
      },
      error: (err) => {
        this.isDeleting.set(false);
        toast.error('Não foi possível eliminar o serviço', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }

  toggleStatusMenu(): void {
    this.isStatusMenuOpen.update((open) => !open);
    this.isCategoryMenuOpen.set(false);
  }

  toggleCategoryMenu(): void {
    this.isCategoryMenuOpen.update((open) => !open);
    this.isStatusMenuOpen.set(false);
  }

  setStatusFilter(status: StatusFilter): void {
    this.statusFilter.set(status);
    this.isStatusMenuOpen.set(false);
  }

  setCategoryFilter(category: string): void {
    this.categoryFilter.set(category);
    this.isCategoryMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isStatusMenuOpen.set(false);
      this.isCategoryMenuOpen.set(false);
    }
  }
}
