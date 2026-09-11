import { Component, computed, ElementRef, HostListener, inject, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../../../core/features/auth/services/auth.service';
import { NotificationService } from '../../../../../../core/features/notifications/services/notification.service';
import {
  formatNotificationTimestamp,
  notificationIcon,
  notificationTarget,
} from '../../../../../../core/features/notifications/notification.util';
import { AdminNotification } from '../../../../../../core/features/notifications/models/notification.model';
import { ClientService } from '../../../../../../core/features/users-clients/services/client.service';
import { Client } from '../../../../../../core/features/users-clients/models/client.model';
import { ProfessionalService } from '../../../../../../core/features/professionals/services/professional.service';
import { Professional } from '../../../../../../core/features/professionals/models/professional.model';
import { AdminService } from '../../../../../../core/features/admins/services/admin.service';
import { Admin } from '../../../../../../core/features/admins/models/admin.model';
import { OrderService } from '../../../../../../core/features/orders/services/order.service';
import { Order } from '../../../../../../core/features/orders/models/order.model';
import { ServiceCatalogService } from '../../../../../../core/features/services/services/service.service';
import { Service } from '../../../../../../core/features/services/models/service.model';
import { CategoryService } from '../../../../../../core/features/categories/services/category.service';
import { Category } from '../../../../../../core/features/categories/models/category.model';
import { AdvertisementService } from '../../../../../../core/features/advertisements/services/advertisement.service';
import { Advertisement } from '../../../../../../core/features/advertisements/models/advertisement.model';
import { AddressService } from '../../../../../../core/features/address/services/address.service';
import { Address } from '../../../../../../core/features/address/models/address.model';

/** Um resultado da pesquisa global, já normalizado para exibição/navegação. */
interface SearchResult {
  group: string;
  label: string;
  sublabel: string;
  commands: unknown[];
  queryParams?: Record<string, string>;
}

const MAX_RESULTS_PER_GROUP = 4;

@Component({
  imports: [RouterLink],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  private readonly clientService = inject(ClientService);
  private readonly professionalService = inject(ProfessionalService);
  private readonly adminService = inject(AdminService);
  private readonly orderService = inject(OrderService);
  private readonly serviceCatalogService = inject(ServiceCatalogService);
  private readonly categoryService = inject(CategoryService);
  private readonly advertisementService = inject(AdvertisementService);
  private readonly addressService = inject(AddressService);

  /** Emite quando o botão de menu (visível só em max-lg) é clicado. Não afeta o desktop. */
  readonly menuToggle = output<void>();

  readonly isMenuOpen = signal(false);
  readonly isNotificationsOpen = signal(false);
  readonly currentUser = this.authService.currentUser;

  readonly unreadCount = this.notificationService.unreadCount;
  readonly recentNotifications = computed(() => this.notificationService.notifications().slice(0, 4));

  readonly searchTerm = signal('');
  readonly isSearchOpen = signal(false);
  readonly searchLoading = signal(false);

  private readonly searchDataLoaded = signal(false);
  private readonly clients = signal<Client[]>([]);
  private readonly professionals = signal<Professional[]>([]);
  private readonly admins = signal<Admin[]>([]);
  private readonly orders = signal<Order[]>([]);
  private readonly services = signal<Service[]>([]);
  private readonly categories = signal<Category[]>([]);
  private readonly advertisements = signal<Advertisement[]>([]);
  private readonly addresses = signal<Address[]>([]);

  readonly searchResults = computed<SearchResult[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return [];
    }

    const results: SearchResult[] = [];

    const matches = <T>(items: T[], text: (item: T) => string) =>
      items.filter((item) => text(item).toLowerCase().includes(term)).slice(0, MAX_RESULTS_PER_GROUP);

    matches(this.clients(), (c) => `${c.name} ${c.email}`).forEach((client) =>
      results.push({
        group: 'Clientes',
        label: client.name,
        sublabel: client.email,
        commands: ['/dashboard/clients-users'],
        queryParams: { q: client.name },
      }),
    );

    matches(this.professionals(), (p) => `${p.name} ${p.email}`).forEach((professional) =>
      results.push({
        group: 'Profissionais',
        label: professional.name,
        sublabel: professional.email,
        commands: ['/dashboard/professionals-users'],
        queryParams: { q: professional.name },
      }),
    );

    matches(this.admins(), (a) => `${a.name} ${a.email}`).forEach((admin) =>
      results.push({
        group: 'Administradores',
        label: admin.name,
        sublabel: admin.email,
        commands: ['/dashboard/administrators'],
        queryParams: { q: admin.name },
      }),
    );

    matches(
      this.orders(),
      (o) => `#${o.id} ${o.client?.name ?? ''} ${o.professional?.name ?? ''} ${o.service?.name ?? ''}`,
    ).forEach((order) =>
      results.push({
        group: 'Contratos',
        label: `#CTR-${order.id} · ${order.service?.name ?? ''}`,
        sublabel: `${order.client?.name ?? ''} · ${order.professional?.name ?? ''}`,
        commands: ['/dashboard/orders', order.id],
      }),
    );

    matches(this.services(), (s) => s.name).forEach((service) =>
      results.push({
        group: 'Serviços',
        label: service.name,
        sublabel: service.category?.name ?? '',
        commands: ['/dashboard/services'],
        queryParams: { q: service.name },
      }),
    );

    matches(this.categories(), (c) => c.name).forEach((category) =>
      results.push({
        group: 'Categorias',
        label: category.name,
        sublabel: 'Categoria',
        commands: ['/dashboard/categories'],
        queryParams: { q: category.name },
      }),
    );

    matches(this.advertisements(), (a) => a.title).forEach((advertisement) =>
      results.push({
        group: 'Publicidades',
        label: advertisement.title,
        sublabel: 'Campanha',
        commands: ['/dashboard/advertisements'],
        queryParams: { q: advertisement.title },
      }),
    );

    matches(this.addresses(), (a) => `${a.address ?? ''} ${a.municiple} ${a.province}`).forEach(
      (address) =>
        results.push({
          group: 'Endereços',
          label: address.address || `${address.municiple}, ${address.province}`,
          sublabel: `${address.municiple}, ${address.province}`,
          commands: ['/dashboard/addresses'],
          queryParams: { q: address.address || address.municiple },
        }),
    );

    return results;
  });

  constructor() {
    this.notificationService.refresh();
    this.notificationService.refreshUnreadCount();
  }

  notificationIcon(eventType: string): string {
    return notificationIcon(eventType);
  }

  notificationTimestamp(iso: string): string {
    return formatNotificationTimestamp(iso);
  }

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
    this.isNotificationsOpen.set(false);
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.update((open) => !open);
    this.isMenuOpen.set(false);
  }

  onNotificationClick(notification: AdminNotification): void {
    this.notificationService.markAsRead(notification.id);
    this.isNotificationsOpen.set(false);
    const target = notificationTarget(notification);
    this.router.navigate(target.commands, { queryParams: target.queryParams });
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  onSearchFocus(): void {
    this.isSearchOpen.set(true);
    if (!this.searchDataLoaded()) {
      this.loadSearchData();
    }
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.isSearchOpen.set(true);
  }

  private loadSearchData(): void {
    this.searchLoading.set(true);
    forkJoin({
      clients: this.clientService.findAll(),
      professionals: this.professionalService.findAll(),
      admins: this.adminService.findAll(),
      orders: this.orderService.findAll(),
      services: this.serviceCatalogService.findAllAsAdmin(),
      categories: this.categoryService.findAll(),
      advertisements: this.advertisementService.findAll(),
      addresses: this.addressService.findAll(),
    }).subscribe({
      next: (data) => {
        this.searchLoading.set(false);
        this.searchDataLoaded.set(true);
        this.clients.set(data.clients);
        this.professionals.set(data.professionals);
        this.admins.set(data.admins);
        this.orders.set(data.orders);
        this.services.set(data.services);
        this.categories.set(data.categories);
        this.advertisements.set(data.advertisements);
        this.addresses.set(data.addresses);
      },
      error: (err) => {
        this.searchLoading.set(false);
        console.error('Erro ao carregar dados de pesquisa', err);
      },
    });
  }

  selectSearchResult(result: SearchResult): void {
    this.isSearchOpen.set(false);
    this.searchTerm.set('');
    this.router.navigate(result.commands, { queryParams: result.queryParams });
  }

  /** Rótulo do `role` do JWT (`'admin'` -> `'Admin'`). */
  roleLabel(): string {
    const role = this.currentUser()?.role;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
  }

  logout(): void {
    this.isMenuOpen.set(false);
    this.notificationService.disconnect();
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
      this.isNotificationsOpen.set(false);
      this.isSearchOpen.set(false);
    }
  }
}
