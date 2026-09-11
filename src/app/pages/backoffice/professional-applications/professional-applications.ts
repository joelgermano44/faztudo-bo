import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toast } from 'ngx-sonner';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import {
  ApplicationRow,
  ProfessionalApplicationsTable,
} from './components/professional-applications-table/professional-applications-table';
import { ApplicationViewDrawer } from './components/application-view-drawer/application-view-drawer';
import { Modal } from '../../../shared/ui/modal/modal';
import { ProfessionalApplicationService } from '../../../../core/features/professional-applications/services/professional-application.service';
import {
  ProfessionalApplication,
  ProfessionalApplicationStatus,
  ProfessionalApplicationStatusHistory,
} from '../../../../core/features/professional-applications/models/professional-application.model';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';
import { buildAvatarUrl } from '../../../../core/shared/util/media-url';

type StatusFilter = 'Todos' | ProfessionalApplicationStatus;

function toApplicationRow(application: ProfessionalApplication, baseUrl: string): ApplicationRow {
  return {
    id: application.id,
    name: application.name,
    email: application.email,
    phone: application.phone,
    bi: application.bi,
    avatar: buildAvatarUrl(baseUrl, 'professionals', application.image),
    professionNames: application.professions.map((profession) => profession.name),
    submittedAt: application.created_at,
    status: application.application_status,
  };
}

@Component({
  imports: [TitleHeader, ProfessionalApplicationsTable, ApplicationViewDrawer, Modal],
  selector: 'app-professional-applications',
  styleUrl: './professional-applications.css',
  templateUrl: './professional-applications.html',
})
export class ProfessionalApplications {
  private readonly applicationService = inject(ProfessionalApplicationService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly route = inject(ActivatedRoute);

  readonly filters: StatusFilter[] = [
    'Todos',
    ProfessionalApplicationStatus.SUBMETIDA,
    ProfessionalApplicationStatus.EM_ANALISE,
    ProfessionalApplicationStatus.APROVADA,
    ProfessionalApplicationStatus.REJEITADA,
  ];

  readonly filterLabels: Record<StatusFilter, string> = {
    Todos: 'Todos',
    [ProfessionalApplicationStatus.SUBMETIDA]: 'Submetidas',
    [ProfessionalApplicationStatus.EM_ANALISE]: 'Em Análise',
    [ProfessionalApplicationStatus.APROVADA]: 'Aprovadas',
    [ProfessionalApplicationStatus.REJEITADA]: 'Rejeitadas',
  };

  readonly activeFilter = signal<StatusFilter>('Todos');
  readonly searchTerm = signal('');

  private readonly applications = signal<ProfessionalApplication[]>([]);

  readonly isViewDrawerOpen = signal(false);
  readonly viewingApplication = signal<ProfessionalApplication | null>(null);
  readonly viewingHistory = signal<ProfessionalApplicationStatusHistory[]>([]);

  readonly viewingAvatarUrl = computed(() => {
    const application = this.viewingApplication();
    return application ? buildAvatarUrl(this.baseUrl, 'professionals', application.image) : null;
  });

  readonly reviewing = signal(false);
  readonly approving = signal(false);

  readonly rejectingApplication = signal<ProfessionalApplication | null>(null);
  readonly rejectReason = signal('');
  readonly isRejecting = signal(false);
  readonly isRejectModalOpen = computed(() => this.rejectingApplication() !== null);

  readonly filteredApplications = computed<ApplicationRow[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();

    return this.applications()
      .map((application) => toApplicationRow(application, this.baseUrl))
      .filter((application) => filter === 'Todos' || application.status === filter)
      .filter((application) => {
        if (!term) {
          return true;
        }
        return (
          application.id.toString().includes(term) ||
          application.name.toLowerCase().includes(term) ||
          application.email.toLowerCase().includes(term) ||
          application.phone.toLowerCase().includes(term)
        );
      });
  });

  constructor() {
    this.loadApplications();
    const query = this.route.snapshot.queryParamMap.get('q');
    if (query) {
      this.searchTerm.set(query);
    }
    const filter = this.route.snapshot.queryParamMap.get('filter');
    if (this.filters.includes(filter as StatusFilter)) {
      this.activeFilter.set(filter as StatusFilter);
    }
  }

  private loadApplications(): void {
    this.applicationService.findAll().subscribe({
      next: (applications) => this.applications.set(applications),
      error: (err) => console.error('Erro ao carregar candidaturas', err),
    });
  }

  private findApplicationById(id: number): ProfessionalApplication | null {
    return this.applications().find((application) => application.id === id) ?? null;
  }

  private replaceApplication(updated: ProfessionalApplication): void {
    this.applications.update((list) =>
      list.map((application) => (application.id === updated.id ? updated : application)),
    );
    if (this.viewingApplication()?.id === updated.id) {
      this.viewingApplication.set(updated);
    }
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  private loadHistory(id: number): void {
    this.applicationService.getHistory(id).subscribe({
      next: (history) => this.viewingHistory.set(history),
      error: (err) => console.error('Erro ao carregar histórico da candidatura', err),
    });
  }

  openViewDrawer(id: number): void {
    this.viewingApplication.set(this.findApplicationById(id));
    this.viewingHistory.set([]);
    this.isViewDrawerOpen.set(true);
    this.loadHistory(id);
  }

  closeViewDrawer(): void {
    this.isViewDrawerOpen.set(false);
  }

  onReview(id: number): void {
    this.reviewing.set(true);
    this.applicationService.review(id).subscribe({
      next: (updated) => {
        this.reviewing.set(false);
        this.replaceApplication(updated);
        this.loadHistory(updated.id);
        toast.success('Candidatura colocada em análise');
      },
      error: (err) => {
        this.reviewing.set(false);
        toast.error('Não foi possível actualizar a candidatura', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }

  onApprove(id: number): void {
    this.approving.set(true);
    this.applicationService.approve(id).subscribe({
      next: (updated) => {
        this.approving.set(false);
        this.replaceApplication(updated);
        this.loadHistory(updated.id);
        toast.success('Candidatura aprovada com sucesso');
      },
      error: (err) => {
        this.approving.set(false);
        toast.error('Não foi possível aprovar a candidatura', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }

  requestReject(id: number): void {
    this.rejectingApplication.set(this.findApplicationById(id));
    this.rejectReason.set('');
  }

  cancelReject(): void {
    if (this.isRejecting()) {
      return;
    }
    this.rejectingApplication.set(null);
  }

  confirmReject(): void {
    const application = this.rejectingApplication();
    const reason = this.rejectReason().trim();
    if (!application || !reason || this.isRejecting()) {
      return;
    }

    this.isRejecting.set(true);
    this.applicationService.reject(application.id, { description: reason }).subscribe({
      next: (updated) => {
        this.isRejecting.set(false);
        this.rejectingApplication.set(null);
        this.replaceApplication(updated);
        this.loadHistory(updated.id);
        toast.success('Candidatura rejeitada');
      },
      error: (err) => {
        this.isRejecting.set(false);
        toast.error('Não foi possível rejeitar a candidatura', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
