import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { InvoiceResponse } from '../models/invoice.model';

/**
 * Faturas internas de registo (T06). Acesso: cliente/profissional do pedido,
 * ou administrador — o BO usa sempre a via de administrador, que vê qualquer
 * pedido. Requer `Authorization: Bearer <token>`.
 */
@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/invoices`;

  /** `GET /invoices/orders/:orderId` — lista as faturas emitidas para um pedido. */
  findByOrder(orderId: number): Observable<InvoiceResponse[]> {
    return this.http.get<InvoiceResponse[]>(`${this.resource}/orders/${orderId}`);
  }

  /** `GET /invoices/:id/download` — descarrega o PDF de uma fatura. */
  download(id: number): Observable<Blob> {
    return this.http.get(`${this.resource}/${id}/download`, { responseType: 'blob' });
  }
}
