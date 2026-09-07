import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiDeleteResult } from '../../../shared/models/common.model';
import { API_BASE_URL } from '../../../shared/http/api-config';
import {
  CreatePaymentMethodRequest,
  PaymentMethod,
  UpdatePaymentMethodRequest,
} from '../models/payment-method.model';

/** Catálogo de métodos de pagamento. */
@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/payment-methods`;

  /** `POST /payment-methods` — cria um método de pagamento. */
  create(body: CreatePaymentMethodRequest): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(this.resource, body);
  }

  /** `GET /payment-methods` — lista o catálogo. */
  findAll(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(this.resource);
  }

  /** `GET /payment-methods/:id` — obtém um método de pagamento pelo ID. */
  findOne(id: number): Observable<PaymentMethod> {
    return this.http.get<PaymentMethod>(`${this.resource}/${id}`);
  }

  /** `PUT /payment-methods/:id` — atualiza um método de pagamento. */
  update(id: number, body: UpdatePaymentMethodRequest): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.resource}/${id}`, body);
  }

  /** `DELETE /payment-methods/:id` — remove um método de pagamento. */
  delete(id: number): Observable<ApiDeleteResult> {
    return this.http.delete<ApiDeleteResult>(`${this.resource}/${id}`);
  }
}
