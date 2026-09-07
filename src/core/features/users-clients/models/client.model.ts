import { Address, Role } from '../../../shared/models/common.model';

/** Cliente da plataforma. */
export interface Client {
  id: string;
  username: string;
  image: string | null;
  name: string;
  email: string;
  bi: string;
  phone: string;
  birthdate: string;
  role: Role;
  address: Address | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Corpo de `POST /clients/register`. */
export interface CreateClientRequest {
  name: string;
  bi: string;
  email: string;
  phone: string;
  birthdate: string;
  password: string;
  /** ID de uma morada já existente. */
  address_id: number;
}

/**
 * Corpo de `PATCH /clients/:id`. Todos os campos são opcionais.
 * Enviar em `multipart/form-data` quando incluir `image` (fotografia de perfil).
 */
export type UpdateClientRequest = Partial<Omit<CreateClientRequest, 'password'>> & {
  image?: File;
};

/** Corpo de `PUT /clients/:id/password`. */
export interface UpdateClientPasswordRequest {
  current_password: string;
  new_password: string;
}
