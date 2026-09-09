import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../../../core/features/auth/services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [[RouterLink, RouterLinkActive]],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  navItems = [
    {
      title: 'Gestão Geral',
      items: [
        {
          label: 'Dashboard',
          route: '/dashboard',
          icon: '/icons/dashboard/sidebar/dashboard.svg',
          activeIcon: '/icons/dashboard/sidebar/active/dashboard.svg',
        },
        {
          label: 'Chat de Suporte',
          route: '/dashboard/admin-support-chat',
          icon: '/icons/dashboard/sidebar/chat.svg',
          activeIcon: '/icons/dashboard/sidebar/active/chat.svg',
        },
        {
          label: 'Admnistradores',
          route: '/dashboard/administrators',
          icon: '/icons/dashboard/sidebar/admin.svg',
          activeIcon: '/icons/dashboard/sidebar/active/admin.svg',
        },
        {
          label: 'Serviços',
          route: '/dashboard/services',
          icon: '/icons/dashboard/sidebar/services.svg',
          activeIcon: '/icons/dashboard/sidebar/active/services.svg',
        },
        {
          label: 'Candidaturas',
          route: '/dashboard/professional-applications',
          icon: '/icons/dashboard/sidebar/applications.svg',
          activeIcon: '/icons/dashboard/sidebar/active/applications.svg',
        },
        {
          label: 'Contratos',
          route: '/dashboard/orders',
          icon: '/icons/dashboard/sidebar/contract.svg',
          activeIcon: '/icons/dashboard/sidebar/active/contract.svg',
        },
        {
          label: 'Pagamentos',
          route: '/dashboard/payments',
          icon: '/icons/dashboard/sidebar/payments.svg',
          activeIcon: '/icons/dashboard/sidebar/active/payments.svg',
        },
        {
          label: 'Notificações',
          route: '/dashboard/notifications',
          icon: '/icons/dashboard/sidebar/notifications.svg',
          activeIcon: '/icons/dashboard/sidebar/active/notifications.svg',
        },
      ],
    },

    {
      title: 'Gestão App',
      items: [
        {
          label: 'Publicidades',
          route: '/dashboard/advertisements',
          icon: '/icons/dashboard/sidebar/advertisements.svg',
          activeIcon: '/icons/dashboard/sidebar/active/advertisements.svg',
        },
        {
          label: 'Categorias',
          route: '/dashboard/categories',
          icon: '/icons/dashboard/sidebar/category.svg',
          activeIcon: '/icons/dashboard/sidebar/active/category.svg',
        },
        {
          label: 'Clientes',
          route: '/dashboard/clients-users',
          icon: '/icons/dashboard/sidebar/users.svg',
          activeIcon: '/icons/dashboard/sidebar/active/users.svg',
        },
        {
          label: 'Profissionais',
          route: '/dashboard/professionals-users',
          icon: '/icons/dashboard/sidebar/professional.svg',
          activeIcon: '/icons/dashboard/sidebar/active/professional.svg',
        },
        {
          label: 'Endereços',
          route: '/dashboard/addresses',
          icon: '/icons/dashboard/sidebar/location.svg',
          activeIcon: '/icons/dashboard/sidebar/active/location.svg',
        },
      ],
    },
  ];

  private readonly collapsedGroups = signal(
    new Set(
      this.navItems.filter((item) => item.title !== 'Gestão Geral').map((item) => item.title),
    ),
  );

  isGroupOpen(title: string): boolean {
    return !this.collapsedGroups().has(title);
  }

  toggleGroup(title: string): void {
    this.collapsedGroups.update((collapsed) => {
      const next = new Set(collapsed);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
