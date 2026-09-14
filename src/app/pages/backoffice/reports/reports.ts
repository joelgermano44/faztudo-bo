import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { toast } from 'ngx-sonner';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { Modal } from '../../../shared/ui/modal/modal';
import { ReportRow, ReportsTable } from './components/reports-table/reports-table';
import { ReportViewDrawer } from './components/report-view-drawer/report-view-drawer';
import { ReportService } from '../../../../core/features/reports/services/report.service';
import { Report, ReportStatus } from '../../../../core/features/reports/models/report.model';
import { ProfessionalService } from '../../../../core/features/professionals/services/professional.service';
import { Professional } from '../../../../core/features/professionals/models/professional.model';
import { ClientService } from '../../../../core/features/users-clients/services/client.service';
import { Client } from '../../../../core/features/users-clients/models/client.model';
import { OrderService } from '../../../../core/features/orders/services/order.service';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';
import { buildAvatarUrl } from '../../../../core/shared/util/media-url';

type StatusFilter = 'Todos' | ReportStatus;

const MONTH_ABBR = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate().toString().padStart(2, '0')} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

/** Busca até 200 denúncias por profissional — suficiente para o volume esperado no BO. */
const REPORTS_PAGE_SIZE = 200;

@Component({
  imports: [TitleHeader, ReportsTable, ReportViewDrawer, Modal],
  selector: 'app-reports',
  styleUrl: './reports.css',
  templateUrl: './reports.html',
})
export class Reports {
  private readonly reportService = inject(ReportService);
  private readonly professionalService = inject(ProfessionalService);
  private readonly clientService = inject(ClientService);
  private readonly orderService = inject(OrderService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly route = inject(ActivatedRoute);

  readonly filters: StatusFilter[] = [
    'Todos',
    ReportStatus.SUBMITTED,
    ReportStatus.IN_ANALYSIS,
    ReportStatus.RESOLVED,
  ];

  readonly filterLabels: Record<StatusFilter, string> = {
    Todos: 'Todos',
    [ReportStatus.SUBMITTED]: 'Submetidas',
    [ReportStatus.IN_ANALYSIS]: 'Em Análise',
    [ReportStatus.RESOLVED]: 'Resolvidas',
  };

  readonly activeFilter = signal<StatusFilter>('Todos');
  readonly searchTerm = signal('');

  private readonly reports = signal<Report[]>([]);
  private readonly professionalsById = signal<Map<number, Professional>>(new Map());
  private readonly clientsById = signal<Map<string, Client>>(new Map());

  readonly isLoading = signal(true);
  readonly loadError = signal(false);

  readonly isViewDrawerOpen = signal(false);
  readonly viewingReport = signal<Report | null>(null);
  readonly viewingReportLoading = signal(false);

  readonly reviewing = signal(false);

  readonly resolvingReport = signal<Report | null>(null);
  readonly resolutionNote = signal('');
  readonly isResolving = signal(false);
  readonly isResolveModalOpen = computed(() => this.resolvingReport() !== null);

  readonly filteredReports = computed<ReportRow[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();
    const professionals = this.professionalsById();
    const clients = this.clientsById();

    return this.reports()
      .map((report) => this.toReportRow(report, professionals, clients))
      .filter((row) => filter === 'Todos' || row.status === filter)
      .filter((row) => {
        if (!term) {
          return true;
        }
        return (
          row.reason.toLowerCase().includes(term) ||
          row.client.name.toLowerCase().includes(term) ||
          row.professional.name.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime());
  });

  /** Id vindo de `?reportId=` (ex.: clique numa notificação de denúncia) — abre o drawer assim que carregar. */
  private readonly pendingReportId = signal<number | null>(null);

  constructor() {
    this.loadReports();
    const query = this.route.snapshot.queryParamMap.get('q');
    if (query) {
      this.searchTerm.set(query);
    }
    const reportId = this.route.snapshot.queryParamMap.get('reportId');
    if (reportId) {
      this.pendingReportId.set(Number(reportId));
    }
  }

  private toReportRow(
    report: Report,
    professionals: Map<number, Professional>,
    clients: Map<string, Client>,
  ): ReportRow {
    const professional = professionals.get(report.professional_id);
    const client = clients.get(report.client_id);

    return {
      id: report.id,
      orderId: report.order_id,
      reason: report.reason,
      description: report.description,
      status: report.status,
      resolutionNote: report.resolution_note,
      createdAt: formatDate(report.created_at),
      createdAtIso: report.created_at,
      client: {
        id: report.client_id,
        name: client?.name ?? 'Cliente removido',
        avatar: client ? buildAvatarUrl(this.baseUrl, 'clients', client.image) : null,
      },
      professional: {
        id: report.professional_id,
        name: professional?.name ?? 'Profissional removido',
        avatar: professional ? buildAvatarUrl(this.baseUrl, 'professionals', professional.image) : null,
      },
    };
  }

  private loadReports(): void {
    this.isLoading.set(true);
    this.loadError.set(false);

    forkJoin({
      professionals: this.professionalService.findAll(),
      clients: this.clientService.findAll(),
    }).subscribe({
      next: ({ professionals, clients }) => {
        this.professionalsById.set(new Map(professionals.map((p) => [p.id, p])));
        this.clientsById.set(new Map(clients.map((c) => [c.id, c])));
        this.loadAllReports(professionals);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set(true);
        console.error('Erro ao carregar dados para as denúncias', err);
      },
    });
  }

  /**
   * A API só expõe denúncias por profissional ou por cliente (T?? — sem
   * listagem global). Como toda denúncia tem sempre um profissional-alvo,
   * percorremos todos os profissionais para reconstruir a lista completa.
   */
  private loadAllReports(professionals: Professional[]): void {
    if (professionals.length === 0) {
      this.isLoading.set(false);
      this.reports.set([]);
      return;
    }

    forkJoin(
      professionals.map((professional) =>
        this.reportService
          .findByProfessional(professional.id, { take: REPORTS_PAGE_SIZE, skip: 0 })
          .pipe(catchError(() => of({ total: 0, items: [] }))),
      ),
    ).subscribe({
      next: (pages) => {
        this.isLoading.set(false);
        this.reports.set(pages.flatMap((page) => page.items));

        const pendingId = this.pendingReportId();
        if (pendingId !== null) {
          this.pendingReportId.set(null);
          this.openViewDrawer(pendingId);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set(true);
        console.error('Erro ao carregar denúncias', err);
      },
    });
  }

  retryLoad(): void {
    this.loadReports();
  }

  private replaceReport(updated: Report): void {
    this.reports.update((list) =>
      list.map((report) => (report.id === updated.id ? updated : report)),
    );
    if (this.viewingReport()?.id === updated.id) {
      this.viewingReport.set(updated);
    }
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  openViewDrawer(id: number): void {
    // Mostra já os dados da lista (rápido), depois troca pela versão completa
    // com cliente, profissional e pedido/serviço populados.
    const report = this.reports().find((item) => item.id === id) ?? null;
    this.viewingReport.set(report);
    this.isViewDrawerOpen.set(true);
    if (!report) {
      return;
    }

    this.viewingReportLoading.set(true);
    forkJoin({
      report: this.reportService.findOne(id),
      // `order` do endpoint de denúncias vem "enxuto" (sem imagem/categoria
      // do serviço) — buscamos o pedido completo à parte para as fotos.
      order: this.orderService.findOne(report.order_id).pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ report: full, order }) => {
        this.viewingReportLoading.set(false);
        this.replaceReport(order ? { ...full, order } : full);
      },
      error: (err) => {
        this.viewingReportLoading.set(false);
        console.error('Erro ao carregar detalhes da denúncia', err);
      },
    });
  }

  closeViewDrawer(): void {
    this.isViewDrawerOpen.set(false);
  }

  onReview(id: number): void {
    this.reviewing.set(true);
    this.reportService.review(id).subscribe({
      next: (updated) => {
        this.reviewing.set(false);
        this.replaceReport(updated);
        toast.success('Denúncia colocada em análise');
      },
      error: (err) => {
        this.reviewing.set(false);
        toast.error('Não foi possível atualizar a denúncia', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }

  requestResolve(id: number): void {
    this.resolvingReport.set(this.reports().find((item) => item.id === id) ?? null);
    this.resolutionNote.set('');
  }

  cancelResolve(): void {
    if (this.isResolving()) {
      return;
    }
    this.resolvingReport.set(null);
  }

  confirmResolve(): void {
    const report = this.resolvingReport();
    const note = this.resolutionNote().trim();
    if (!report || !note || this.isResolving()) {
      return;
    }

    this.isResolving.set(true);
    this.reportService.resolve(report.id, { resolution_note: note }).subscribe({
      next: (updated) => {
        this.isResolving.set(false);
        this.resolvingReport.set(null);
        this.replaceReport(updated);
        toast.success('Denúncia resolvida com sucesso');
      },
      error: (err) => {
        this.isResolving.set(false);
        toast.error('Não foi possível resolver a denúncia', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
