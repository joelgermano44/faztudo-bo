import { CursorQueryParams, Media } from '../../../shared/models/common.model';

/** De que lado da plataforma é a outra ponta do chat de suporte. */
export enum SupportPartyType {
  CLIENT = 'client',
  PROFESSIONAL = 'professional',
}

/** De que lado veio a mensagem de suporte. */
export enum SupportSenderType {
  CLIENT = 'client',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

/** Natureza da mensagem. */
export enum SupportMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  SYSTEM = 'system',
}

/** Mensagem de uma conversa de suporte. */
export interface SupportMessage {
  id: number;
  conversation_id: number;
  sender_type: SupportSenderType;
  sender_id: string | null;
  type: SupportMessageType;
  content: string | null;
  client_msg_id: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  images?: Media[];
}

/** O cliente ou profissional do outro lado de uma conversa, na perspetiva do BO. */
export interface SupportPartyView {
  role: SupportPartyType;
  id: string;
  name: string;
  image: string | null;
}

/** Uma linha da caixa de entrada de suporte do BO. */
export interface SupportInboxItem {
  id: number;
  party: SupportPartyView;
  unread_count: number;
  last_message_at: string | null;
  last_message_preview: string | null;
  admin_id: number | null;
  created_at: string;
  last_message?: SupportMessage | null;
}

/** Parâmetros de `GET /admin/support-chat/conversations`. */
export interface SupportListQueryParams extends CursorQueryParams {
  search?: string;
  unread_only?: 'true' | 'false';
}

/** Corpo de `POST /admin/support-chat/conversations/:id/messages`. */
export interface SendSupportMessageRequest {
  content?: string;
  type?: SupportMessageType.TEXT | SupportMessageType.IMAGE;
  client_msg_id?: string;
  /** Até 10 imagens. */
  images?: File[];
}

/** Corpo de `PATCH /admin/support-chat/conversations/:id/read`. */
export interface MarkSupportReadRequest {
  up_to_message_id?: number;
}

/** Resposta de `PATCH /admin/support-chat/conversations/:id/read`. */
export interface MarkSupportReadResponse {
  conversation_id: number;
  up_to_message_id: number | null;
  unread_count: number;
  read_at: string;
}

/** Página de conversas (`GET /admin/support-chat/conversations`) ou de mensagens. */
export interface SupportPage<T> {
  data: T[];
  next_cursor: number | null;
  has_more: boolean;
}
