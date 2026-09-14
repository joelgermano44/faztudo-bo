import type { Client } from '../../users-clients/models/client.model';
import type { Order } from '../../orders/models/order.model';
import type { Professional } from '../../professionals/models/professional.model';

/** Estado de uma denúncia. */
export enum ReportStatus {
  SUBMITTED = 'SUBMITTED',
  IN_ANALYSIS = 'IN_ANALYSIS',
  RESOLVED = 'RESOLVED',
}

/**
 * Denúncia de um cliente contra o profissional de um pedido em curso
 * (`REQUESTED`, `ACCEPTED` ou `IN_PROGRESS`).
 *
 * `GET /admin/reports/:id` (e as listagens por profissional/cliente) já
 * devolve `client`, `professional` e `order` (este com `order.service`)
 * populados — por isso vêm opcionais aqui, não em chamadas hipotéticas à parte.
 */
export interface Report {
  id: number;
  order_id: number;
  client_id: string;
  professional_id: number;
  reason: string;
  description: string;
  status: ReportStatus;
  resolution_note: string | null;
  reviewed_by_admin_id: number | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  professional?: Professional;
  order?: Order;
}

/** Corpo de `PATCH /admin/reports/:id/resolve` — obrigatório passar a `RESOLVED`. */
export interface ResolveReportRequest {
  resolution_note: string;
}
