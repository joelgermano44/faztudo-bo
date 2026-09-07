/** Um ponto do fluxo mensal de pedidos concluídos vs. cancelados/rejeitados. */
export interface OrderFlowPoint {
  /** Mês de referência, no formato `YYYY-MM`. */
  month: string;
  /** Número de pedidos concluídos (`DONE`) neste mês. */
  done: number;
  /** Número de pedidos cancelados (`CANCELED`) ou rejeitados (`REJECTED`) neste mês. */
  canceledOrRejected: number;
}

/** Resposta de `GET /admin/dashboard`. */
export interface AdminDashboardResponse {
  /** Faturamento total: soma de pagamentos com status `SUCCESS`. */
  totalRevenue: number;
  totalOrders: number;
  totalServices: number;
  totalClients: number;
  totalProfessionals: number;
  ordersFlow: OrderFlowPoint[];
}
