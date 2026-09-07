import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiSuccessMessage, AddressRequest } from '../../../shared/models/common.model';
import { API_BASE_URL } from '../../../shared/http/api-config';
import {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  UpdateClientPasswordRequest,
} from '../models/client.model';

/** Gestão de clientes pelo backoffice: consulta, edição, morada e password. */
@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/clients`;

  /** `POST /clients/register` — regista um novo cliente. */
  create(body: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(`${this.resource}/register`, body);
  }

  /** `GET /clients` — lista todos os clientes. */
  findAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.resource);
  }

  /** `GET /clients/:id` — obtém um cliente pelo ID (UUID). */
  findOne(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.resource}/${id}`);
  }

  /**
   * `PATCH /clients/:id` — atualiza o perfil do cliente.
   * Envia `multipart/form-data` quando `body.image` está presente.
   */
  update(id: string, body: UpdateClientRequest): Observable<Client> {
    if (body.image) {
      const formData = new FormData();
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string | Blob);
        }
      });
      return this.http.patch<Client>(`${this.resource}/${id}`, formData);
    }
    return this.http.patch<Client>(`${this.resource}/${id}`, body);
  }

  /** `PUT /clients/:id/password` — altera a palavra-passe. Devolve o cliente atualizado. */
  updatePassword(id: string, body: UpdateClientPasswordRequest): Observable<Client> {
    return this.http.put<Client>(`${this.resource}/${id}/password`, body);
  }

  /** `PATCH /clients/:id/updateAddress` — define ou atualiza a morada do cliente. */
  updateAddress(id: string, body: AddressRequest): Observable<Client> {
    return this.http.patch<Client>(`${this.resource}/${id}/updateAddress`, body);
  }

  /** `DELETE /clients/:id` — elimina a conta de cliente. */
  remove(id: string): Observable<ApiSuccessMessage> {
    return this.http.delete<ApiSuccessMessage>(`${this.resource}/${id}`);
  }
}
