import { Media } from '../../../shared/models/common.model';

export type { Media };

/** Corpo de `POST /medias/upload-image` (`multipart/form-data`). */
export interface UploadMediaRequest {
  item_id: number;
  item_type: string;
  /** Ficheiro de imagem. Validado pela API como `image/*`. */
  file: File;
}

/** Corpo de `PATCH /medias/:id`. */
export interface UpdateMediaRequest {
  item_id?: number;
  item_type?: string;
  filename?: string;
  path?: string;
  mimetype?: string;
  type?: string;
}
