/**
 * Contratos partilhados por várias features. Mantidos aqui para não duplicar
 * o mesmo shape (Address, Media, etc.) em cada feature que os referencia.
 */

/** Perfil do utilizador autenticado (claim `role` do JWT). */
export enum Role {
  ADMIN = 'admin',
  CLIENT = 'client',
  PROFESSIONAL = 'professional',
}

/** Coordenadas de uma morada. */
export interface LatLng {
  id: number;
  lat: string;
  lng: string;
}

/** Morada (cliente, profissional ou pedido). */
export interface Address {
  id: number;
  province: string;
  municiple: string;
  address: string | null;
  lat_lng: LatLng | null;
  createdAt: string;
  updatedAt: string | null;
  deleted_at: string | null;
}

/** Corpo para criar/atualizar uma morada. Todos os campos são opcionais na atualização. */
export interface AddressRequest {
  municiple?: string;
  province?: string;
  address?: string;
  lat?: string | null;
  lng?: string | null;
}

/** Ficheiro (imagem/vídeo) guardado pela API. */
export interface Media {
  id: number;
  filename: string;
  path: string;
  mimetype: string;
  type: string;
  item_id: number;
  item_type: string;
  createdAt: string;
  updatedAt: string | null;
  deleted_at: string | null;
}

/** Corpo de erro produzido pelo `AllExceptionsFilter` da API. */
export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  field?: string;
}

/** Resultado de uma operação `DELETE` baseada em `repository.delete()` do TypeORM. */
export interface ApiDeleteResult {
  raw: unknown[];
  affected: number;
}

/** Confirmação simples devolvida por algumas rotas de eliminação. */
export interface ApiSuccessMessage {
  success: boolean;
  message: string;
}

/** Envelope de paginação por cursor (usado no chat de suporte). */
export interface CursorPage<T> {
  data: T[];
  next_cursor: number | null;
  has_more: boolean;
}

/** Parâmetros comuns de paginação por cursor. */
export interface CursorQueryParams {
  limit?: number;
  before?: number;
}
