import { Media } from '../../../shared/models/common.model';
import type { Category } from '../../categories/models/category.model';

/** Quem criou o serviço no catálogo. `PROFESSIONAL` é privado a quem o criou. */
export enum ServiceOrigin {
  ADMIN = 'ADMIN',
  PROFESSIONAL = 'PROFESSIONAL',
}

/** Serviço do catálogo. O preço não vive aqui — cada profissional define o seu. */
export interface Service {
  id: number;
  name: string;
  origin: ServiceOrigin;
  description: string;
  image: Media | null;
  images?: Media[];
  category: Category;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

/**
 * Corpo comum de criação/atualização de um serviço, em `multipart/form-data`
 * por causa das imagens.
 *
 * Usado tanto por `POST/PATCH /admin/services[/:id]` como por
 * `POST/PATCH /professionals/:profId/service[/:id]`.
 */
export interface CreateServiceRequest {
  name: string;
  description: string;
  category_id: number;
  /** Imagem principal. Obrigatória na criação. */
  image?: File;
  /** Galeria adicional, até 40 imagens. */
  images?: File[];
  /** Preço da oferta. Obrigatório ao associar profissional(is). */
  price?: number;
  /** Valor da deslocação. Omitido, fica a 0. */
  travel_price?: number;
  /** Vários profissionais (só em `/admin/services`). */
  professional_ids?: number[];
  /** Um único profissional (só em `/admin/services`, alternativa a `professional_ids`). */
  professional_id?: number;
}

export type UpdateServiceRequest = Partial<CreateServiceRequest>;
