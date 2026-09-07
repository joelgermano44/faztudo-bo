import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/http/api-config';
import {
  ProfessionalApplication,
  ProfessionalApplicationStatus,
  ProfessionalApplicationStatusHistory,
  RejectApplicationRequest,
  ReviewNoteRequest,
} from '../models/professional-application.model';

/**
 * Fila de candidaturas a profissional (T18) — reservado a administradores
 * (`Role.ADMIN`); requer `Authorization: Bearer <token>`.
 */
@Injectable({
  providedIn: 'root',
})
export class ProfessionalApplicationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/professional-applications`;

  /** `GET /professional-applications` — lista as candidaturas, opcionalmente por estado. */
  findAll(status?: ProfessionalApplicationStatus): Observable<ProfessionalApplication[]> {
    return this.http.get<ProfessionalApplication[]>(this.resource, {
      params: status ? { status } : {},
    });
  }

  /** `GET /professional-applications/:professionalId` — obtém uma candidatura. */
  findOne(professionalId: number): Observable<ProfessionalApplication> {
    return this.http.get<ProfessionalApplication>(`${this.resource}/${professionalId}`);
  }

  /** `GET /professional-applications/:professionalId/history` — histórico de estados. */
  getHistory(professionalId: number): Observable<ProfessionalApplicationStatusHistory[]> {
    return this.http.get<ProfessionalApplicationStatusHistory[]>(
      `${this.resource}/${professionalId}/history`,
    );
  }

  /** `PATCH /professional-applications/:professionalId/review` — passa a `EM_ANALISE`. */
  review(professionalId: number, body?: ReviewNoteRequest): Observable<ProfessionalApplication> {
    return this.http.patch<ProfessionalApplication>(
      `${this.resource}/${professionalId}/review`,
      body ?? {},
    );
  }

  /** `PATCH /professional-applications/:professionalId/approve` — passa a `APROVADA`. */
  approve(professionalId: number, body?: ReviewNoteRequest): Observable<ProfessionalApplication> {
    return this.http.patch<ProfessionalApplication>(
      `${this.resource}/${professionalId}/approve`,
      body ?? {},
    );
  }

  /** `PATCH /professional-applications/:professionalId/reject` — passa a `REJEITADA`. */
  reject(
    professionalId: number,
    body: RejectApplicationRequest,
  ): Observable<ProfessionalApplication> {
    return this.http.patch<ProfessionalApplication>(
      `${this.resource}/${professionalId}/reject`,
      body,
    );
  }
}
