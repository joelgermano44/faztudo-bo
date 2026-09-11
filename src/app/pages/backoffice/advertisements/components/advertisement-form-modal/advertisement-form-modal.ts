import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { Modal } from '../../../../../shared/ui/modal/modal';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildMediaUrl } from '../../../../../../core/shared/util/media-url';
import { AdvertisementService } from '../../../../../../core/features/advertisements/services/advertisement.service';
import {
  Advertisement,
  CreateAdvertisementRequest,
} from '../../../../../../core/features/advertisements/models/advertisement.model';

interface ExistingImage {
  id: number;
  url: string;
}

@Component({
  imports: [Modal, ReactiveFormsModule],
  selector: 'app-advertisement-form-modal',
  styleUrl: './advertisement-form-modal.css',
  templateUrl: './advertisement-form-modal.html',
})
export class AdvertisementFormModal {
  private readonly fb = inject(FormBuilder);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly advertisementService = inject(AdvertisementService);

  readonly open = input(false);
  readonly advertisement = input<Advertisement | null>(null);

  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly editing = computed(() => this.advertisement() !== null);

  readonly saving = signal(false);
  readonly existingImages = signal<ExistingImage[]>([]);
  readonly newImages = signal<File[]>([]);

  readonly newImagePreviews = computed(() =>
    this.newImages().map((file) => URL.createObjectURL(file)),
  );

  readonly form = this.fb.group({
    title: ['', Validators.required],
    link: ['', Validators.required],
    description: [''],
    is_active: [true],
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.initializeForm(this.advertisement());
      }
    });
  }

  private initializeForm(advertisement: Advertisement | null): void {
    this.form.reset({
      title: advertisement?.title ?? '',
      link: advertisement?.link ?? '',
      description: advertisement?.description ?? '',
      is_active: advertisement?.is_active ?? true,
    });
    this.existingImages.set(
      (advertisement?.images ?? []).map((media) => ({
        id: media.id,
        url: buildMediaUrl(this.baseUrl, media),
      })),
    );
    this.newImages.set([]);
    this.saving.set(false);
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) {
      return;
    }
    this.newImages.update((current) => [...current, ...files]);
    input.value = '';
  }

  removeNewImage(index: number): void {
    this.newImages.update((current) => current.filter((_, i) => i !== index));
  }

  removeExistingImage(image: ExistingImage): void {
    const advertisement = this.advertisement();
    if (!advertisement) {
      return;
    }
    this.advertisementService.removeImage(advertisement.id, image.id).subscribe({
      next: () => {
        this.existingImages.update((current) => current.filter((item) => item.id !== image.id));
        toast.success('Imagem removida');
      },
      error: (err) => {
        toast.error('Não foi possível remover a imagem', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
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

    const currentAdvertisement = this.advertisement();

    if (!currentAdvertisement && this.newImages().length === 0) {
      toast.error('Adicione pelo menos uma imagem para a campanha.');
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();

    const request = currentAdvertisement
      ? this.advertisementService.update(currentAdvertisement.id, {
          title: raw.title ?? undefined,
          link: raw.link ?? undefined,
          description: raw.description || null,
          is_active: raw.is_active ?? undefined,
          images: this.newImages().length > 0 ? this.newImages() : undefined,
        })
      : this.advertisementService.create({
          title: raw.title ?? '',
          link: raw.link ?? '',
          description: raw.description || null,
          is_active: raw.is_active ?? true,
          images: this.newImages(),
        } as CreateAdvertisementRequest);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        toast.success(
          currentAdvertisement ? 'Campanha atualizada com sucesso' : 'Campanha criada com sucesso',
        );
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        toast.error('Não foi possível guardar a campanha', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
