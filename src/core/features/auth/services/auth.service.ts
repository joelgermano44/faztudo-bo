import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../../../shared/http/api-config';
import { AdminLoginRequest, AdminLoginResponse } from '../models/auth.model';

const TOKEN_KEY = 'faztudo_bo_access_token';

/**
 * Autenticação do backoffice.
 *
 * `POST /admin/register` não vive aqui de propósito: criar uma conta de
 * administrador é gestão de contas, não sessão — está em `AdminService`
 * (feature `admins`).
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  /** `localStorage` só existe no browser — no SSR (Node) esta flag fica `false`. */
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Estado de sessão, inicializado a partir do token persistido. */
  private readonly authenticated = signal(this.isBrowser && !!localStorage.getItem(TOKEN_KEY));
  readonly isAuthenticated = this.authenticated.asReadonly();

  /** `POST /admin/login` — autentica um administrador do backoffice. */
  login(body: AdminLoginRequest): Observable<AdminLoginResponse> {
    return this.http
      .post<AdminLoginResponse>(`${this.baseUrl}/admin/login`, body)
      .pipe(tap((response) => this.setSession(response.access_token)));
  }

  /** Termina a sessão do administrador atual. */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.authenticated.set(false);
  }

  /** Token JWT da sessão atual, se existir. */
  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  }

  private setSession(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    this.authenticated.set(true);
  }
}
