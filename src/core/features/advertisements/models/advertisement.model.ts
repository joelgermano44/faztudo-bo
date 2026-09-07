import { Media } from '../../../shared/models/common.model';

/** Banner publicitário. */
export interface Advertisement {
  id: number;
  title: string;
  description: string | null;
  link: string;
  is_active: boolean;
  clicks: number;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  images?: Media[];
}

/** Corpo de `POST /admin/advertisements` — `multipart/form-data`, pelo menos uma imagem. */
export interface CreateAdvertisementRequest {
  title: string;
  description?: string | null;
  link: string;
  is_active?: boolean;
  /** Pelo menos uma. */
  images: File[];
}

/** Corpo de `PATCH /admin/advertisements/:id`. As imagens enviadas são acrescentadas às atuais. */
export type UpdateAdvertisementRequest = Partial<Omit<CreateAdvertisementRequest, 'images'>> & {
  images?: File[];
};
