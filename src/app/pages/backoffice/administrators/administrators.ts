import { Component, computed, inject, signal } from '@angular/core';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import {
  AdministratorsTable,
  AdminRow,
  AdminStatus,
} from './components/administrators-table/administrators-table';
import { AdminFormModal } from './components/admin-form-modal/admin-form-modal';
import { AdminViewDrawer } from './components/admin-view-drawer/admin-view-drawer';
import { AdminService } from '../../../../core/features/admins/services/admin.service';
import { Admin } from '../../../../core/features/admins/models/admin.model';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';
import { buildAvatarUrl as buildImageUrl } from '../../../../core/shared/util/media-url';

type StatusFilter = 'Todos' | AdminStatus;

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

function formatBirthdate(iso: string): string {
  const date = new Date(iso);
  const day = date.getDate().toString().padStart(2, '0');
  return `${day} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

function toAdminRow(admin: Admin, baseUrl: string): AdminRow {
  return {
    id: admin.id,
    name: admin.name,
    username: admin.username,
    email: admin.email,
    phone: admin.phone,
    bi: admin.bi,
    birthdate: formatBirthdate(admin.birthdate),
    avatar: buildImageUrl(baseUrl, 'admins', admin.image),
    status: admin.deleted_at ? 'Inativo' : 'Ativo',
  };
}

@Component({
  imports: [TitleHeader, AdministratorsTable, AdminFormModal, AdminViewDrawer],
  selector: 'app-administrators',
  styleUrl: './administrators.css',
  templateUrl: './administrators.html',
})
export class Administrators {
  private readonly adminService = inject(AdminService);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly filters: StatusFilter[] = ['Todos', 'Ativo', 'Inativo'];
  readonly filterLabels: Record<StatusFilter, string> = {
    Todos: 'Todos',
    Ativo: 'Ativos',
    Inativo: 'Inativos',
  };

  readonly activeFilter = signal<StatusFilter>('Todos');
  readonly searchTerm = signal('');

  private readonly admins = signal<Admin[]>([]);

  readonly isFormModalOpen = signal(false);
  readonly editingAdmin = signal<Admin | null>(null);

  readonly isViewDrawerOpen = signal(false);
  readonly viewingAdmin = signal<Admin | null>(null);

  readonly viewingAdminAvatarUrl = computed(() => {
    const admin = this.viewingAdmin();
    return admin ? buildImageUrl(this.baseUrl, 'admins', admin.image) : null;
  });

  readonly filteredAdmins = computed<AdminRow[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();

    return this.admins()
      .map((admin) => toAdminRow(admin, this.baseUrl))
      .filter((admin) => filter === 'Todos' || admin.status === filter)
      .filter((admin) => {
        if (!term) {
          return true;
        }
        return (
          admin.id.toString().includes(term) ||
          admin.name.toLowerCase().includes(term) ||
          admin.username.toLowerCase().includes(term) ||
          admin.email.toLowerCase().includes(term) ||
          admin.phone.toLowerCase().includes(term)
        );
      });
  });

  constructor() {
    this.loadAdmins();
  }

  private loadAdmins(): void {
    this.adminService.findAll().subscribe({
      next: (admins) => this.admins.set(admins),
      error: (err) => console.error('Erro ao carregar administradores', err),
    });
  }

  private findAdminById(id: number): Admin | null {
    return this.admins().find((admin) => admin.id === id) ?? null;
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  openCreateModal(): void {
    this.editingAdmin.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(id: number): void {
    this.editingAdmin.set(this.findAdminById(id));
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
  }

  onAdminSaved(): void {
    this.isFormModalOpen.set(false);
    this.loadAdmins();
  }

  openViewDrawer(id: number): void {
    this.viewingAdmin.set(this.findAdminById(id));
    this.isViewDrawerOpen.set(true);
  }

  closeViewDrawer(): void {
    this.isViewDrawerOpen.set(false);
  }
}
