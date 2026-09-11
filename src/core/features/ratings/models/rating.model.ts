import type { Client } from '../../users-clients/models/client.model';
import type { Professional } from '../../professionals/models/professional.model';

/** Avaliação do cliente ao profissional (T21), única por pedido. */
export interface Rating {
  id: number;
  order_id: number;
  client_id: string;
  client: Client;
  professional_id: number;
  professional: Professional;
  stars: number;
  comment: string | null;
  created_at: string;
}

/** Parâmetros de paginação de `GET /ratings/professionals/:professionalId`. */
export interface RatingListParams {
  take?: number;
  skip?: number;
}

/** Resposta paginada de `GET /ratings/professionals/:professionalId`. */
export interface RatingListResponse {
  total: number;
  items: Rating[];
}
