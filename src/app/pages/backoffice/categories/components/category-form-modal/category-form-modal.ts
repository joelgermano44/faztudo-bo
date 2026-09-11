import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { Modal } from '../../../../../shared/ui/modal/modal';
import { CategoryService } from '../../../../../../core/features/categories/services/category.service';
import { Category } from '../../../../../../core/features/categories/models/category.model';

@Component({
  imports: [Modal, ReactiveFormsModule],
  selector: 'app-category-form-modal',
  styleUrl: './category-form-modal.css',
  templateUrl: './category-form-modal.html',
})
export class CategoryFormModal {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);

  readonly open = input(false);
  readonly category = input<Category | null>(null);

  readonly saved = output<void>();
  readonly closed = output<void>();

  readonly editing = computed(() => this.category() !== null);

  readonly saving = signal(false);

  readonly form = this.fb.group({
    name: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.form.reset({ name: this.category()?.name ?? '' });
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
    const name = this.form.getRawValue().name ?? '';
    const currentCategory = this.category();

    const request = currentCategory
      ? this.categoryService.update(currentCategory.id, { name })
      : this.categoryService.create({ name });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        toast.success(
          currentCategory ? 'Categoria atualizada com sucesso' : 'Categoria criada com sucesso',
        );
        this.saved.emit();
      },
      error: (err) => {
        this.saving.set(false);
        toast.error('Não foi possível guardar a categoria', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
