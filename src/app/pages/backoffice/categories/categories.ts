import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { TitleHeader } from '../../layout/backoffice/components/title-header/title-header';
import { CategoriesTable, CategoryRow, CategoryStatus } from './components/categories-table/categories-table';
import { CategoryFormModal } from './components/category-form-modal/category-form-modal';
import { CategoryViewDrawer } from './components/category-view-drawer/category-view-drawer';
import { Modal } from '../../../shared/ui/modal/modal';
import { CategoryService } from '../../../../core/features/categories/services/category.service';
import { Category, CategoryWithServices } from '../../../../core/features/categories/models/category.model';

type StatusFilter = 'Todas' | CategoryStatus;

const MONTH_ABBR = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate().toString().padStart(2, '0')} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

function toCategoryRow(category: CategoryWithServices): CategoryRow {
  return {
    id: category.id,
    name: category.name,
    servicesCount: category.services.length,
    createdAt: formatDate(category.created_at),
    status: category.deleted_at ? 'Inativa' : 'Ativa',
  };
}

@Component({
  imports: [TitleHeader, CategoriesTable, CategoryFormModal, CategoryViewDrawer, Modal],
  selector: 'app-categories',
  styleUrl: './categories.css',
  templateUrl: './categories.html',
})
export class Categories {
  private readonly categoryService = inject(CategoryService);
  private readonly elementRef = inject(ElementRef);

  readonly filters: StatusFilter[] = ['Todas', 'Ativa', 'Inativa'];
  readonly filterLabels: Record<StatusFilter, string> = {
    Todas: 'Todos os Status',
    Ativa: 'Ativas',
    Inativa: 'Inativas',
  };

  readonly activeFilter = signal<StatusFilter>('Todas');
  readonly isStatusMenuOpen = signal(false);
  readonly searchTerm = signal('');

  private readonly categories = signal<CategoryWithServices[]>([]);

  readonly isFormModalOpen = signal(false);
  readonly editingCategory = signal<Category | null>(null);

  readonly isViewDrawerOpen = signal(false);
  readonly viewingCategory = signal<CategoryWithServices | null>(null);

  readonly deletingCategory = signal<CategoryWithServices | null>(null);
  readonly isDeleting = signal(false);
  readonly isDeleteConfirmOpen = computed(() => this.deletingCategory() !== null);

  readonly filteredCategories = computed<CategoryRow[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();

    return this.categories()
      .map((category) => toCategoryRow(category))
      .filter((category) => filter === 'Todas' || category.status === filter)
      .filter((category) => {
        if (!term) {
          return true;
        }
        return category.id.toString().includes(term) || category.name.toLowerCase().includes(term);
      });
  });

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.findAllWithServices().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('Erro ao carregar categorias', err),
    });
  }

  private findCategoryById(id: number): CategoryWithServices | null {
    return this.categories().find((category) => category.id === id) ?? null;
  }

  toggleStatusMenu(): void {
    this.isStatusMenuOpen.update((open) => !open);
  }

  setFilter(filter: StatusFilter): void {
    this.activeFilter.set(filter);
    this.isStatusMenuOpen.set(false);
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isStatusMenuOpen.set(false);
    }
  }

  openCreateModal(): void {
    this.editingCategory.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(id: number): void {
    this.editingCategory.set(this.findCategoryById(id));
    this.isFormModalOpen.set(true);
  }

  closeFormModal(): void {
    this.isFormModalOpen.set(false);
  }

  onCategorySaved(): void {
    this.isFormModalOpen.set(false);
    this.loadCategories();
  }

  openViewDrawer(id: number): void {
    this.viewingCategory.set(this.findCategoryById(id));
    this.isViewDrawerOpen.set(true);
  }

  closeViewDrawer(): void {
    this.isViewDrawerOpen.set(false);
  }

  requestDelete(id: number): void {
    this.deletingCategory.set(this.findCategoryById(id));
  }

  cancelDelete(): void {
    if (this.isDeleting()) {
      return;
    }
    this.deletingCategory.set(null);
  }

  confirmDelete(): void {
    const category = this.deletingCategory();
    if (!category || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.categoryService.remove(category.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deletingCategory.set(null);
        toast.success('Categoria eliminada com sucesso');

        if (this.editingCategory()?.id === category.id) {
          this.isFormModalOpen.set(false);
        }
        if (this.viewingCategory()?.id === category.id) {
          this.isViewDrawerOpen.set(false);
        }

        this.loadCategories();
      },
      error: (err) => {
        this.isDeleting.set(false);
        toast.error('Não foi possível eliminar a categoria', {
          description: err?.error?.message ?? 'Tente novamente mais tarde.',
        });
      },
    });
  }
}
