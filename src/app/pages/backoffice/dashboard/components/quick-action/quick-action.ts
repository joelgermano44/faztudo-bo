import { Component } from '@angular/core';

interface QuickActionInterface {
  title: string;
  iconSvg: string;
}

@Component({
  imports: [],
  selector: 'app-quick-action',
  styleUrl: './quick-action.css',
  templateUrl: './quick-action.html',
})
export class QuickAction {
  actions: QuickActionInterface[] = [
    {
      title: 'Novo\nContrato',
      iconSvg: '/icons/dashboard/quick-action/contract.svg',
    },
    {
      title: 'Pagar\nPrestador',
      iconSvg: '/icons/dashboard/quick-action/pay-professional.svg',
    },
    {
      title: 'Gerar Fatura\nConsolidada',
      iconSvg: '/icons/dashboard/quick-action/fatura.svg',
    },
  ];
}
