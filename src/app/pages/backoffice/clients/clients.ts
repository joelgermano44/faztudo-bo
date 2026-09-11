import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { toast } from 'ngx-sonner';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { ClientRow, ClientsTable, ClientStatus } from './components/clients-table/clients-table';
import { ClientFormModal } from './components/client-form-modal/client-form-modal';
import { ClientViewDrawer } from './components/client-view-drawer/client-view-drawer';
import { Modal } from '../../../shared/ui/modal/modal';
import { ClientService } from '../../../../core/features/users-clients/services/client.service';
import { Client } from '../../../../core/features/users-clients/models/client.model';
import { OrderService } from '../../../../core/features/orders/services/order.service';
import { Order, OrderStatus } from '../../../../core/features/orders/models/order.model';
import { RatingService } from '../../../../core/features/ratings/services/rating.service';
import { Rating } from '../../../../core/features/ratings/models/rating.model';
import { SupportChatService } from '../../../../core/features/support-chat/services/support-chat.service';
import {
  SupportInboxItem,
  SupportPartyType,
} from '../../../../core/features/support-chat/models/support-chat.model';
import { API_BASE_URL } from '../../../../core/shared/http/api-config';
import { buildAvatarUrl } from '../../../../core/shared/util/media-url';

type StatusFilter = 'Todos' | ClientStatus;
type DateSort = 'recent' | 'oldest';

const MONTH_ABBR = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate().toString().padStart(2, '0')} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

function toClientRow(client: Client, baseUrl: string, contractsCount: number): ClientRow {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    bi: client.bi,
    avatar: buildAvatarUrl(baseUrl, 'clients', client.image),
    contractsCount,
    createdAt: formatDate(client.created_at),
    createdAtIso: client.created_at,
    status: client.deleted_at ? 'Inativo' : 'Ativo',
  };
}

@Component({
  imports: [TitleHeader, ClientsTable, ClientFormModal, ClientViewDrawer, Modal],
  selector: 'app-clients',
  styleUrl: './clients.css',
  templateUrl: './clients.html',
})
export class Clients {
  private readonly clientService = inject(ClientService);
  private readonly orderService = inject(OrderService);
  private readonly ratingService = inject(RatingService);
  private readonly supportChatService = inject(SupportChatService);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly elementRef = inject(ElementRef);

  readonly filters: StatusFilter[] = ['Todos', 'Ativo', 'Inativo'];
  readonly filterLabels: Record<StatusFilter, string> = {
    Todos: 'Todos os Status',
    Ativo: 'Ativos',
    Inativo: 'Inativos',
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

  private readonly clients = signal<Client[]>([]);
  private readonly contractsCounts = signal<Map<string, number>>(new Map());

  readonly isFormModalOpen = signal(false);
  readonly editingClient = signal<Client | null>(null);

  readonly isViewDrawerOpen = signal(false);
  readonly viewingClient = signal<Client | null>(null);
  readonly viewingOrders = signal<Order[]>([]);
  readonly ordersLoading = signal(false);
  readonly viewingRatings = signal<Map<number, Rating>>(new Map());
  readonly viewingConversations = signal<SupportInboxItem[]>([]);
  readonly conversationsLoading = signal(false);

  readonly deletingClient = signal<Client | null>(null);
  readonly isDeleting = signal(false);
  readonly isDeleteConfirmOpen = computed(() => this.deletingClient() !== null);

  readonly filteredClients = computed<ClientRow[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();
    const sort = this.dateSort();
    const counts = this.contractsCounts();

    return this.clients()
      .map((client) => toClientRow(client, this.baseUrl, counts.get(client.id) ?? 0))
      .filter((client) => filter === 'Todos' || client.status === filter)
      .filter((client) => {
        if (!term) {
          return true;
        }
        return (
          client.name.toLowerCase().includes(term) ||
          client.email.toLowerCase().includes(term) ||
          client.phone.toLowerCase().includes(term) ||
          client.bi.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const diff = new Date(a.createdAtIso).getTime() - new Date(b.createdAtIso).getTime();
        return sort === 'recent' ? -diff : diff;
      });
  });

  constructor() {
    this.loadClients();
  }

  private loadClients(): void {
    this.clientService.findAll().subscribe({
      next: (clients) => this.clients.set(clients),
      error: (err) => console.error('Erro ao carregar clientes', err),
    });

    this.orderService.findAll().subscribe({
      next: (orders) => {
        const counts = new Map<string, number>();
        orders.forEach((order) => {
          counts.set(order.client_id, (counts.get(order.client_id) ?? 0) + 1);
        });
        this.contractsCounts.set(counts);
      },
      error: (err) => console.error('Erro ao carregar contratos dos clientes', err),
    });
  }

  private findClientById(id: string): Client | null {
    return this.clients().find((client) => client.id === id) ?? null;
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

  openCreateModal(): void {
    this.editingClient.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(id: string): void {
    this.editingClient.set(this.findClientById(id));
    this.isFormModalOpen.set(true);
    this.isViewDrawerOpen.set(false);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
  }

  onClientSaved(): void {
    this.isFormModalOpen.set(false);
    this.loadClients();
  }

  openViewDrawer(id: string): void {
    const client = this.findClientById(id);
    this.viewingClient.set(client);
    this.viewingOrders.set([]);
    this.viewingRatings.set(new Map());
    this.viewingConversations.set([]);
    this.isViewDrawerOpen.set(true);

    if (!client) {
      return;
    }

    this.ordersLoading.set(true);
    this.orderService.findByClient(client.id).subscribe({
      next: (orders) => {
        this.ordersLoading.set(false);
        this.viewingOrders.set(orders);
        this.loadRatingsForDoneOrders(orders);
      },
      error: (err) => {
        this.ordersLoading.set(false);
        console.error('Erro ao carregar pedidos do cliente', err);
      },
    });

    this.conversationsLoading.set(true);
    this.supportChatService.listConversations({ search: client.name }).subscribe({
      next: (page) => {
        this.conversationsLoading.set(false);
        this.viewingConversations.set(
          page.data.filter(
            (conversation) =>
              conversation.party.role === SupportPartyType.CLIENT &&
              conversation.party.id === client.id,
          ),
        );
      },
      error: (err) => {
        this.conversationsLoading.set(false);
        console.error('Erro ao carregar conversas de suporte', err);
      },
    });
  }

  private loadRatingsForDoneOrders(orders: Order[]): void {
    const doneOrders = orders.filter((order) => order.status === OrderStatus.DONE);
    if (doneOrders.length === 0) {
      return;
    }

    forkJoin(
      doneOrders.map((order) =>
        this.ratingService.getForOrder(order.id).pipe(catchError(() => of(null))),
      ),
    ).subscribe((ratings) => {
      const map = new Map<number, Rating>();
      doneOrders.forEach((order, index) => {
        const rating = ratings[index];
        if (rating) {
          map.set(order.id, rating);
        }
      });
      this.viewingRatings.set(map);
    });
  }

  closeViewDrawer(): void {
    this.isViewDrawerOpen.set(false);
  }

  requestDelete(id: string): void {
    this.deletingClient.set(this.findClientById(id));
  }

  cancelDelete(): void {
    if (this.isDeleting()) {
      return;
    }
    this.deletingClient.set(null);
  }

  confirmDelete(): void {
    const client = this.deletingClient();
    if (!client || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.clientService.remove(client.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deletingClient.set(null);
        toast.success('Cliente eliminado com sucesso');

        if (this.editingClient()?.id === client.id) {
          this.isFormModalOpen.set(false);
        }
        if (this.viewingClient()?.id === client.id) {
          this.isViewDrawerOpen.set(false);
        }

        this.loadClients();
      },
      error: (err) => {
        this.isDeleting.set(false);
        toast.error('Não foi possível eliminar o cliente', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
