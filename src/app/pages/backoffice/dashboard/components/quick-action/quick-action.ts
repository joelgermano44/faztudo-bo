import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfessionalApplicationStatus } from '../../../../../../core/features/professionals/models/professional.model';
import { ProfessionalPayoutStatus } from '../../../../../../core/features/payouts/models/payout.model';

interface QuickActionInterface {
  title: string;
  iconSvg: string;
  commands: unknown[];
  queryParams?: Record<string, string>;
}

@Component({
  imports: [RouterLink],
  selector: 'app-quick-action',
  styleUrl: './quick-action.css',
  templateUrl: './quick-action.html',
})
export class QuickAction {
  actions: QuickActionInterface[] = [
    {
      title: 'Candidaturas\nPendentes',
      iconSvg: '/icons/dashboard/sidebar/applications.svg',
      commands: ['/dashboard/professional-applications'],
      queryParams: { filter: ProfessionalApplicationStatus.SUBMETIDA },
    },
    {
      title: 'Pagar\nPrestador',
      iconSvg: '/icons/dashboard/quick-action/pay-professional.svg',
      commands: ['/dashboard/payments'],
      queryParams: { filter: ProfessionalPayoutStatus.PENDING },
    },
    {
      title: 'Pedidos em\nAberto',
      iconSvg: '/icons/dashboard/quick-action/contract.svg',
      commands: ['/dashboard/orders'],
      queryParams: { filter: 'Pendente' },
    },
  ];
}
