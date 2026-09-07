import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiSuccessMessage, CursorQueryParams } from '../../../shared/models/common.model';
import { API_BASE_URL } from '../../../shared/http/api-config';
import {
  MarkSupportReadRequest,
  MarkSupportReadResponse,
  SendSupportMessageRequest,
  SupportInboxItem,
  SupportListQueryParams,
  SupportMessage,
  SupportPage,
} from '../models/support-chat.model';

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
 * Caixa de entrada de suporte do backoffice (T28). Reservado a
 * administradores (`Role.ADMIN`); requer `Authorization: Bearer <token>`.
 */
@Injectable({
  providedIn: 'root',
})
export class SupportChatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/admin/support-chat`;

  /** `GET /admin/support-chat/conversations` — caixa de entrada de suporte. */
  listConversations(query: SupportListQueryParams = {}): Observable<SupportPage<SupportInboxItem>> {
    return this.http.get<SupportPage<SupportInboxItem>>(`${this.resource}/conversations`, {
      params: { ...query } as Record<string, string | number>,
    });
  }

  /** `GET /admin/support-chat/unread-count` — total de mensagens não lidas pelo BO. */
  getUnreadTotal(): Observable<{ unread_total: number }> {
    return this.http.get<{ unread_total: number }>(`${this.resource}/unread-count`);
  }

  /** `GET /admin/support-chat/conversations/:id` — obtém uma conversa de suporte. */
  getConversation(id: number): Observable<SupportInboxItem> {
    return this.http.get<SupportInboxItem>(`${this.resource}/conversations/${id}`);
  }

  /** `GET /admin/support-chat/conversations/:id/messages` — histórico de mensagens. */
  listMessages(id: number, query: CursorQueryParams = {}): Observable<SupportPage<SupportMessage>> {
    return this.http.get<SupportPage<SupportMessage>>(
      `${this.resource}/conversations/${id}/messages`,
      { params: { ...query } as Record<string, number> },
    );
  }

  /** `POST /admin/support-chat/conversations/:id/messages` — responde numa conversa. */
  sendMessage(id: number, body: SendSupportMessageRequest): Observable<SupportMessage> {
    return this.http.post<SupportMessage>(
      `${this.resource}/conversations/${id}/messages`,
      toFormData(body),
    );
  }

  /** `PATCH /admin/support-chat/conversations/:id/read` — marca a conversa como lida. */
  markAsRead(id: number, body: MarkSupportReadRequest = {}): Observable<MarkSupportReadResponse> {
    return this.http.patch<MarkSupportReadResponse>(
      `${this.resource}/conversations/${id}/read`,
      body,
    );
  }

  /** `DELETE /admin/support-chat/messages/:id` — apaga uma resposta própria. */
  deleteMessage(id: number): Observable<ApiSuccessMessage> {
    return this.http.delete<ApiSuccessMessage>(`${this.resource}/messages/${id}`);
  }
}
