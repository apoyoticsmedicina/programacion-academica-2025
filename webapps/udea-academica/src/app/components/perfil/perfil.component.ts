// src/app/components/perfil/perfil.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface PerfilUser {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  foto?: string | null;
}

// Posibles keys según entorno
const USER_KEYS = ['udea-academica-dev_user', 'udea-academica_user'];

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  user: PerfilUser | null = null;
  initials = '';
  roleLabel = '';

  /** Key que realmente se usó para leer el usuario */
  private storageKeyUsed: string | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.cargarUsuario();
  }

  private resolveUserKey(): string | null {
    for (const key of USER_KEYS) {
      if (localStorage.getItem(key)) {
        return key;
      }
    }
    return null;
  }

  private cargarUsuario(): void {
    const key = this.resolveUserKey();
    if (!key) {
      this.user = null;
      this.initials = '';
      this.roleLabel = '';
      this.storageKeyUsed = null;
      return;
    }

    const raw = localStorage.getItem(key);
    if (!raw) {
      this.user = null;
      this.initials = '';
      this.roleLabel = '';
      this.storageKeyUsed = null;
      return;
    }

    this.storageKeyUsed = key;

    try {
      const parsed = JSON.parse(raw);

      this.user = {
        id: parsed.id,
        email: parsed.email,
        nombre: parsed.nombre,
        rol: parsed.rol,
        foto: parsed.foto ?? null,
      };

      this.initials = this.buildInitials(this.user.nombre || this.user.email);
      this.roleLabel = this.buildRoleLabel(this.user.rol);
    } catch (e) {
      console.error('No se pudo parsear el usuario de localStorage', e);
      this.user = null;
      this.initials = '';
      this.roleLabel = '';
      this.storageKeyUsed = null;
    }
  }

  private buildInitials(source: string): string {
    if (!source) return '';
    const parts = source.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts[parts.length - 1]?.charAt(0) ?? '';
    return (first + last).toUpperCase();
  }

  private buildRoleLabel(rol: string | null | undefined): string {
    const r = (rol || '').toLowerCase();
    if (r === 'admin') return 'ADMIN';
    if (r === 'coordinador') return 'COORDINACIÓN';
    if (r === 'docente') return 'DOCENTE';
    return r || 'USUARIO';
  }

  goDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  logout(): void {
    // Borramos la key usada y, por seguridad, ambas posibles keys
    if (this.storageKeyUsed) {
      localStorage.removeItem(this.storageKeyUsed);
    }
    for (const k of USER_KEYS) {
      localStorage.removeItem(k);
    }
    this.router.navigateByUrl('/auth', { replaceUrl: true });
  }
}
