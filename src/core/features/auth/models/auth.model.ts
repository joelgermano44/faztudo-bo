import { Admin } from '../../admins/models/admin.model';

/** Corpo de `POST /admin/login`. */
export interface AdminLoginRequest {
  email: string;
  password: string;
}

/** Resposta de `POST /admin/login`. */
export interface AdminLoginResponse {
  access_token: string;
  user: Admin;
}
