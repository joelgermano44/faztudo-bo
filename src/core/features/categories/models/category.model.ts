import type { Service } from '../../services/models/service.model';

/** Categoria de serviços. */
export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

/** Categoria com os serviços vinculados (`GET /categories/with-services`). */
export interface CategoryWithServices extends Category {
  services: Service[];
}

/** Corpo de `POST /categories`. */
export interface CreateCategoryRequest {
  name: string;
}

/** Corpo de `PATCH /categories/:id`. */
export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;
