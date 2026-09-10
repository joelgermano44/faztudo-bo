import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

/**
 * Endereço base da API FazTudo (sem barra final).
 *
 * A API não define nenhum prefixo global (`app.setGlobalPrefix`), portanto
 * todas as rotas documentadas no backend (`/clients`, `/orders`, ...) ficam
 * diretamente a seguir a este endereço.
 *
 * O valor vem de `src/environments/environment.ts` (dev) e é substituído por
 * `src/environments/environment.prod.ts` (prod) no build de produção via
 * `fileReplacements` (angular.json).
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});
