import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { toast } from 'ngx-sonner';
import { Modal } from '../../../../../shared/ui/modal/modal';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildAvatarUrl } from '../../../../../../core/shared/util/media-url';
import { ClientService } from '../../../../../../core/features/users-clients/services/client.service';
import { AddressService } from '../../../../../../core/features/address/services/address.service';
import { Client } from '../../../../../../core/features/users-clients/models/client.model';

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

@Component({
  imports: [Modal, ReactiveFormsModule],
  selector: 'app-client-form-modal',
  styleUrl: './client-form-modal.css',
  templateUrl: './client-form-modal.html',
})
export class ClientFormModal {
  private readonly fb = inject(FormBuilder);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly clientService = inject(ClientService);
  private readonly addressService = inject(AddressService);

  readonly open = input(false);
  readonly client = input<Client | null>(null);

  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly editing = computed(() => this.client() !== null);

  readonly saving = signal(false);
  readonly showPassword = signal(false);
  readonly avatarFile = signal<File | null>(null);
  readonly avatarPreview = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    bi: ['', Validators.required],
    birthdate: ['', Validators.required],
    password: [''],
    province: ['', Validators.required],
    municiple: ['', Validators.required],
    address: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.initializeForm(this.client());
      }
    });
  }

  private initializeForm(client: Client | null): void {
    this.form.reset({
      name: client?.name ?? '',
      email: client?.email ?? '',
      phone: client?.phone ?? '',
      bi: client?.bi ?? '',
      birthdate: client ? toDateInputValue(client.birthdate) : '',
      password: '',
      province: client?.address?.province ?? '',
      municiple: client?.address?.municiple ?? '',
      address: client?.address?.address ?? '',
    });
    this.avatarFile.set(null);
    this.avatarPreview.set(client?.image ? buildAvatarUrl(this.baseUrl, 'clients', client.image) : null);
    this.showPassword.set(false);
    this.saving.set(false);

    const passwordControl = this.form.controls.password;
    if (client) {
      passwordControl.clearValidators();
    } else {
      passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
    }
    passwordControl.updateValueAndValidity();
  }

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      return;
    }
    this.avatarFile.set(file);
    this.avatarPreview.set(URL.createObjectURL(file));
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
    const currentClient = this.client();

    if (currentClient) {
      this.clientService
        .update(currentClient.id, {
          name: raw.name ?? undefined,
          email: raw.email ?? undefined,
          phone: raw.phone ?? undefined,
          bi: raw.bi ?? undefined,
          birthdate: raw.birthdate ?? undefined,
          image: this.avatarFile() ?? undefined,
        })
        .pipe(
          switchMap(() =>
            this.clientService.updateAddress(currentClient.id, {
              province: raw.province ?? undefined,
              municiple: raw.municiple ?? undefined,
              address: raw.address ?? undefined,
            }),
          ),
        )
        .subscribe({
          next: () => {
            this.saving.set(false);
            toast.success('Cliente atualizado com sucesso');
            this.saved.emit();
          },
          error: (err) => {
            this.saving.set(false);
            toast.error('Não foi possível guardar o cliente', {
              description: err?.error?.message ?? 'Tente novamente mais tarde.',
            });
          },
        });
      return;
    }

    this.addressService
      .create({
        province: raw.province ?? '',
        municiple: raw.municiple ?? '',
        address: raw.address ?? '',
      })
      .pipe(
        switchMap((newAddress) =>
          this.clientService.create({
            name: raw.name ?? '',
            email: raw.email ?? '',
            phone: raw.phone ?? '',
            bi: raw.bi ?? '',
            birthdate: raw.birthdate ?? '',
            password: raw.password ?? '',
            address_id: newAddress.id,
          }),
        ),
        catchError((err) => {
          toast.error('Não foi possível criar o cliente', {
            description: err?.error?.message ?? 'Tente novamente mais tarde.',
          });
          return of(null);
        }),
      )
      .subscribe((created) => {
        this.saving.set(false);
        if (created) {
          toast.success('Cliente criado com sucesso');
          this.saved.emit();
        }
      });
  }
}
