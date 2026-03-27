// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthUser } from '../dto/auth.dto';
import { environment } from '@env/environment';
import { UsuarioAdminDTO, } from '../dto/usuario.dto';
import { RolUsuario } from '../dto/roles.dto';
import { ROLES } from '../auth/roles.const';

const ALL_ROLES = Object.values(ROLES) as RolUsuario[];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // 👇 Ahora la base sale del environment
  private readonly base = `${environment.apiBaseUrl}/auth`;

  // 👇 Keys con prefijo por ambiente (local/dev/prod)
  private readonly tokenKey = `${environment.auth.storageKeyPrefix}_token`;
  private readonly userKey = `${environment.auth.storageKeyPrefix}_user`;

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.restoreFromStorage();
  }

  /** URL base para iniciar login con Google (en popup) */
  getGoogleAuthUrl(): string {
    return `${this.base}/google`;
  }

  /** Manejar callback: guardar token y pedir /auth/me */
  handleAuthCallback(token: string): Observable<AuthUser> {
    this.setToken(token);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<AuthUser>(`${this.base}/me`, { headers }).pipe(
      tap((user) => this.setUser(user))
    );
  }

  /** Lista de usuarios registrados (para la tabla del admin) */
  getUsuarios(): Observable<UsuarioAdminDTO[]> {
    return this.http.get<UsuarioAdminDTO[]>(`${this.base}/usuarios`);
  }

  /** Roles disponibles (superadmin, admin, coordinador) */
  getRoles(): Observable<RolUsuario[]> {
    return this.http.get<RolUsuario[]>(`${this.base}/roles`);
  }

  /** Preregistro de un correo con rol */
  preRegisterUsuario(payload: { email: string; rol: RolUsuario }): Observable<UsuarioAdminDTO> {
    return this.http.post<UsuarioAdminDTO>(`${this.base}/registro`, payload);
  }



  // --- helpers ---

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: AuthUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }


  private restoreFromStorage(): void {
    const rawUser = localStorage.getItem(this.userKey);
    if (!rawUser) return;

    try {
      const user = JSON.parse(rawUser) as AuthUser;

      if (!user?.rol || !ALL_ROLES.includes(user.rol)) {
        throw new Error('Rol inválido en storage');
      }

      this.currentUserSubject.next(user);
    } catch {
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.tokenKey);
      this.currentUserSubject.next(null);
    }
  }

  authenticateDevByEmail(email: string): Observable<AuthUser> {
    const devAuth = environment.devAuth;

    if (!devAuth?.enabled) {
      throw new Error('Dev login deshabilitado en este environment.');
    }

    const emailNorm = (email || '').trim().toLowerCase();
    if (!emailNorm) {
      throw new Error('Email requerido.');
    }

    const headers = new HttpHeaders({
      'X-DEV-KEY': devAuth.devKey,
    });

    // Recomendado: el backend retorna { token } o { token, user }
    return this.http
      .post<{ token: string } | { token: string; user: any }>(
        `${this.base}/dev-login`,
        { email: emailNorm },
        { headers }
      )
      .pipe(
        tap((resp: any) => {
          if (resp?.token) this.setToken(resp.token);
        }),
        // Siempre normalizamos trayendo /me para garantizar rol/nombre/foto consistente
        // (porque dev-login podría retornar solo token)
        // Nota: aquí reutilizamos handleAuthCallback
        // pero handleAuthCallback también hace setToken; no pasa nada repetir.
        // Para evitar doble setToken puedes refactorizar, pero no es necesario.
        // Lo dejo simple.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (source$) =>
          new Observable<AuthUser>((subscriber) => {
            source$.subscribe({
              next: (resp: any) => {
                const token = resp?.token;
                if (!token) {
                  subscriber.error(new Error('Respuesta sin token.'));
                  return;
                }
                this.handleAuthCallback(token).subscribe({
                  next: (user) => {
                    subscriber.next(user);
                    subscriber.complete();
                  },
                  error: (e) => subscriber.error(e),
                });
              },
              error: (e) => subscriber.error(e),
            });
          })
      );
  }


}
