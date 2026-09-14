/** Estado de uma denúncia. */
export enum ReportStatus {
  SUBMITTED = 'SUBMITTED',
  IN_ANALYSIS = 'IN_ANALYSIS',
  RESOLVED = 'RESOLVED',
}

/**
 * Denúncia de um cliente contra o profissional de um pedido em curso
 * (`REQUESTED`, `ACCEPTED` ou `IN_PROGRESS`).
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
}

/** Corpo de `PATCH /admin/reports/:id/resolve` — obrigatório passar a `RESOLVED`. */
export interface ResolveReportRequest {
  resolution_note: string;
}
