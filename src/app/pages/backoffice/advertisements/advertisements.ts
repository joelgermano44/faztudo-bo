import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { AdStatCard } from './components/ad-stat-card/ad-stat-card';
import {
  AdvertisementRow,
  AdvertisementsTable,
} from './components/advertisements-table/advertisements-table';
import { AdvertisementFormModal } from './components/advertisement-form-modal/advertisement-form-modal';
import { AdvertisementViewDrawer } from './components/advertisement-view-drawer/advertisement-view-drawer';
import { Modal } from '../../../shared/ui/modal/modal';
import { AdvertisementService } from '../../../../core/features/advertisements/services/advertisement.service';
import { Advertisement } from '../../../../core/features/advertisements/models/advertisement.model';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';
import { buildMediaUrl } from '../../../../core/shared/util/media-url';

type StatusFilter = 'Todos os Status' | 'Ativas' | 'Pausadas';

const MONTH_ABBR = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate().toString().padStart(2, '0')} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

function isSameMonth(iso: string, reference: Date): boolean {
  const date = new Date(iso);
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat('pt-PT', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function toAdvertisementRow(advertisement: Advertisement, baseUrl: string): AdvertisementRow {
  const firstImage = advertisement.images?.[0] ?? null;
  return {
    id: advertisement.id,
    title: advertisement.title,
    description: advertisement.description,
    link: advertisement.link,
    isActive: advertisement.is_active,
    clicks: advertisement.clicks,
    thumbnail: firstImage ? buildMediaUrl(baseUrl, firstImage) : null,
    createdAt: formatDate(advertisement.created_at),
  };
}

@Component({
  imports: [
    TitleHeader,
    AdStatCard,
    AdvertisementsTable,
    AdvertisementFormModal,
    AdvertisementViewDrawer,
    Modal,
  ],
  selector: 'app-advertisements',
  styleUrl: './advertisements.css',
  templateUrl: './advertisements.html',
})
export class Advertisements {
  private readonly advertisementService = inject(AdvertisementService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly elementRef = inject(ElementRef);

  readonly filters: StatusFilter[] = ['Todos os Status', 'Ativas', 'Pausadas'];

  readonly activeFilter = signal<StatusFilter>('Todos os Status');
  readonly isStatusMenuOpen = signal(false);
  readonly searchTerm = signal('');

  private readonly advertisements = signal<Advertisement[]>([]);

  readonly totalCampaigns = computed(() => this.advertisements().length);

  readonly totalClicks = computed(() =>
    this.advertisements().reduce((sum, advertisement) => sum + advertisement.clicks, 0),
  );

  readonly totalClicksLabel = computed(() => formatCompact(this.totalClicks()));

  /** % de campanhas criadas este mês vs mês passado. */
  readonly campaignsTrend = computed(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const ads = this.advertisements();

    const thisMonthCount = ads.filter((ad) => isSameMonth(ad.created_at, now)).length;
    const lastMonthCount = ads.filter((ad) => isSameMonth(ad.created_at, lastMonth)).length;

    if (lastMonthCount === 0) {
      return thisMonthCount > 0 ? { text: '+100%', direction: 'up' as const } : null;
    }
    const variation = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;
    const direction: 'up' | 'down' | 'neutral' = variation > 0 ? 'up' : variation < 0 ? 'down' : 'neutral';
    const sign = variation > 0 ? '+' : '';
    return { text: `${sign}${variation.toFixed(0)}%`, direction };
  });

  readonly activeCampaigns = computed(() => this.advertisements().filter((ad) => ad.is_active));

  readonly activePercent = computed(() => {
    const total = this.advertisements().length;
    return total === 0 ? 0 : Math.round((this.activeCampaigns().length / total) * 100);
  });

  readonly isFormModalOpen = signal(false);
  readonly editingAdvertisement = signal<Advertisement | null>(null);

  readonly isViewDrawerOpen = signal(false);
  readonly viewingAdvertisement = signal<Advertisement | null>(null);

  readonly deletingAdvertisement = signal<Advertisement | null>(null);
  readonly isDeleting = signal(false);
  readonly isDeleteConfirmOpen = computed(() => this.deletingAdvertisement() !== null);

  readonly filteredAdvertisements = computed<AdvertisementRow[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();

    return this.advertisements()
      .map((advertisement) => toAdvertisementRow(advertisement, this.baseUrl))
      .filter((advertisement) => {
        if (filter === 'Ativas') return advertisement.isActive;
        if (filter === 'Pausadas') return !advertisement.isActive;
        return true;
      })
      .filter((advertisement) => {
        if (!term) {
          return true;
        }
        return (
          advertisement.title.toLowerCase().includes(term) ||
          advertisement.link.toLowerCase().includes(term)
        );
      });
  });

  constructor() {
    this.loadAdvertisements();
  }

  private loadAdvertisements(): void {
    this.advertisementService.findAll().subscribe({
      next: (advertisements) => this.advertisements.set(advertisements),
      error: (err) => console.error('Erro ao carregar campanhas', err),
    });
  }

  private findAdvertisementById(id: number): Advertisement | null {
    return this.advertisements().find((advertisement) => advertisement.id === id) ?? null;
  }

  private replaceAdvertisement(updated: Advertisement): void {
    this.advertisements.update((list) =>
      list.map((advertisement) => (advertisement.id === updated.id ? updated : advertisement)),
    );
    if (this.viewingAdvertisement()?.id === updated.id) {
      this.viewingAdvertisement.set(updated);
    }
  }

  toggleStatusMenu(): void {
    this.isStatusMenuOpen.update((open) => !open);
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
    this.isStatusMenuOpen.set(false);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isStatusMenuOpen.set(false);
    }
  }

  openCreateModal(): void {
    this.editingAdvertisement.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(id: number): void {
    this.editingAdvertisement.set(this.findAdvertisementById(id));
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
  }

  onAdvertisementSaved(): void {
    this.isFormModalOpen.set(false);
    this.loadAdvertisements();
  }

  openViewDrawer(id: number): void {
    this.viewingAdvertisement.set(this.findAdvertisementById(id));
    this.isViewDrawerOpen.set(true);
  }

  closeViewDrawer(): void {
    this.isViewDrawerOpen.set(false);
  }

  toggleActive(id: number): void {
    const advertisement = this.findAdvertisementById(id);
    if (!advertisement) {
      return;
    }

    this.advertisementService
      .update(advertisement.id, { is_active: !advertisement.is_active })
      .subscribe({
        next: (updated) => {
          this.replaceAdvertisement(updated);
          toast.success(updated.is_active ? 'Campanha retomada' : 'Campanha pausada');
        },
        error: (err) => {
          toast.error('Não foi possível atualizar a campanha', {
            description: err?.error?.message ?? 'Tente novamente mais tarde.',
          });
        },
      });
  }

  requestDelete(id: number): void {
    this.deletingAdvertisement.set(this.findAdvertisementById(id));
  }

  cancelDelete(): void {
    if (this.isDeleting()) {
      return;
    }
    this.deletingAdvertisement.set(null);
  }

  confirmDelete(): void {
    const advertisement = this.deletingAdvertisement();
    if (!advertisement || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.advertisementService.remove(advertisement.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deletingAdvertisement.set(null);
        toast.success('Campanha eliminada com sucesso');

        if (this.editingAdvertisement()?.id === advertisement.id) {
          this.isFormModalOpen.set(false);
        }
        if (this.viewingAdvertisement()?.id === advertisement.id) {
          this.isViewDrawerOpen.set(false);
        }

        this.loadAdvertisements();
      },
      error: (err) => {
        this.isDeleting.set(false);
        toast.error('Não foi possível eliminar a campanha', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
