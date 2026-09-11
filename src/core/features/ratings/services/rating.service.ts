import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { Rating, RatingListParams, RatingListResponse } from '../models/rating.model';

/**
 * Consulta de avaliações (T21).
 *
 * `POST /ratings/orders/:orderId` (criar uma avaliação) não está mapeado: a
 * regra de negócio restringe essa ação ao cliente dono do pedido — o BO não
 * avalia em nome de ninguém, só consulta.
 */
@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/ratings`;

  /**
   * `GET /ratings/orders/:orderId` — avaliação de um pedido, ou `null` se
   * ainda não existir. Requer `Authorization: Bearer <token>`.
   */
  getForOrder(orderId: number): Observable<Rating | null> {
    return this.http.get<Rating | null>(`${this.resource}/orders/${orderId}`);
  }

  /** `GET /ratings/professionals/:professionalId` — avaliações de um profissional, paginadas. Rota pública. */
  findForProfessional(
    professionalId: number,
    params: RatingListParams = {},
  ): Observable<RatingListResponse> {
    return this.http.get<RatingListResponse>(`${this.resource}/professionals/${professionalId}`, {
      params: { ...params } as Record<string, number>,
    });
  }
}
