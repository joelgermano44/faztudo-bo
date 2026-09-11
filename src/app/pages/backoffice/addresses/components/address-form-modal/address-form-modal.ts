import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { Modal } from '../../../../../shared/ui/modal/modal';
import { AddressService } from '../../../../../../core/features/address/services/address.service';
import { Address } from '../../../../../../core/features/address/models/address.model';

@Component({
  imports: [Modal, ReactiveFormsModule],
  selector: 'app-address-form-modal',
  styleUrl: './address-form-modal.css',
  templateUrl: './address-form-modal.html',
})
export class AddressFormModal {
  private readonly fb = inject(FormBuilder);
  private readonly addressService = inject(AddressService);

  readonly open = input(false);
  readonly address = input<Address | null>(null);

  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly editing = computed(() => this.address() !== null);

  readonly saving = signal(false);

  readonly form = this.fb.group({
    address: ['', Validators.required],
    municiple: ['', Validators.required],
    province: ['', Validators.required],
    lat: [''],
    lng: [''],
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        const address = this.address();
        this.form.reset({
          address: address?.address ?? '',
          municiple: address?.municiple ?? '',
          province: address?.province ?? '',
          lat: address?.lat_lng?.lat ?? '',
          lng: address?.lat_lng?.lng ?? '',
        });
        this.saving.set(false);
      }
    });
  }

  requestClose(): void {
    if (this.saving()) {
      return;
    }
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const currentAddress = this.address();

    const body = {
      address: raw.address ?? '',
      municiple: raw.municiple ?? '',
      province: raw.province ?? '',
      lat: raw.lat || undefined,
      lng: raw.lng || undefined,
    };

    const request = currentAddress
      ? this.addressService.update(currentAddress.id, body)
      : this.addressService.create(body);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        toast.success(currentAddress ? 'Morada atualizada com sucesso' : 'Morada criada com sucesso');
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        toast.error('Não foi possível guardar a morada', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
