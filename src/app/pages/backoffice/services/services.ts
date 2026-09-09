import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { ServiceCard, ServiceCardStatus } from './components/service-card/service-card';
import { ServiceCatalogService } from '../../../../core/features/services/services/service.service';
import { Service } from '../../../../core/features/services/models/service.model';
import { Media } from '../../../../core/shared/models/common.model';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';

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

/** `Media.path` já vem completo (ex.: `uploads/services/x.jpg`), só falta o domínio. */
function buildMediaUrl(baseUrl: string, media: Media): string {
  return `${baseUrl}${media.path}`;
}

function toServiceRow(service: Service, baseUrl: string): ServiceRow {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    image: service.image ? buildMediaUrl(baseUrl, service.image) : null,
    gallery: (service.images ?? []).map((media) => buildMediaUrl(baseUrl, media)),
    category: service.category.name,
    status: service.deleted_at ? 'Inativo' : 'Ativo',
  };
}

@Component({
  imports: [TitleHeader, ServiceCard],
  selector: 'app-services',
  styleUrl: './services.css',
  templateUrl: './services.html',
})
export class Services {
  private readonly serviceCatalogService = inject(ServiceCatalogService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly elementRef = inject(ElementRef);

  readonly statusFilters: StatusFilter[] = ['Todos os Status', 'Ativo', 'Inativo'];
  readonly statusFilter = signal<StatusFilter>('Todos os Status');
  readonly isStatusMenuOpen = signal(false);

  readonly categoryFilter = signal<string>('Todas as Categorias');
  readonly isCategoryMenuOpen = signal(false);

  private readonly services = signal<Service[]>([]);

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
    this.serviceCatalogService.findAllAsAdmin().subscribe({
      next: (services) => this.services.set(services),
      error: (err) => console.error('Erro ao carregar serviços', err),
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
