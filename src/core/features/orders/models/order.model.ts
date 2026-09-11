import { Address, Media, Role } from '../../../shared/models/common.model';
import type { Admin } from '../../admins/models/admin.model';
import type { Client } from '../../users-clients/models/client.model';
import type { Payment } from '../../payments/models/payment.model';
import type { Professional } from '../../professionals/models/professional.model';
import type { Service } from '../../services/models/service.model';

/** Estado do pedido. */
export enum OrderStatus {
  REQUESTED = 'REQUESTED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
}

/** Onde o serviço é prestado. */
export enum OrderLocationType {
  CLIENT_ADDRESS = 'CLIENT_ADDRESS',
  PROFESSIONAL_ADDRESS = 'PROFESSIONAL_ADDRESS',
}

/** Pedido de serviço. */
export interface Order {
  id: number;
  client_id: string;
  service_id: number;
  professional_id: number;
  address_id: number;
  location_type: OrderLocationType;
  assigned_admin_id: number | null;
  description: string | null;
  first_payment_id: number | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  service: Service;
  address: Address;
  client: Client;
  professional: Professional;
  assigned_admin: Admin | null;
  first_payment?: Payment;
  images?: Media[];
}

/** Corpo de `POST /orders` — em `multipart/form-data` por causa das imagens. */
export interface CreateOrderRequest {
  service_id: number;
  professional_id: number;
  location_type: OrderLocationType;
  /** Obrigatório em `CLIENT_ADDRESS`, salvo se enviar `lat`+`lng`. Ignorado em `PROFESSIONAL_ADDRESS`. */
  address_id?: number;
  lat?: string;
  lng?: string;
  description?: string;
  /** Até 40 imagens. */
  images?: File[];
}

/**
 * Corpo de `PATCH /orders/:id` e das rotas de transição de estado
 * (`accept`, `reject`, `cancel`). `reason` é obrigatório em `reject`.
 */
export type UpdateOrderRequest = Partial<CreateOrderRequest> & {
  reason?: string;
};

/** Um registo de mudança de estado do pedido. */
export interface OrderStatusHistory {
  id: number;
  order_id: number;
  previous_status: OrderStatus | null;
  status: OrderStatus;
  reason: string | null;
  changed_by_role: Role | null;
  created_at: string;
}

/** Corpo de `PATCH /orders/:id/assign-technician`. */
export interface AssignTechnicianRequest {
  /** `null` para desatribuir. */
  admin_id: number | null;
}

/** Evento da linha temporal do pedido (`GET /orders/:id/timeline`). */
export interface OrderTimelineEvent {
  type: 'status_change' | 'payout';
  occurred_at: string;
  [key: string]: unknown;
}

/** Resposta de `GET /orders/:id/timeline`. */
export interface OrderTimeline {
  order: Order;
  events: OrderTimelineEvent[];
}

/** De que lado do pedido veio a mensagem (só cliente/profissional — o admin apenas lê). */
export type OrderChatSenderType = 'client' | 'professional';

/** Mensagem de uma conversa de pedido. */
export interface OrderChatMessage {
  id: number;
  conversation_id: number;
  sender_type: OrderChatSenderType;
  sender_id: string | null;
  type: 'text' | 'image';
  content: string | null;
  created_at: string;
  images?: Media[];
}

/** Conversa entre cliente e profissional associada a um pedido. */
export interface OrderConversation {
  id: number;
  order_id: number;
  client_id: string;
  professional_id: number;
  last_message_at: string | null;
  last_message_preview: string | null;
  client_unread_count: number;
  professional_unread_count: number;
  client_last_read_at: string | null;
  professional_last_read_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Página de mensagens embutida em `GET /orders/:id/chat`. */
export interface OrderChatMessagesPage {
  data: OrderChatMessage[];
  next_cursor: number | null;
  has_more: boolean;
}

/** Resposta de `GET /orders/:id/chat` — vista do BO sobre a conversa do pedido, só leitura. */
export interface OrderChatView {
  conversation: OrderConversation | null;
  messages: OrderChatMessagesPage;
}
