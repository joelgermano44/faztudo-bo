import type { Professional } from '../../professionals/models/professional.model';

/** Estado do payout. */
export enum ProfessionalPayoutStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

/** Valor devido/pago a um profissional pela conclusão de um pedido. */
export interface ProfessionalPayout {
  id: number;
  order_id: number;
  professional_id: number;
  professional: Professional;
  amount: number;
  commission_percent?: number | null;
  commission_amount?: number | null;
  status: ProfessionalPayoutStatus;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/** Corpo de `PATCH /payouts/:id/mark-paid`. */
export interface MarkPayoutPaidRequest {
  transfer_reference?: string;
}
