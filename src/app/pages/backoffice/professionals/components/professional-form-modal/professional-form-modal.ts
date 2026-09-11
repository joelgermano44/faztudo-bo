import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { Modal } from '../../../../../shared/ui/modal/modal';
import { ProfessionalService } from '../../../../../../core/features/professionals/services/professional.service';
import { Professional } from '../../../../../../core/features/professionals/models/professional.model';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildAvatarUrl } from '../../../../../../core/shared/util/media-url';

/** `Professional.birthdate` vem em ISO; `<input type="date">` só aceita `YYYY-MM-DD`. */
function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

@Component({
  imports: [Modal, ReactiveFormsModule],
  selector: 'app-professional-form-modal',
  styleUrl: './professional-form-modal.css',
  templateUrl: './professional-form-modal.html',
})
export class ProfessionalFormModal {
  private readonly fb = inject(FormBuilder);
  private readonly professionalService = inject(ProfessionalService);
  private readonly baseUrl = inject(API_BASE_URL);

  readonly open = input(false);
  readonly professional = input<Professional | null>(null);

  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly saving = signal(false);
  readonly imageFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    bi: ['', Validators.required],
    nif: [''],
    birthdate: ['', Validators.required],
    about_me: [''],
    address: [''],
    municiple: [''],
    province: [''],
    lat: [''],
    lng: [''],
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.initializeForm(this.professional());
      }
    });
  }

  private initializeForm(professional: Professional | null): void {
    this.form.reset({
      name: professional?.name ?? '',
      email: professional?.email ?? '',
      phone: professional?.phone ?? '',
      bi: professional?.bi ?? '',
      nif: professional?.nif ?? '',
      birthdate: professional ? toDateInputValue(professional.birthdate) : '',
      about_me: professional?.about_me ?? '',
      address: professional?.address?.address ?? '',
      municiple: professional?.address?.municiple ?? '',
      province: professional?.address?.province ?? '',
      lat: professional?.address?.lat_lng?.lat ?? '',
      lng: professional?.address?.lat_lng?.lng ?? '',
    });
    this.imageFile.set(null);
    this.imagePreview.set(
      professional?.image ? buildAvatarUrl(this.baseUrl, 'professionals', professional.image) : null,
    );
    this.saving.set(false);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.imageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
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

    const professional = this.professional();
    if (!professional) {
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();

    const profileUpdate = this.professionalService.update(professional.id, {
      name: raw.name ?? undefined,
      email: raw.email ?? undefined,
      phone: raw.phone ?? undefined,
      bi: raw.bi ?? undefined,
      nif: raw.nif || undefined,
      birthdate: raw.birthdate ?? undefined,
      about_me: raw.about_me || undefined,
      image: this.imageFile() ?? undefined,
    });

    const addressUpdate = this.professionalService.updateAddress(professional.id, {
      address: raw.address || undefined,
      municiple: raw.municiple || undefined,
      province: raw.province || undefined,
      lat: raw.lat || undefined,
      lng: raw.lng || undefined,
    });

    forkJoin([profileUpdate, addressUpdate]).subscribe({
      next: () => {
        this.saving.set(false);
        toast.success('Profissional atualizado com sucesso');
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        toast.error('Não foi possível guardar o profissional', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
