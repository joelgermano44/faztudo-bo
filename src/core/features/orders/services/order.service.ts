import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiDeleteResult, CursorQueryParams } from '../../../shared/models/common.model';
import { API_BASE_URL } from '../../../shared/http/api-config';
import type { Payment } from '../../payments/models/payment.model';
import {
  AssignTechnicianRequest,
  CreateOrderRequest,
  Order,
  OrderChatView,
  OrderStatusHistory,
  OrderTimeline,
  UpdateOrderRequest,
} from '../models/order.model';

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

/** Ciclo de vida completo dos pedidos. Todas as rotas exigem autenticação (`Authorization: Bearer <token>`). */
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/orders`;

  /** `POST /orders` — cria um pedido (e o respetivo pagamento). Multipart por causa das imagens. */
  create(body: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.resource, toFormData(body));
  }

  /** `GET /orders` — lista todos os pedidos. */
  findAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.resource);
  }

  /** `GET /orders/:id` — obtém um pedido pelo ID. */
  findOne(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.resource}/${id}`);
  }

  /** `GET /orders/:id/payments` — pagamento(s) do pedido (no máximo um). */
  getOrderPayments(id: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.resource}/${id}/payments`);
  }

  /** `GET /orders/:id/status-history` — histórico de estados do pedido. */
  getStatusHistory(id: number): Observable<OrderStatusHistory[]> {
    return this.http.get<OrderStatusHistory[]>(`${this.resource}/${id}/status-history`);
  }

  /** `GET /orders/:id/timeline` — linha temporal completa. Reservado a administradores. */
  getTimeline(id: number): Observable<OrderTimeline> {
    return this.http.get<OrderTimeline>(`${this.resource}/${id}/timeline`);
  }

  /** `GET /orders/:id/chat` — conversa do pedido, só leitura. Reservado a administradores. */
  getChat(id: number, query?: CursorQueryParams): Observable<OrderChatView> {
    return this.http.get<OrderChatView>(`${this.resource}/${id}/chat`, {
      params: { ...query } as Record<string, string | number>,
    });
  }

  /** `PATCH /orders/:id/assign-technician` — atribui/desatribui o técnico de acompanhamento. Reservado a administradores. */
  assignTechnician(id: number, body: AssignTechnicianRequest): Observable<Order> {
    return this.http.patch<Order>(`${this.resource}/${id}/assign-technician`, body);
  }

  /** `PATCH /orders/:id` — atualização genérica dos campos enviados. */
  update(id: number, body: UpdateOrderRequest): Observable<Order> {
    return this.http.patch<Order>(`${this.resource}/${id}`, body);
  }

  /** `DELETE /orders/:id` — elimina o pedido. */
  remove(id: number): Observable<ApiDeleteResult> {
    return this.http.delete<ApiDeleteResult>(`${this.resource}/${id}`);
  }

  /** `GET /orders/by-professional/:profissional_id` — pedidos de um profissional. */
  findByProfessional(professionalId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.resource}/by-professional/${professionalId}`);
  }

  /** `GET /orders/by-payment/:payment_id` — pedido a que um pagamento pertence. */
  findByPayment(paymentId: number): Observable<Order> {
    return this.http.get<Order>(`${this.resource}/by-payment/${paymentId}`);
  }

  /** `GET /orders/by-client/:client_id` — pedidos de um cliente. */
  findByClient(clientId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.resource}/by-client/${clientId}`);
  }

  /** `PATCH /orders/:id/reject` — rejeita o pedido. `reason` é obrigatório. */
  reject(id: number, body: UpdateOrderRequest & { reason: string }): Observable<Order> {
    return this.http.patch<Order>(`${this.resource}/${id}/reject`, body);
  }

  /** `PATCH /orders/:id/accept` — aceita o pedido (desbloqueia o pagamento). */
  accept(id: number, body: UpdateOrderRequest = {}): Observable<Order> {
    return this.http.patch<Order>(`${this.resource}/${id}/accept`, body);
  }

  /** `PATCH /orders/:id/cancel` — cancela o pedido. */
  cancel(id: number, body: UpdateOrderRequest = {}): Observable<Order> {
    return this.http.patch<Order>(`${this.resource}/${id}/cancel`, body);
  }

  /** `PATCH /orders/:id/confirm-completion` — o cliente confirma a conclusão e liberta o payout. */
  confirmCompletion(id: number): Observable<Order> {
    return this.http.patch<Order>(`${this.resource}/${id}/confirm-completion`, {});
  }

  /** `PATCH /orders/:id/complete` — o BO marca a conclusão e liberta o payout. Reservado a administradores. */
  completeAsAdmin(id: number): Observable<Order> {
    return this.http.patch<Order>(`${this.resource}/${id}/complete`, {});
  }
}
