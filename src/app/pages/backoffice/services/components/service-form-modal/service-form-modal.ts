import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { Modal } from '../../../../../shared/ui/modal/modal';
import { API_BASE_URL } from '../../../../../../core/shared/http/api-config';
import { buildMediaUrl } from '../../../../../../core/shared/util/media-url';
import { CategoryService } from '../../../../../../core/features/categories/services/category.service';
import { Category } from '../../../../../../core/features/categories/models/category.model';
import { ServiceCatalogService } from '../../../../../../core/features/services/services/service.service';
import {
  CreateServiceRequest,
  Service,
  UpdateServiceRequest,
} from '../../../../../../core/features/services/models/service.model';

@Component({
  imports: [Modal, ReactiveFormsModule],
  selector: 'app-service-form-modal',
  styleUrl: './service-form-modal.css',
  templateUrl: './service-form-modal.html',
})
export class ServiceFormModal {
  private readonly fb = inject(FormBuilder);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly categoryService = inject(CategoryService);
  private readonly serviceCatalogService = inject(ServiceCatalogService);

  readonly open = input(false);
  readonly service = input<Service | null>(null);

  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly editing = computed(() => this.service() !== null);

  readonly categories = signal<Category[]>([]);
  readonly saving = signal(false);

  readonly coverFile = signal<File | null>(null);
  readonly coverPreview = signal<string | null>(null);
  readonly galleryFiles = signal<File[]>([]);
  readonly existingGallery = signal<string[]>([]);

  readonly newGalleryPreviews = computed(() =>
    this.galleryFiles().map((file) => URL.createObjectURL(file)),
  );

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    category_id: [null as number | null, Validators.required],
  });

  constructor() {
    this.categoryService.findAll().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('Erro ao carregar categorias', err),
    });

    effect(() => {
      if (this.open()) {
        this.initializeForm(this.service());
      }
    });
  }

  private initializeForm(service: Service | null): void {
    this.form.reset({
      name: service?.name ?? '',
      description: service?.description ?? '',
      category_id: service?.category.id ?? null,
    });
    this.coverFile.set(null);
    this.coverPreview.set(service?.image ? buildMediaUrl(this.baseUrl, service.image) : null);
    this.galleryFiles.set([]);
    this.existingGallery.set((service?.images ?? []).map((media) => buildMediaUrl(this.baseUrl, media)));
    this.saving.set(false);
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) {
      return;
    }
    this.coverFile.set(file);
    this.coverPreview.set(URL.createObjectURL(file));
  }

  onGallerySelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) {
      return;
    }
    this.galleryFiles.update((current) => [...current, ...files]);
    input.value = '';
  }

  removeNewGalleryFile(index: number): void {
    this.galleryFiles.update((current) => current.filter((_, i) => i !== index));
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

    if (!this.editing() && !this.coverFile()) {
      toast.error('Selecione uma imagem de capa para o serviço.');
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const body: UpdateServiceRequest = {
      name: raw.name ?? undefined,
      description: raw.description ?? undefined,
      category_id: raw.category_id ?? undefined,
    };

    const cover = this.coverFile();
    if (cover) {
      body.image = cover;
    }

    const gallery = this.galleryFiles();
    if (gallery.length > 0) {
      body.images = gallery;
    }

    const currentService = this.service();
    const request = currentService
      ? this.serviceCatalogService.updateAsAdmin(currentService.id, body)
      : this.serviceCatalogService.createAsAdmin(body as CreateServiceRequest);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        toast.success(
          currentService ? 'Serviço atualizado com sucesso' : 'Serviço criado com sucesso',
        );
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        toast.error('Não foi possível guardar o serviço', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
