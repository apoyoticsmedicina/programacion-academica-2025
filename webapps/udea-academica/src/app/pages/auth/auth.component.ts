import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../dto/auth.dto';
import { environment } from '@env/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  processingCallback = false;
  private returnUrl = '/dashboard';

  // referencia al popup y al timer que vigila su cierre
  private popupRef: Window | null = null;
  private popupWatchTimer: number | null = null;

  // handler para mensajes del popup
  private messageHandler = (event: MessageEvent) => {
    // 1. Verificar origen (por seguridad)
    if (event.origin !== window.location.origin) return;
    if (!event.data || event.data.type !== 'google-auth') return;

    const { token } = event.data.payload || {};
    if (!token) return;

    // dejamos de vigilar el popup: ya tenemos token
    this.stopPopupWatcher();

    this.processingCallback = true;
    this.loading = true;
    this.error = null;

    this.authService.handleAuthCallback(token).subscribe({
      next: (user: AuthUser) => {
        this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
      },
      error: () => {
        this.error = 'No se pudo completar la autenticación.';
        this.loading = false;
        this.processingCallback = false;
      },
    });
  };

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // leer returnUrl si viene de un guard
    this.route.queryParams.subscribe((params) => {
      this.returnUrl = params['returnUrl'] || '/dashboard';

      // si ya estoy logueado, ir directo al dashboard
      if (this.authService.isLoggedIn()) {
        this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
      }
    });

    // escuchar mensajes del popup
    window.addEventListener('message', this.messageHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
    this.stopPopupWatcher();
  }

  // ====== Login con popup de Google ======
  loginWithGoogle(): void {
    this.error = null;
    this.loading = true;

    const url = this.authService.getGoogleAuthUrl();

    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      'google-login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      this.loading = false;
      this.error =
        'No se pudo abrir la ventana de autenticación (bloqueada por el navegador).';
      return;
    }

    // guardamos referencia y empezamos a vigilar el cierre
    this.popupRef = popup;
    this.startPopupWatcher(popup);
  }

  // ====== Helpers para vigilar el cierre del popup ======
  private startPopupWatcher(popup: Window) {
    // por si acaso ya había un watcher anterior
    this.stopPopupWatcher();

    this.popupWatchTimer = window.setInterval(() => {
      // si ya no hay referencia o ya se cerró
      if (!this.popupRef || this.popupRef.closed) {
        this.stopPopupWatcher();

        // si todavía no habíamos empezado a procesar el callback,
        // asumimos que el usuario canceló el login
        if (!this.processingCallback) {
          this.loading = false;
          // opcional: mensaje suave
          // this.error = 'Autenticación cancelada.';
        }
      }
    }, 500); // cada medio segundo es más que suficiente
  }

  private stopPopupWatcher() {
    if (this.popupWatchTimer !== null) {
      window.clearInterval(this.popupWatchTimer);
      this.popupWatchTimer = null;
    }
    this.popupRef = null;
  }

  devEnabled = !!environment.devAuth?.enabled;
  devEmail = '';

  loginDevByEmail(): void {
    this.error = null;
    this.loading = true;

    const email = (this.devEmail || '').trim();

    this.authService.authenticateDevByEmail(email).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
      },
      error: (e) => {
        console.error(e);
        this.error = 'No se pudo iniciar sesión (DEV). Revisa el email y la clave DEV.';
        this.loading = false;
      },
    });
  }
}
