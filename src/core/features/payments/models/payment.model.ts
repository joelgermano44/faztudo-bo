import type { PaymentMethod } from '../../payment-methods/models/payment-method.model';

/** Estado do pagamento. */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

/** Pagamento de um pedido. */
export interface Payment {
  id: number;
  amount: number;
  client_id: string | null;
  payment_method: PaymentMethod | null;
  payment_method_id: number | null;
  reference?: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  processing_started_at?: string;
  failure_reason?: string;
}

/** Corpo de `POST /payments` — criação administrativa/avulsa. */
export interface CreatePaymentRequest {
  amount: number;
  reference?: string | null;
  client_id: string;
}

/** Corpo de `PATCH /payments/:id`. */
export type UpdatePaymentRequest = Partial<CreatePaymentRequest>;
