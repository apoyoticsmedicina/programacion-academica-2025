import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { HasRoleDirective } from '../../directives/has-role.directive';
import { ROLES } from '../../auth/roles.const';

import {
  EstadoServidorService,
  EstadoServidorDTO,
  ActivarFlujoFullDTO,
  ActivarCronogramasOnlyDTO,
} from '../../services/estado-servidor.service';

@Component({
  selector: 'app-estado-servidor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HasRoleDirective],
  templateUrl: './estado-servidor.component.html',
  styleUrls: ['./estado-servidor.component.scss'],
})
export class EstadoServidorComponent implements OnInit {
  ROLES = ROLES;

  estados: EstadoServidorDTO[] = [];
  active: EstadoServidorDTO | null = null;
  effective: EstadoServidorDTO | null = null;

  loading = false;
  submittingFlow1 = false;
  submittingFlow2 = false;

  error: string | null = null;
  success: string | null = null;

  flow1Form: FormGroup;
  flow2Form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private estadoSrv: EstadoServidorService,
    private router: Router
  ) {
    this.flow1Form = this.fb.group({
      sDesde: ['', Validators.required],
      sHasta: ['', Validators.required],
      rDesde: ['', Validators.required],
      rHasta: ['', Validators.required],
      cDesde: ['', Validators.required],
      cHasta: ['', Validators.required],
    });

    this.flow2Form = this.fb.group({
      cDesde: ['', Validators.required],
      cHasta: ['', Validators.required],
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

    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = null;
    this.success = null;

    this.estadoSrv.list().subscribe({
      next: (list) => {
        this.estados = list ?? [];
        // luego cargamos active/effective
        this.estadoSrv.active().subscribe({
          next: (a) => {
            this.active = a;
            this.estadoSrv.effective().subscribe({
              next: (e) => {
                this.effective = e;
                this.loading = false;
              },
              error: (err) => {
                console.error(err);
                this.loading = false;
                this.error = 'No se pudo obtener el estado efectivo.';
              },
            });
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            this.error = 'No se pudo obtener el estado activo.';
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = 'No se pudieron cargar los estados del servidor.';
      },
    });
  }

  recalc(): void {
    this.error = null;
    this.success = null;

    this.estadoSrv.recalc().subscribe({
      next: () => {
        this.success = 'Recalculo ejecutado.';
        this.refresh();
      },
      error: (err) => {
        console.error(err);
        this.error = err?.error?.message || 'No se pudo ejecutar el recálculo.';
      },
    });
  }

  submitFlow1(): void {
    this.error = null;
    this.success = null;

    if (this.flow1Form.invalid) {
      this.flow1Form.markAllAsTouched();
      return;
    }

    const v = this.flow1Form.value;

    const payload: ActivarFlujoFullDTO = {
      solicitudes: { desde: this.toIso(v.sDesde), hasta: this.toIso(v.sHasta) },
      revisiones: { desde: this.toIso(v.rDesde), hasta: this.toIso(v.rHasta) },
      cronogramas: { desde: this.toIso(v.cDesde), hasta: this.toIso(v.cHasta) },
    };

    this.submittingFlow1 = true;
    this.estadoSrv.activarFlujoFull(payload).subscribe({
      next: () => {
        this.submittingFlow1 = false;
        this.success = 'Flujo 1 activado correctamente.';
        this.refresh();
      },
      error: (err) => {
        console.error(err);
        this.submittingFlow1 = false;
        this.error = err?.error?.message || 'No se pudo activar el flujo 1.';
      },
    });
  }

  submitFlow2(): void {
    this.error = null;
    this.success = null;

    if (this.flow2Form.invalid) {
      this.flow2Form.markAllAsTouched();
      return;
    }

    const v = this.flow2Form.value;

    const payload: ActivarCronogramasOnlyDTO = {
      cronogramas: { desde: this.toIso(v.cDesde), hasta: this.toIso(v.cHasta) },
    };

    this.submittingFlow2 = true;
    this.estadoSrv.activarCronogramasOnly(payload).subscribe({
      next: () => {
        this.submittingFlow2 = false;
        this.success = 'Cronogramas (only) activado correctamente.';
        this.refresh();
      },
      error: (err) => {
        console.error(err);
        this.submittingFlow2 = false;
        this.error = err?.error?.message || 'No se pudo activar cronogramas-only.';
      },
    });
  }

  hasError(form: FormGroup, controlName: string, errorName: string): boolean {
    const ctrl = form.get(controlName);
    return !!ctrl && ctrl.touched && ctrl.hasError(errorName);
  }

  formatWindow(e: EstadoServidorDTO | null): string {
    if (!e?.activo_desde || !e?.activo_hasta) return 'Sin franja';
    const d1 = new Date(e.activo_desde);
    const d2 = new Date(e.activo_hasta);
    return `${d1.toLocaleString()} → ${d2.toLocaleString()}`;
  }

  private toIso(localDatetime: string): string {
    // datetime-local => Date (en zona local del navegador) => ISO UTC
    const d = new Date(localDatetime);
    if (Number.isNaN(d.getTime())) throw new Error('Fecha inválida.');
    return d.toISOString();
  }
}