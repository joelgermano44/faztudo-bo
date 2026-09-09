import { InjectionToken } from '@angular/core';

/**
 * Endereço base da API FazTudo (sem barra final).
 *
 * A API não define nenhum prefixo global (`app.setGlobalPrefix`), portanto
 * todas as rotas documentadas no backend (`/clients`, `/orders`, ...) ficam
 * diretamente a seguir a este endereço.
 *
 * Fornecer um valor concreto na app root, por exemplo:
 * `{ provide: API_BASE_URL, useValue: 'https://apimesafa.evofenix.it.ao/' || 'http://192.168.1.56' }`
 */
export const API_BASE_URL = new InjectionToken<string>('http://192.168.1.56:3000', {
  providedIn: 'root',
  factory: () => '',
});
