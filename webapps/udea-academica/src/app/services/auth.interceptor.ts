import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '@env/environment';

const API_BASE = environment.apiBaseUrl.replace(/\/+$/, '');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // No añadimos token a URLs externas
  const isAbsolute = /^https?:\/\//i.test(req.url);
  const isApiCall = !isAbsolute || req.url.startsWith(API_BASE);

  // Excluir endpoints que NO deben llevar Authorization
  const isDevLogin = req.url.includes('/auth/dev-login');
  const isAuthRedirect =
    req.url.includes('/auth/google') || req.url.includes('/auth/google/callback');

  if (token && isApiCall && !isDevLogin) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};