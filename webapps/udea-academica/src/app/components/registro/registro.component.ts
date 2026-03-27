// src/app/components/registro/registro.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsuarioAdminDTO } from '../../dto/usuario.dto';
import { RolUsuario } from '../../dto/roles.dto';
import { HasRoleDirective } from '../../directives/has-role.directive';
import { ROLES } from '../../auth/roles.const';
import { Router } from '@angular/router';

type UsuarioAdminView = UsuarioAdminDTO & {
  fotoError?: boolean;
};

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HasRoleDirective],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})

export class RegistroComponent implements OnInit {
  ROLES = ROLES;

  form: FormGroup;

  roles: RolUsuario[] = [];
  usuarios: UsuarioAdminView[] = [];

  loadingRoles = false;
  loadingUsuarios = false;
  submitting = false;

  error: string | null = null;
  success: string | null = null;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: [
        '',
        [Validators.required, Validators.email],
      ],
      rol: ['', Validators.required],
    });
  }

  private isAdminLike(): boolean {
    const rol = this.authService.getCurrentUser()?.rol;
    return rol === ROLES.SUPERADMIN || rol === ROLES.ADMIN;
  }

  ngOnInit(): void {
    if (!this.isAdminLike()) {
      this.router.navigate(['/dashboard/perfil'], { queryParams: { denied: 1 } });
      return;
    }

    this.loadRoles();
    this.loadUsuarios();
  }

  private loadRoles(): void {
    this.loadingRoles = true;
    this.authService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles ?? [];
        this.loadingRoles = false;
      },
      error: (err) => {
        console.error(err);
        this.roles = ['superadmin', 'admin', 'coordinador de programa', 'coordinador de curso', 'docente'];
        this.loadingRoles = false;
      },
    });
  }

  private loadUsuarios(): void {
    this.loadingUsuarios = true;
    this.authService.getUsuarios().subscribe({
      next: (list) => {
        this.usuarios = (list ?? []).map((u) => ({
          ...u,
          foto: u.foto || null,
          fotoError: false,
        }));
        this.loadingUsuarios = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingUsuarios = false;
        this.error = 'No se pudieron cargar los usuarios registrados.';
      },
    });
  }

  submit(): void {
    this.error = null;
    this.success = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = (this.form.value.email as string).trim().toLowerCase();
    const rol = this.form.value.rol as RolUsuario;

    this.submitting = true;

    this.authService.preRegisterUsuario({ email, rol }).subscribe({
      next: (user) => {
        this.submitting = false;
        this.success = 'Usuario registrado / actualizado correctamente.';

        const normalizedUser: UsuarioAdminView = {
          ...user,
          foto: user.foto || null,
          fotoError: false,
        };

        const idx = this.usuarios.findIndex((u) => u.id === normalizedUser.id);

        if (idx > -1) {
          this.usuarios[idx] = normalizedUser;
          this.usuarios = [...this.usuarios];
        } else {
          this.usuarios = [normalizedUser, ...this.usuarios];
        }

        this.form.patchValue({ email: '' });
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
        this.error = 'No se pudo registrar el usuario.';
      },
    });
  }

  onUserPhotoError(user: UsuarioAdminView): void {
    user.fotoError = true;
  }

  hasError(controlName: string, errorName: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!ctrl && ctrl.touched && ctrl.hasError(errorName);
  }

  getRoleLabel(rol: RolUsuario): string {
    switch (rol) {
      case 'superadmin':
        return 'Superadministrador';
      case 'admin':
        return 'Administrador';
      case 'coordinador de programa':
        return 'Coordinador de Programa';
      case 'coordinador de curso':
        return 'Coordinador de Curso';
      case 'docente':
        return 'Docente';
      default:
        return rol;
    }
  }

  getInitials(nombreOrEmail: string | null | undefined): string {
    if (!nombreOrEmail) return '?';
    const text = nombreOrEmail.trim();
    if (!text) return '?';

    const base = text.includes('@') ? text.split('@')[0] : text;
    const parts = base.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    const first = parts[0].charAt(0);
    const last = parts[parts.length - 1].charAt(0);
    return (first + last).toUpperCase();
  }
}
