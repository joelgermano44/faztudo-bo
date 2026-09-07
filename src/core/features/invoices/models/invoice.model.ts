/** Tipo de documento interno de faturação (T06 — não é faturação fiscal/AGT). */
export enum InvoiceType {
  PROFORMA = 'PROFORMA',
  RECIBO = 'RECIBO',
}

/** Fatura Proforma ou Recibo de um pedido. */
export interface InvoiceResponse {
  id: number;
  invoice_number: string;
  type: InvoiceType;
  order_id: number;
  amount: number;
  currency: string;
  created_at: string;
  /** Caminho relativo para `InvoiceService.download`. */
  download_url: string;
}
