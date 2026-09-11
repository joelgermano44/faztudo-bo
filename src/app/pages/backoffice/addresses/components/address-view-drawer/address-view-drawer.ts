import { Component, computed, input, output } from '@angular/core';
import { Drawer } from '../../../../../shared/ui/drawer/drawer';
import { Address } from '../../../../../../core/features/address/models/address.model';

@Component({
  imports: [Drawer],
  selector: 'app-address-view-drawer',
  styleUrl: './address-view-drawer.css',
  templateUrl: './address-view-drawer.html',
})
export class AddressViewDrawer {
  readonly open = input(false);
  readonly address = input<Address | null>(null);
  readonly clientsCount = input(0);
  readonly professionalsCount = input(0);
  readonly ordersCount = input(0);

  readonly closed = output<void>();

  readonly isActive = computed(() => this.address()?.deleted_at === null);

  readonly statusBadgeClass = computed(() =>
    this.isActive() ? 'bg-primary text-[#161E00]' : 'bg-gray-100 text-[#436746]',
  );

  readonly totalUsages = computed(
    () => this.clientsCount() + this.professionalsCount() + this.ordersCount(),
  );

  readonly mapsUrl = computed(() => {
    const latLng = this.address()?.lat_lng;
    if (!latLng) {
      return null;
    }
    return `https://www.google.com/maps?q=${latLng.lat},${latLng.lng}`;
  });

  requestClose(): void {
    this.closed.emit();
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return '—';
    }
    return new Date(value).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
