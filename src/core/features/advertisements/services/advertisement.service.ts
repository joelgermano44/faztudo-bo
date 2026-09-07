import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiSuccessMessage } from '../../../shared/models/common.model';
import { API_BASE_URL } from '../../../shared/http/api-config';
import {
  Advertisement,
  CreateAdvertisementRequest,
  UpdateAdvertisementRequest,
} from '../models/advertisement.model';

function toFormData<T extends object>(body: T): FormData {
  const formData = new FormData();
  Object.entries(body as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item as string | Blob));
      return;
    }
    formData.append(key, value as string | Blob);
  });
  return formData;
}

/**
 * Gestão de banners publicitários. Reservado a administradores
 * (`Role.ADMIN`); requer `Authorization: Bearer <token>`.
 *
 * A listagem pública (`GET /advertisements`) e o registo de clique
 * (`POST /advertisements/:id/click`) não estão mapeados aqui: são consumo do
 * cliente final, sem ação de gestão associada.
 */
@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/admin/advertisements`;

  /** `POST /admin/advertisements` — cria um banner. */
  create(body: CreateAdvertisementRequest): Observable<Advertisement> {
    return this.http.post<Advertisement>(this.resource, toFormData(body));
  }

  /** `GET /admin/advertisements` — lista todos os banners, ativos e inativos. */
  findAll(): Observable<Advertisement[]> {
    return this.http.get<Advertisement[]>(this.resource);
  }

  /** `GET /admin/advertisements/:id` — obtém um banner pelo ID. */
  findOne(id: number): Observable<Advertisement> {
    return this.http.get<Advertisement>(`${this.resource}/${id}`);
  }

  /** `PATCH /admin/advertisements/:id` — atualiza um banner. Imagens novas são acrescentadas. */
  update(id: number, body: UpdateAdvertisementRequest): Observable<Advertisement> {
    return this.http.patch<Advertisement>(`${this.resource}/${id}`, toFormData(body));
  }

  /** `DELETE /admin/advertisements/:id/images/:mediaId` — remove uma imagem do banner. */
  removeImage(id: number, mediaId: number): Observable<Advertisement> {
    return this.http.delete<Advertisement>(`${this.resource}/${id}/images/${mediaId}`);
  }

  /** `DELETE /admin/advertisements/:id` — elimina o banner. */
  remove(id: number): Observable<ApiSuccessMessage> {
    return this.http.delete<ApiSuccessMessage>(`${this.resource}/${id}`);
  }
}
