import { Component } from '@angular/core';

interface Activity {
  colorClass: string;
  title: string;
  time: string;
}

@Component({
  imports: [],
  selector: 'app-recent-activities',
  styleUrl: './recent-activities.css',
  templateUrl: './recent-activities.html',
})
export class RecentActivities {
  activities: Activity[] = [
    {
      colorClass: 'bg-emerald-400',
      title: 'Novo contrato assinado - Cliente XPTO',
      time: 'Há 10 minutos',
    },
    {
      colorClass: 'bg-amber-500',
      title: 'Faturação consolidada gerada',
      time: 'Há 2 horas',
    },
    {
      colorClass: 'bg-red-700',
      title: 'Falha no processamento de pagamento #492',
      time: 'Há 4 horas',
    },
  ];
}
