import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { OffsetPage, OffsetQueryParams } from '../../../shared/models/common.model';
import { Report, ResolveReportRequest } from '../models/report.model';

/**
 * Denúncias de clientes contra profissionais — reservado a administradores
 * (`Role.ADMIN`); requer `Authorization: Bearer <token>`. A criação
 * (`POST /clients/reports`) é feita pelo cliente na app pública, não no BO.
 */
@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/admin/reports`;

  /** `GET /admin/reports/professional/:professionalId` — denúncias contra um profissional. */
  findByProfessional(
    professionalId: number,
    query: OffsetQueryParams = {},
  ): Observable<OffsetPage<Report>> {
    return this.http.get<OffsetPage<Report>>(`${this.resource}/professional/${professionalId}`, {
      params: { ...query } as Record<string, number>,
    });
  }

  /** `GET /admin/reports/clients/:clientId` — denúncias feitas por um cliente. */
  findByClient(clientId: string, query: OffsetQueryParams = {}): Observable<OffsetPage<Report>> {
    return this.http.get<OffsetPage<Report>>(`${this.resource}/clients/${clientId}`, {
      params: { ...query } as Record<string, number>,
    });
  }

  /** `GET /admin/reports/:id` — obtém uma denúncia. */
  findOne(id: number): Observable<Report> {
    return this.http.get<Report>(`${this.resource}/${id}`);
  }

  /** `PATCH /admin/reports/:id/review` — passa de `SUBMITTED` a `IN_ANALYSIS`. */
  review(id: number): Observable<Report> {
    return this.http.patch<Report>(`${this.resource}/${id}/review`, {});
  }

  /** `PATCH /admin/reports/:id/resolve` — passa a `RESOLVED`; `resolution_note` obrigatório. */
  resolve(id: number, body: ResolveReportRequest): Observable<Report> {
    return this.http.patch<Report>(`${this.resource}/${id}/resolve`, body);
  }
}
