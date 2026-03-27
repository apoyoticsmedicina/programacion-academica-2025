import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { HasRoleDirective } from '../../directives/has-role.directive';
import { ROLES } from '../../auth/roles.const';
import { UsuarioAdminDTO } from '../../dto/usuario.dto';

import {
  AsignarCoordinadorService,
  CursoDisponibleDTO,
} from '../../services/asignar-coordinador.service';

@Component({
  selector: 'app-asiganar-coordinador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HasRoleDirective],
  templateUrl: './asiganar-coordinador.component.html',
  styleUrls: ['./asiganar-coordinador.component.scss'],
})
export class AsiganarCoordinadorComponent implements OnInit {
  ROLES = ROLES;

  form: FormGroup;

  usuarios: UsuarioAdminDTO[] = [];
  coordinadores: UsuarioAdminDTO[] = [];

  cursos: CursoDisponibleDTO[] = [];

  loadingUsuarios = false;
  loadingCursos = false;
  saving = false;

  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private api: AsignarCoordinadorService,
    private router: Router
  ) {
    this.form = this.fb.group({
      usuarioId: ['', Validators.required],
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

    this.loadUsuarios();
  }

  private loadUsuarios(): void {
    this.loadingUsuarios = true;
    this.error = null;

    this.api.getUsuarios().subscribe({
      next: (list) => {
        this.usuarios = list ?? [];
        this.coordinadores = (this.usuarios || []).filter(
          (u) =>
            u.rol === 'coordinador de programa' || u.rol === 'coordinador de curso'
        );
        this.loadingUsuarios = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingUsuarios = false;
        this.error = 'No se pudieron cargar los usuarios.';
      },
    });
  }

  onSelectCoordinador(): void {
    this.error = null;
    this.success = null;

    const usuarioId = Number(this.form.value.usuarioId);
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      this.cursos = [];
      return;
    }
    this.cursos = [];
    this.loadingCursos = true;
    this.api.getCursosDisponibles(usuarioId).subscribe({
      next: (list) => {
        const all = list ?? [];
        // ✅ desde el inicio: ocultar los ya asignados
        this.cursos = all.filter((c) => !c.asignado);
        this.loadingCursos = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingCursos = false;
        this.error = 'No se pudieron cargar los cursos disponibles.';
      },
    });
  }

  toggleCurso(cursoId: number): void {
    const idx = this.cursos.findIndex((c) => c.id === cursoId);
    if (idx < 0) return;
    this.cursos[idx] = { ...this.cursos[idx], asignado: !this.cursos[idx].asignado };
  }

  marcarTodos(valor: boolean): void {
    this.cursos = this.cursos.map((c) => ({ ...c, asignado: valor }));
  }

  guardar(): void {
    this.error = null;
    this.success = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const usuarioId = Number(this.form.value.usuarioId);
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      this.error = 'Debe seleccionar un coordinador.';
      return;
    }

    const cursoIds = this.cursos.filter((c) => c.asignado).map((c) => c.id);

    this.saving = true;
    this.api.setCursos(usuarioId, cursoIds).subscribe({
      next: () => {
        this.saving = false;

        const n = cursoIds.length;
        this.success = n
          ? `Asignación guardada: ${n} curso${n === 1 ? '' : 's'} asignado${n === 1 ? '' : 's'}.`
          : 'Asignación guardada: sin cursos asignados.';

        // ✅ recargar desde backend y ocultar los ya asignados
        this.loadingCursos = true;
        this.api.getCursosDisponibles(usuarioId).subscribe({
          next: (list) => {
            const all = list ?? [];
            this.cursos = all.filter((c) => !c.asignado); // 👈 se “desaparecen” los asignados
            this.loadingCursos = false;
          },
          error: (err) => {
            console.error(err);
            this.loadingCursos = false;
            // si falla el refresh, al menos no rompemos el flujo
          },
        });

        // opcional: autohide del mensaje
        setTimeout(() => {
          this.success = null;
        }, 2500);
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.error = err?.error?.message || 'No se pudo guardar la asignación.';
      },
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!ctrl && ctrl.touched && ctrl.hasError(errorName);
  }

  getRoleLabel(rol: string): string {
    switch (rol) {
      case 'coordinador de programa':
        return 'Coordinador de Programa';
      case 'coordinador de curso':
        return 'Coordinador de Curso';
      default:
        return rol;
    }
  }

  getSelectedCount(): number {
    return this.cursos.filter((c) => c.asignado).length;
  }
}