import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiDeleteResult } from '../../../shared/models/common.model';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { Admin, CreateAdminRequest, UpdateAdminRequest } from '../models/admin.model';

/**
 * Gestão de contas de administrador. Nenhuma rota exige token — tal como a
 * própria API documenta ("Nenhuma destas rotas está protegida por guard.").
 *
 * `POST /admin/login` fica em `AuthService` (feature `auth`), por ser sessão
 * e não gestão de contas.
 */
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/admin`;

  /** `POST /admin/register` — regista um novo administrador. */
  register(body: CreateAdminRequest): Observable<Admin> {
    return this.http.post<Admin>(`${this.resource}/register`, body);
  }

  /** `GET /admin` — lista todos os administradores. */
  findAll(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.resource);
  }

  /** `GET /admin/:id` — obtém um administrador pelo ID. */
  findOne(id: number): Observable<Admin> {
    return this.http.get<Admin>(`${this.resource}/${id}`);
  }

  /** `PATCH /admin/:id` — atualiza os campos enviados. */
  update(id: number, body: UpdateAdminRequest): Observable<Admin> {
    return this.http.patch<Admin>(`${this.resource}/${id}`, body);
  }

  /** `DELETE /admin/:id` — elimina a conta de administrador. */
  remove(id: number): Observable<ApiDeleteResult> {
    return this.http.delete<ApiDeleteResult>(`${this.resource}/${id}`);
  }
}
