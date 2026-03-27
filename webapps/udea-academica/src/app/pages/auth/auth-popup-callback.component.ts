import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth-popup-callback',
  standalone: true,
  imports: [CommonModule],
  template: `<p>Procesando autenticación...</p>`,
})
export class AuthPopupCallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const sub = this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const email = params['email'];
      const nombre = params['nombre'];
      const rol = params['rol'];
      const foto = params['foto'];

      if (token && window.opener) {
        const payload = { token, email, nombre, rol, foto };

        // Enviamos mensaje a la ventana principal
        window.opener.postMessage(
          {
            type: 'google-auth',
            payload,
          },
          window.location.origin // aseguramos mismo origen
        );
      }

      // Cerramos el popup
      window.close();
      sub.unsubscribe();
    });
  }
}
