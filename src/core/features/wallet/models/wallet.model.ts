import type { ProfessionalPayoutStatus } from '../../payouts/models/payout.model';

/** Totais da carteira de um profissional. */
export interface WalletSummary {
  /** Líquido, já com a comissão descontada. */
  to_receive: number;
  /** Líquido, já com a comissão descontada. */
  received: number;
  /** Bruto: o que os clientes pagaram, sem descontar a comissão. */
  total_invoiced: number;
}

/** Uma linha do extrato: um pedido concluído com o breakdown do repasse. */
export interface WalletStatementItem {
  order_id: number;
  payout_id: number;
  status: ProfessionalPayoutStatus;
  service_name: string | null;
  gross_amount: number;
  commission_percent: number | null;
  commission_amount: number;
  net_amount: number;
  created_at: string;
  paid_at: string | null;
}

/** Um registo de mudança de estado do repasse de um pedido. */
export interface PayoutStatusHistoryItem {
  id: number;
  payout_id: number;
  order_id: number;
  previous_status: ProfessionalPayoutStatus | null;
  status: ProfessionalPayoutStatus;
  transfer_reference: string | null;
  changed_by_role: string | null;
  created_at: string;
}
