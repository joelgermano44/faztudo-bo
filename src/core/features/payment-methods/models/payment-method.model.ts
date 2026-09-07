/** Método de pagamento do catálogo (Multicaixa Express, numerário, etc.). */
export interface PaymentMethod {
  id: number;
  method_name: string;
  createdAt: string;
  updatedAt: string | null;
  deleted_at: string | null;
}

/** Corpo de `POST /payment-methods`. */
export interface CreatePaymentMethodRequest {
  method_name: string;
}

/** Corpo de `PUT /payment-methods/:id`. */
export type UpdatePaymentMethodRequest = Partial<CreatePaymentMethodRequest>;
