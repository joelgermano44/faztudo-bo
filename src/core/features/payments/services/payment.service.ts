import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiDeleteResult } from '../../../shared/models/common.model';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { CreatePaymentRequest, Payment, UpdatePaymentRequest } from '../models/payment.model';

/**
 * Gestão de pagamentos. `pay` e `confirm` exigem `Authorization: Bearer <token>`
 * de um cliente — o BO usa-as apenas em casos de correção manual, tal como a
 * própria API documenta para `confirm`.
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/payments`;

  /** `POST /payments` — cria um pagamento avulso, sempre em `PENDING`. */
  create(body: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(this.resource, body);
  }

  /** `GET /payments` — lista todos os pagamentos. */
  findAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.resource);
  }

  /** `GET /payments/:id` — obtém um pagamento pelo ID. */
  findOne(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.resource}/${id}`);
  }

  /** `PATCH /payments/:id` — atualização administrativa dos campos enviados. */
  update(id: number, body: UpdatePaymentRequest): Observable<Payment> {
    return this.http.patch<Payment>(`${this.resource}/${id}`, body);
  }

  /** `DELETE /payments/:id` — elimina o pagamento. */
  remove(id: number): Observable<ApiDeleteResult> {
    return this.http.delete<ApiDeleteResult>(`${this.resource}/${id}`);
  }

  /** `POST /payments/:id/pay` — lança a cobrança no gateway. Requer sessão de cliente. */
  pay(id: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.resource}/${id}/pay`, {});
  }

  /** `POST /payments/:id/confirm` — confirma manualmente um pagamento, sem passar pelo gateway. */
  confirm(id: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.resource}/${id}/confirm`, {});
  }
}
