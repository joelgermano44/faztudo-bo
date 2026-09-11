import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { toast } from 'ngx-sonner';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { AddressesTable, AddressRow, AddressStatus } from './components/addresses-table/addresses-table';
import { AddressFormModal } from './components/address-form-modal/address-form-modal';
import { AddressViewDrawer } from './components/address-view-drawer/address-view-drawer';
import { Modal } from '../../../shared/ui/modal/modal';
import { AddressService } from '../../../../core/features/address/services/address.service';
import { Address } from '../../../../core/features/address/models/address.model';
import { ClientService } from '../../../../core/features/users-clients/services/client.service';
import { ProfessionalService } from '../../../../core/features/professionals/services/professional.service';
import { OrderService } from '../../../../core/features/orders/services/order.service';

type StatusFilter = 'Todas' | AddressStatus;

interface UsageCounts {
  clients: number;
  professionals: number;
  orders: number;
}

const EMPTY_USAGE: UsageCounts = { clients: 0, professionals: 0, orders: 0 };

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

function toAddressRow(address: Address, usage: UsageCounts): AddressRow {
  return {
    id: address.id,
    street: address.address || 'Sem endereço',
    municiple: address.municiple,
    province: address.province,
    coordinates: address.lat_lng ? `${address.lat_lng.lat}, ${address.lat_lng.lng}` : null,
    usageCount: usage.clients + usage.professionals + usage.orders,
    createdAt: formatDate(address.createdAt),
    createdAtIso: address.createdAt,
    status: address.deleted_at ? 'Inativa' : 'Ativa',
  };
}

@Component({
  imports: [TitleHeader, AddressesTable, AddressFormModal, AddressViewDrawer, Modal],
  selector: 'app-addresses',
  styleUrl: './addresses.css',
  templateUrl: './addresses.html',
})
export class Addresses {
  private readonly addressService = inject(AddressService);
  private readonly clientService = inject(ClientService);
  private readonly professionalService = inject(ProfessionalService);
  private readonly orderService = inject(OrderService);
  private readonly elementRef = inject(ElementRef);

  readonly filters: StatusFilter[] = ['Todas', 'Ativa', 'Inativa'];
  readonly filterLabels: Record<StatusFilter, string> = {
    Todas: 'Todos os Status',
    Ativa: 'Ativas',
    Inativa: 'Inativas',
  };

  readonly activeFilter = signal<StatusFilter>('Todas');
  readonly isStatusMenuOpen = signal(false);
  readonly searchTerm = signal('');

  private readonly addresses = signal<Address[]>([]);
  private readonly usageByAddressId = signal<Map<number, UsageCounts>>(new Map());

  readonly isFormModalOpen = signal(false);
  readonly editingAddress = signal<Address | null>(null);

  readonly isViewDrawerOpen = signal(false);
  readonly viewingAddress = signal<Address | null>(null);

  readonly deletingAddress = signal<Address | null>(null);
  readonly isDeleting = signal(false);
  readonly isDeleteConfirmOpen = computed(() => this.deletingAddress() !== null);

  readonly viewingUsage = computed<UsageCounts>(() => {
    const address = this.viewingAddress();
    return address ? (this.usageByAddressId().get(address.id) ?? EMPTY_USAGE) : EMPTY_USAGE;
  });

  readonly deletingUsage = computed<UsageCounts>(() => {
    const address = this.deletingAddress();
    return address ? (this.usageByAddressId().get(address.id) ?? EMPTY_USAGE) : EMPTY_USAGE;
  });

  readonly filteredAddresses = computed<AddressRow[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();
    const usageMap = this.usageByAddressId();

    return this.addresses()
      .map((address) => toAddressRow(address, usageMap.get(address.id) ?? EMPTY_USAGE))
      .filter((address) => filter === 'Todas' || address.status === filter)
      .filter((address) => {
        if (!term) {
          return true;
        }
        return (
          address.id.toString().includes(term) ||
          address.street.toLowerCase().includes(term) ||
          address.municiple.toLowerCase().includes(term) ||
          address.province.toLowerCase().includes(term)
        );
      });
  });

  constructor() {
    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.addressService.findAll().subscribe({
      next: (addresses) => this.addresses.set(addresses),
      error: (err) => console.error('Erro ao carregar moradas', err),
    });

    forkJoin({
      clients: this.clientService.findAll(),
      professionals: this.professionalService.findAll(),
      orders: this.orderService.findAll(),
    }).subscribe({
      next: ({ clients, professionals, orders }) => {
        const usage = new Map<number, UsageCounts>();

        const bump = (id: number | undefined, key: keyof UsageCounts) => {
          if (id == null) {
            return;
          }
          const current = usage.get(id) ?? { clients: 0, professionals: 0, orders: 0 };
          current[key] += 1;
          usage.set(id, current);
        };

        clients.forEach((client) => bump(client.address?.id, 'clients'));
        professionals.forEach((professional) => bump(professional.address?.id, 'professionals'));
        orders.forEach((order) => bump(order.address?.id, 'orders'));

        this.usageByAddressId.set(usage);
      },
      error: (err) => console.error('Erro ao carregar vínculos das moradas', err),
    });
  }

  private findAddressById(id: number): Address | null {
    return this.addresses().find((address) => address.id === id) ?? null;
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
    this.editingAddress.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(id: number): void {
    this.editingAddress.set(this.findAddressById(id));
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
  }

  onAddressSaved(): void {
    this.isFormModalOpen.set(false);
    this.loadAddresses();
  }

  openViewDrawer(id: number): void {
    this.viewingAddress.set(this.findAddressById(id));
    this.isViewDrawerOpen.set(true);
  }

  closeViewDrawer(): void {
    this.isViewDrawerOpen.set(false);
  }

  requestDelete(id: number): void {
    this.deletingAddress.set(this.findAddressById(id));
  }

  cancelDelete(): void {
    if (this.isDeleting()) {
      return;
    }
    this.deletingAddress.set(null);
  }

  confirmDelete(): void {
    const address = this.deletingAddress();
    if (!address || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.addressService.remove(address.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deletingAddress.set(null);
        toast.success('Morada eliminada com sucesso');

        if (this.editingAddress()?.id === address.id) {
          this.isFormModalOpen.set(false);
        }
        if (this.viewingAddress()?.id === address.id) {
          this.isViewDrawerOpen.set(false);
        }

        this.loadAddresses();
      },
      error: (err) => {
        this.isDeleting.set(false);
        toast.error('Não foi possível eliminar a morada', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
