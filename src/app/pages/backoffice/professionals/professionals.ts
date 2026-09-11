import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { ProfessionalRow, ProfessionalsTable } from './components/professionals-table/professionals-table';
import { ProfessionalFormModal } from './components/professional-form-modal/professional-form-modal';
import { ProfessionalViewDrawer } from './components/professional-view-drawer/professional-view-drawer';
import { Modal } from '../../../shared/ui/modal/modal';
import { ProfessionalService } from '../../../../core/features/professionals/services/professional.service';
import {
  Professional,
  ProfessionalApplicationStatus,
  ProfessionalAvailabilityStatus,
} from '../../../../core/features/professionals/models/professional.model';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';
import { buildAvatarUrl } from '../../../../core/shared/util/media-url';

type StatusFilter = 'Todos' | ProfessionalAvailabilityStatus;
type DateSort = 'recent' | 'oldest';

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

function toProfessionalRow(professional: Professional, baseUrl: string): ProfessionalRow {
  return {
    id: professional.id,
    name: professional.name,
    email: professional.email,
    phone: professional.phone,
    avatar: buildAvatarUrl(baseUrl, 'professionals', professional.image),
    professions: professional.professions.map((profession) => profession.name),
    averageRating: professional.average_rating,
    ratingsCount: professional.ratings_count,
    availability: professional.availability_status,
    createdAt: formatDate(professional.created_at),
    createdAtIso: professional.created_at,
  };
}

@Component({
  imports: [TitleHeader, ProfessionalsTable, ProfessionalFormModal, ProfessionalViewDrawer, Modal],
  selector: 'app-professionals',
  styleUrl: './professionals.css',
  templateUrl: './professionals.html',
})
export class Professionals {
  private readonly professionalService = inject(ProfessionalService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly elementRef = inject(ElementRef);
  private readonly route = inject(ActivatedRoute);

  readonly filters: StatusFilter[] = [
    'Todos',
    ProfessionalAvailabilityStatus.AVAILABLE,
    ProfessionalAvailabilityStatus.UNAVAILABLE,
  ];
  readonly filterLabels: Record<StatusFilter, string> = {
    Todos: 'Todos os Status',
    [ProfessionalAvailabilityStatus.AVAILABLE]: 'Disponíveis',
    [ProfessionalAvailabilityStatus.UNAVAILABLE]: 'Indisponíveis',
  };

  readonly dateSorts: DateSort[] = ['recent', 'oldest'];
  readonly dateSortLabels: Record<DateSort, string> = {
    recent: 'Mais recentes',
    oldest: 'Mais antigos',
  };

  readonly activeFilter = signal<StatusFilter>('Todos');
  readonly dateSort = signal<DateSort>('recent');
  readonly isStatusMenuOpen = signal(false);
  readonly isDateMenuOpen = signal(false);
  readonly searchTerm = signal('');

  /** Só profissionais com candidatura aprovada aparecem aqui — os restantes vivem em "Candidaturas". */
  private readonly professionals = signal<Professional[]>([]);

  readonly isFormModalOpen = signal(false);
  readonly editingProfessional = signal<Professional | null>(null);

  readonly isViewDrawerOpen = signal(false);
  readonly viewingProfessional = signal<Professional | null>(null);

  readonly deletingProfessional = signal<Professional | null>(null);
  readonly isDeleting = signal(false);
  readonly isDeleteConfirmOpen = computed(() => this.deletingProfessional() !== null);

  readonly filteredProfessionals = computed<ProfessionalRow[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();
    const sort = this.dateSort();

    return this.professionals()
      .map((professional) => toProfessionalRow(professional, this.baseUrl))
      .filter((professional) => filter === 'Todos' || professional.availability === filter)
      .filter((professional) => {
        if (!term) {
          return true;
        }
        return (
          professional.name.toLowerCase().includes(term) ||
          professional.email.toLowerCase().includes(term) ||
          professional.phone.toLowerCase().includes(term) ||
          professional.professions.some((profession) => profession.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        const diff = new Date(a.createdAtIso).getTime() - new Date(b.createdAtIso).getTime();
        return sort === 'recent' ? -diff : diff;
      });
  });

  constructor() {
    this.loadProfessionals();
    const query = this.route.snapshot.queryParamMap.get('q');
    if (query) {
      this.searchTerm.set(query);
    }
  }

  private loadProfessionals(): void {
    this.professionalService.findAll().subscribe({
      next: (professionals) =>
        this.professionals.set(
          professionals.filter(
            (professional) => professional.application_status === ProfessionalApplicationStatus.APROVADA,
          ),
        ),
      error: (err) => console.error('Erro ao carregar profissionais', err),
    });
  }

  private findProfessionalById(id: number): Professional | null {
    return this.professionals().find((professional) => professional.id === id) ?? null;
  }

  private replaceProfessional(updated: Professional): void {
    this.professionals.update((list) =>
      list.map((professional) => (professional.id === updated.id ? updated : professional)),
    );
    if (this.viewingProfessional()?.id === updated.id) {
      this.viewingProfessional.set(updated);
    }
  }

  toggleStatusMenu(): void {
    this.isStatusMenuOpen.update((open) => !open);
    this.isDateMenuOpen.set(false);
  }

  toggleDateMenu(): void {
    this.isDateMenuOpen.update((open) => !open);
    this.isStatusMenuOpen.set(false);
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
    this.isStatusMenuOpen.set(false);
  }

  setDateSort(sort: DateSort): void {
    this.dateSort.set(sort);
    this.isDateMenuOpen.set(false);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isStatusMenuOpen.set(false);
      this.isDateMenuOpen.set(false);
    }
  }

  openEditModal(id: number): void {
    this.editingProfessional.set(this.findProfessionalById(id));
    this.isFormModalOpen.set(true);
    this.isViewDrawerOpen.set(false);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
  }

  onProfessionalSaved(): void {
    this.isFormModalOpen.set(false);
    this.loadProfessionals();
  }

  openViewDrawer(id: number): void {
    this.viewingProfessional.set(this.findProfessionalById(id));
    this.isViewDrawerOpen.set(true);
  }

  closeViewDrawer(): void {
    this.isViewDrawerOpen.set(false);
  }

  toggleAvailability(id: number): void {
    const professional = this.findProfessionalById(id);
    if (!professional) {
      return;
    }

    const nextStatus =
      professional.availability_status === ProfessionalAvailabilityStatus.AVAILABLE
        ? ProfessionalAvailabilityStatus.UNAVAILABLE
        : ProfessionalAvailabilityStatus.AVAILABLE;

    this.professionalService.updateAvailability(professional.id, { status: nextStatus }).subscribe({
      next: (updated) => {
        this.replaceProfessional(updated);
        toast.success(
          nextStatus === ProfessionalAvailabilityStatus.AVAILABLE
            ? 'Profissional marcado como disponível'
            : 'Profissional marcado como indisponível',
        );
      },
      error: (err) => {
        toast.error('Não foi possível atualizar a disponibilidade', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }

  requestDelete(id: number): void {
    this.deletingProfessional.set(this.findProfessionalById(id));
  }

  cancelDelete(): void {
    if (this.isDeleting()) {
      return;
    }
    this.deletingProfessional.set(null);
  }

  confirmDelete(): void {
    const professional = this.deletingProfessional();
    if (!professional || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.professionalService.remove(professional.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deletingProfessional.set(null);
        toast.success('Profissional eliminado com sucesso');

        if (this.editingProfessional()?.id === professional.id) {
          this.isFormModalOpen.set(false);
        }
        if (this.viewingProfessional()?.id === professional.id) {
          this.isViewDrawerOpen.set(false);
        }

        this.loadProfessionals();
      },
      error: (err) => {
        this.isDeleting.set(false);
        toast.error('Não foi possível eliminar o profissional', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
