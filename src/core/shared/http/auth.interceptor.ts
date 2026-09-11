import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../features/auth/services/auth.service';
import { NotificationService } from '../../features/notifications/services/notification.service';

/** Anexa `Authorization: Bearer <token>` às requisições, quando há sessão ativa. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};

/**
 * Encerra a sessão e envia para o login quando a API responde 401 — token
 * expirado ou inválido. O próprio `POST /admin/login` fica de fora: um 401
 * aí é só "credenciais erradas", tratado pelo componente de login.
 */
export const sessionExpiredInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const isLoginRequest = req.url.endsWith('/admin/login');

      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isLoginRequest &&
        authService.isAuthenticated()
      ) {
        notificationService.disconnect();
        authService.logout();
        toast.error('Sessão expirada', {
          description: 'Inicie sessão novamente para continuar.',
        });
        router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};
