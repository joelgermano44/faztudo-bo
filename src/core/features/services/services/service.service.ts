import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiSuccessMessage } from '../../../shared/models/common.model';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { CreateServiceRequest, Service, UpdateServiceRequest } from '../models/service.model';

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
 * Catálogo de serviços — junta as três origens que a API expõe para o mesmo
 * domínio (`/admin/services`, `/services`, `/professionals/:profId/service`),
 * porque pertencem à mesma feature de negócio.
 */
@Injectable({
  providedIn: 'root',
})
export class ServiceCatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  // ---------------------------------------------------------------------
  // Administração do catálogo (`/admin/services`)
  // ---------------------------------------------------------------------

  /** `POST /admin/services` — cria um serviço no catálogo administrativo. */
  createAsAdmin(body: CreateServiceRequest): Observable<Service> {
    return this.http.post<Service>(`${this.baseUrl}/admin/services`, toFormData(body));
  }

  /** `GET /admin/services` — lista o catálogo completo, incluindo sem ofertas. */
  findAllAsAdmin(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/admin/services`);
  }

  /** `PATCH /admin/services/:id` — atualiza um serviço do catálogo. */
  updateAsAdmin(id: number, body: UpdateServiceRequest): Observable<Service> {
    return this.http.patch<Service>(`${this.baseUrl}/admin/services/${id}`, toFormData(body));
  }

  /** `DELETE /admin/services/:id` — elimina um serviço do catálogo. */
  removeAsAdmin(id: number): Observable<ApiSuccessMessage> {
    return this.http.delete<ApiSuccessMessage>(`${this.baseUrl}/admin/services/${id}`);
  }

  // ---------------------------------------------------------------------
  // Vinculados a um profissional (`/professionals/:profId/service`)
  // ---------------------------------------------------------------------

  /** `POST /professionals/:profId/service` — cria um serviço privado do profissional. */
  createForProfessional(profId: number, body: CreateServiceRequest): Observable<Service> {
    return this.http.post<Service>(
      `${this.baseUrl}/professionals/${profId}/service`,
      toFormData(body),
    );
  }

  /** `GET /professionals/:profId/service` — lista os serviços do profissional. */
  findAllForProfessional(profId: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/professionals/${profId}/service`);
  }

  /** `GET /professionals/:profId/service/:id` — obtém um serviço específico do profissional. */
  findOneForProfessional(profId: number, id: number): Observable<Service> {
    return this.http.get<Service>(`${this.baseUrl}/professionals/${profId}/service/${id}`);
  }

  /** `PATCH /professionals/:profId/service/:id` — atualiza um serviço do profissional. */
  updateForProfessional(
    profId: number,
    id: number,
    body: UpdateServiceRequest,
  ): Observable<Service> {
    return this.http.patch<Service>(
      `${this.baseUrl}/professionals/${profId}/service/${id}`,
      toFormData(body),
    );
  }

  /** `DELETE /professionals/:profId/service/:id` — remove o serviço do profissional. */
  removeForProfessional(profId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/professionals/${profId}/service/${id}`);
  }

  // ---------------------------------------------------------------------
  // Listagem global (`/services`)
  // ---------------------------------------------------------------------

  /** `GET /services` — lista todos os serviços. */
  findAll(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services`);
  }

  /** `GET /services/nearby` — serviços próximos de um utilizador. */
  findNearby(userUuid: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services/nearby`, {
      params: { user_uuid: userUuid },
    });
  }

  /** `GET /services/recommendeds` — serviços recomendados a um utilizador. */
  findRecommended(userUuid: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.baseUrl}/services/recommendeds`, {
      params: { user_uuid: userUuid },
    });
  }
}
