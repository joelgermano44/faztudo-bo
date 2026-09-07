import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { AdminDashboardResponse } from '../models/dashboard.model';

/**
 * Indicadores agregados para a página inicial do backoffice.
 * Reservado a administradores (`Role.ADMIN`); requer `Authorization: Bearer <token>`.
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** `GET /admin/dashboard` — indicadores do dashboard admin. */
  getDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.baseUrl}/admin/dashboard`);
  }
}
