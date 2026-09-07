import { Role } from '../../../shared/models/common.model';

/** Administrador da plataforma. */
export interface Admin {
  id: number;
  username: string;
  image: string | null;
  name: string;
  email: string;
  bi: string;
  phone: string;
  birthdate: string;
  role: Role;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Corpo de `POST /admin/register`. */
export interface CreateAdminRequest {
  image?: string | null;
  name: string;
  bi: string;
  email: string;
  phone: string;
  birthdate: string;
  password: string;
}

/** Corpo de `PATCH /admin/:id`. Todos os campos são opcionais. */
export type UpdateAdminRequest = Partial<CreateAdminRequest>;
