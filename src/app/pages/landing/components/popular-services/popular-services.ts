import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { API_BASE_URL } from '../../../../../core/shared/http/api-config';
import { ServiceCatalogService } from '../../../../../core/features/services/services/service.service';
import { buildMediaUrl } from '../../../../../core/shared/util/media-url';

interface PopularServiceCard {
  id: number;
  imageUrl: string | null;
  category: string;
  name: string;
  description: string;
}

/** Quantos serviços reais mostrar nesta secção da landing page. */
const MAX_SERVICES = 8;

@Component({
  imports: [],
  selector: 'app-popular-services',
  styleUrl: './popular-services.css',
  templateUrl: './popular-services.html',
})
export class PopularServices {
  private readonly serviceCatalogService = inject(ServiceCatalogService);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly track = viewChild<ElementRef<HTMLElement>>('track');

  /**
   * `GET /services` é um dos poucos endpoints públicos da API (sem
   * `Authorization`) — a landing page não tem sessão, por isso é o único
   * catálogo que pode mostrar aqui, com dados reais da plataforma.
   */
  readonly services = signal<PopularServiceCard[]>([]);

  readonly canScrollPrev = signal(false);
  readonly canScrollNext = signal(false);

  constructor() {
    this.serviceCatalogService.findAll().subscribe({
      next: (services) => {
        this.services.set(
          services.slice(0, MAX_SERVICES).map((service) => ({
            id: service.id,
            imageUrl: service.image ? buildMediaUrl(this.baseUrl, service.image) : null,
            category: service.category.name,
            name: service.name,
            description: service.description,
          })),
        );
        // dá tempo ao @for de renderizar os cartões antes de medir o scroll
        setTimeout(() => this.updateScrollState());
      },
      error: (err) => console.error('Erro ao carregar serviços populares', err),
    });
  }

  truncate(text: string): string {
    return text.length > 50 ? `${text.slice(0, 50)}...` : text;
  }

  scrollPrev(): void {
    this.scrollByCard(-1);
  }

  scrollNext(): void {
    this.scrollByCard(1);
  }

  private scrollByCard(direction: -1 | 1): void {
    const element = this.track()?.nativeElement;
    if (!element) {
      return;
    }
    const card = element.querySelector<HTMLElement>('[data-service-card]');
    const step = (card?.offsetWidth ?? element.clientWidth) + 24; // 24px = gap-6
    element.scrollBy({ left: direction * step, behavior: 'smooth' });
  }

  onTrackScroll(): void {
    this.updateScrollState();
  }

  private updateScrollState(): void {
    const element = this.track()?.nativeElement;
    if (!element) {
      return;
    }
    this.canScrollPrev.set(element.scrollLeft > 4);
    this.canScrollNext.set(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 4,
    );
  }
}
