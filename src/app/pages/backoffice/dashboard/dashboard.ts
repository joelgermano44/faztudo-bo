import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/features/auth/services/auth.service';
import { DashboardService } from '../../../../core/features/dashboard/services/dashboard.service';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { Dashcard } from './components/dashcard/dashcard';
import { MonthlyReport } from './components/monthly-report/monthly-report';
import { OrderFlow } from './components/order-flow/order-flow';
import { OrderFlowPoint } from '../../../../core/features/dashboard/models/dashboard.model';
import { PaymentSummary } from "./components/payment-summary/payment-summary";
import { ProfessionalStatus } from "./components/professional-status/professional-status";
import { QuickAction } from "./components/quick-action/quick-action";
import { RecentActivities } from "./components/recent-activities/recent-activities";

interface DashcardItem {
  icon: string;
  stat: string;
  title: string;
  indicator: string;
  money: boolean;
}

@Component({
  imports: [TitleHeader, Dashcard, MonthlyReport, OrderFlow, PaymentSummary, ProfessionalStatus, QuickAction, RecentActivities],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly currentUser = this.authService.currentUser;

  readonly ordersFlow = signal<OrderFlowPoint[]>([]);

  readonly dashcardItems = signal<DashcardItem[]>([
    {
      icon: '/icons/dashboard/dashcard/faturamento.svg',
      stat: '',
      title: 'Faturamento',
      indicator: '0',
      money: true,
    },
    {
      icon: '/icons/dashboard/dashcard/pedidos.svg',
      stat: '',
      title: 'Pedidos BO',
      indicator: '0',
      money: false,
    },
    {
      icon: '/icons/dashboard/dashcard/servicos.svg',
      stat: '',
      title: 'Serviços',
      indicator: '0',
      money: false,
    },
    {
      icon: '/icons/dashboard/dashcard/profissionais.svg',
      stat: '',
      title: 'Usuários Profissionais',
      indicator: '0',
      money: false,
    },
  ]);

  constructor() {
    this.dashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashcardItems.update((items) => [
          {
            ...items[0],
            indicator: dashboard.totalRevenue.toLocaleString('en-US', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }),
          },
          { ...items[1], indicator: dashboard.totalOrders.toString() },
          { ...items[2], indicator: dashboard.totalServices.toString() },
          { ...items[3], indicator: dashboard.totalProfessionals.toString() },
        ]);
        this.ordersFlow.set(dashboard.ordersFlow);
      },
      error: (err) => console.error('Erro ao carregar dashboard', err),
    });
  }

  roleLabel(): string {
    const role = this.currentUser()?.role;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
  }
}
