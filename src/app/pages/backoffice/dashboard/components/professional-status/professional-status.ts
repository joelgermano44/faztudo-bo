import { Component, inject, signal } from '@angular/core';
import { ProfessionalAvailabilityStatus } from '../../../../../../core/features/professionals/models/professional.model';
import { ProfessionalService } from '../../../../../../core/features/professionals/services/professional.service';
import { Skeleton } from '../../../../../shared/ui/skeleton/skeleton';
import { EmptyState } from '../../../../../shared/ui/empty-state/empty-state';

interface ProfessionalStatusInterface {
  label: string;
  count: number;
  progressPercent: number;
  barColor: string;
}

@Component({
  imports: [Skeleton, EmptyState],
  selector: 'app-professional-status',
  styleUrl: './professional-status.css',
  templateUrl: './professional-status.html',
})
export class ProfessionalStatus {
  private readonly professionalService = inject(ProfessionalService);

  title = 'Status Profissionais';

  readonly items = signal<ProfessionalStatusInterface[]>([
    {
      label: 'Disponíveis',
      count: 0,
      progressPercent: 0,
      barColor: 'bg-[#006E25]',
    },
    {
      label: 'Em Serviço / Indisp.',
      count: 0,
      progressPercent: 0,
      barColor: 'bg-[#C2C8BE]',
    },
  ]);

  readonly isLoading = signal(true);
  readonly loadError = signal(false);

  constructor() {
    this.loadStatus();
  }

  private loadStatus(): void {
    this.isLoading.set(true);
    this.loadError.set(false);

    this.professionalService.findAll().subscribe({
      next: (professionals) => {
        this.isLoading.set(false);

        const available = professionals.filter(
          (professional) => professional.availability_status === ProfessionalAvailabilityStatus.AVAILABLE,
        ).length;
        const unavailable = professionals.length - available;
        const total = professionals.length || 1;

        this.items.update((items) => [
          {
            ...items[0],
            count: available,
            progressPercent: Math.round((available / total) * 100),
          },
          {
            ...items[1],
            count: unavailable,
            progressPercent: Math.round((unavailable / total) * 100),
          },
        ]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.loadError.set(true);
        console.error('Erro ao carregar profissionais', err);
      },
    });
  }

  retryLoad(): void {
    this.loadStatus();
  }
}
