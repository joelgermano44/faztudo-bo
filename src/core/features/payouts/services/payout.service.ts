import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/http/api-config';
import {
  MarkPayoutPaidRequest,
  ProfessionalPayout,
  ProfessionalPayoutStatus,
} from '../models/payout.model';

/** Repasses aos profissionais. Requer `Authorization: Bearer <token>`. */
@Injectable({
  providedIn: 'root',
})
export class PayoutService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/payouts`;

  /** `GET /payouts` — lista os payouts, opcionalmente filtrados. */
  findAll(
    professionalId?: number,
    status?: ProfessionalPayoutStatus,
  ): Observable<ProfessionalPayout[]> {
    const params: Record<string, string | number> = {};
    if (professionalId != null) {
      params['professional_id'] = professionalId;
    }
    if (status) {
      params['status'] = status;
    }
    return this.http.get<ProfessionalPayout[]>(this.resource, { params });
  }

  /** `PATCH /payouts/:id/mark-paid` — marca o payout como pago. Reservado a administradores. */
  markPaid(id: number, body: MarkPayoutPaidRequest = {}): Observable<ProfessionalPayout> {
    return this.http.patch<ProfessionalPayout>(`${this.resource}/${id}/mark-paid`, body);
  }
}
