import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { ProfessionalPayoutStatus } from '../../payouts/models/payout.model';
import { PayoutStatusHistoryItem, WalletStatementItem, WalletSummary } from '../models/wallet.model';

/**
 * Vista administrativa da carteira digital dos profissionais (T08).
 *
 * As rotas `me/summary` e `me/statement` do controller original pertencem à
 * sessão do próprio profissional e não são mapeadas aqui: o backoffice usa
 * sempre o equivalente `professionals/:professional_id/...`, que devolve
 * exatamente o mesmo formato para qualquer profissional.
 */
@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly resource = `${this.baseUrl}/wallet`;

  /** `GET /wallet/professionals/:professional_id/summary` — totais da carteira. */
  getSummary(professionalId: number): Observable<WalletSummary> {
    return this.http.get<WalletSummary>(
      `${this.resource}/professionals/${professionalId}/summary`,
    );
  }

  /** `GET /wallet/professionals/:professional_id/statement` — extrato por pedido. */
  getStatement(
    professionalId: number,
    status?: ProfessionalPayoutStatus,
  ): Observable<WalletStatementItem[]> {
    return this.http.get<WalletStatementItem[]>(
      `${this.resource}/professionals/${professionalId}/statement`,
      { params: status ? { status } : {} },
    );
  }

  /** `GET /wallet/orders/:order_id/history` — histórico do repasse de um pedido. */
  getOrderHistory(orderId: number): Observable<PayoutStatusHistoryItem[]> {
    return this.http.get<PayoutStatusHistoryItem[]>(`${this.resource}/orders/${orderId}/history`);
  }
}
