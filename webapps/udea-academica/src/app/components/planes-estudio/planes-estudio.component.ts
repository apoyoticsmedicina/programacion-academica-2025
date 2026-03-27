import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

import {
  PlanEstudio,
  CreatePlanEstudioDTO,
  UpdatePlanEstudioDTO,
} from '../../dto/plan-estudio.dto';

import { PlanEstudioService } from '../../services/plan-estudio.service';
import { ProgramaAcademico } from '../../dto/programas.dto';
import { ProgramaService } from '../../services/programa.service';
import { Cohorte, CreateCohorteDTO } from '../../dto/cohortes.dto';
import { CohorteService } from '../../services/cohorte.service';

import { HasRoleDirective } from '../../directives/has-role.directive';
import { ROLES } from '../../auth/roles.const';
import { AuthService } from '../../services/auth.service';

// normaliza respuestas { items: [...] } / [...]
function unwrapList<T>(res: any): T[] {
  return Array.isArray(res)
    ? res
    : ((res?.items ??
      res?.data ??
      res?.results ??
      res?.rows ??
      res?.list ??
      []) as T[]);
}

type ModalMode = 'existing' | 'newCohorte';

@Component({
  selector: 'app-planes-estudio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HasRoleDirective],
  templateUrl: './planes-estudio.component.html',
  styleUrls: ['./planes-estudio.component.scss'],
})
export class PlanesEstudioComponent implements OnInit {
  planes: PlanEstudio[] = [];
  programas: ProgramaAcademico[] = [];
  cohortes: Cohorte[] = [];

  showModal = false;
  editingPlan: PlanEstudio | null = null;
  loading = false;

  form: FormGroup;

  // paso para crear cohorte
  cohorteForm: FormGroup;
  modalMode: ModalMode = 'existing';
  savingCohorte = false;

  ROLES = ROLES;

  constructor(
    private fb: FormBuilder,
    private planService: PlanEstudioService,
    private programaService: ProgramaService,
    private cohorteService: CohorteService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      programaId: [null, Validators.required],
      version: ['', Validators.required],
      cohorteId: [null, Validators.required],
      niveles: [
        12,
        [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)],
      ],
    });

    this.cohorteForm = this.fb.group({
      periodo: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
    });
  }

  private canManagePlanes(): boolean {
    const rol = this.auth.getCurrentUser()?.rol;
    return rol === ROLES.SUPERADMIN || rol === ROLES.ADMIN;
  }
  ngOnInit() {
    this.loadProgramas();
    this.loadCohortes(() => this.loadPlanes());
  }

  // ===== cargas =====
  loadProgramas() {
    this.loading = true;
    this.programaService
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.programas = unwrapList<ProgramaAcademico>(res) ?? [];
        },
        error: (err) => {
          console.error('Error cargando programas', err);
          this.programas = [];
        },
      });
  }

  loadCohortes(after?: () => void) {
    this.cohorteService.getAll().subscribe({
      next: (res) => {
        this.cohortes = unwrapList<Cohorte>(res) ?? [];
      },
      error: (err) => {
        console.error('Error cargando cohortes', err);
        this.cohortes = [];
      },
      complete: () => after?.(),
    });
  }

  loadPlanes() {
    this.loading = true;
    this.planService
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.planes = unwrapList<PlanEstudio>(res) ?? [];
        },
        error: (err) => {
          console.error('Error cargando planes', err);
          this.planes = [];
        },
      });
  }

  // ===== modal =====
  private getProp<T = any>(obj: any, ...keys: string[]): T | null {
    for (const k of keys) {
      if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k] as T;
    }
    return null;
  }

  openModal(plan?: any) {
    if (!this.canManagePlanes()) return;
    this.showModal = true;
    this.modalMode = 'existing';
    this.cohorteForm.reset({ periodo: '', fecha_inicio: '', fecha_fin: '' });

    // siempre arranca con valores válidos para evitar NG01002
    this.form.reset({
      programaId: null,
      version: '',
      cohorteId: this.cohortes.length ? this.cohortes[0].id : null,
    });

    if (plan) {
      this.editingPlan = plan;

      // Soporta tanto camelCase como snake_case que pueda traer el backend
      const programaId = this.getProp<number>(
        plan,
        'programaId',
        'programa_id'
      );
      const cohorteId = this.getProp<number>(plan, 'cohorteId', 'id_cohorte');
      const niveles = this.getProp<number>(plan, 'niveles');

      this.form.patchValue({
        programaId: programaId ?? null,
        version: plan.version ?? '',
        cohorteId: cohorteId ?? null,
        niveles: niveles ?? 12,
      });
    } else {
      this.editingPlan = null;
    }
  }

  closeModal() {
    this.showModal = false;
  }

  // crear cohorte dentro del modal
  createCohorte() {
    if (!this.canManagePlanes()) return;
    if (this.cohorteForm.invalid) return;

    const payload: CreateCohorteDTO = {
      periodo: this.cohorteForm.value.periodo,
      fecha_inicio: this.cohorteForm.value.fecha_inicio,
      fecha_fin: this.cohorteForm.value.fecha_fin,
    };

    this.savingCohorte = true;
    this.cohorteService
      .create(payload)
      .pipe(finalize(() => (this.savingCohorte = false)))
      .subscribe({
        next: (nuevo) => {
          this.cohortes = [nuevo, ...this.cohortes];
          this.form.patchValue({ cohorteId: nuevo.id });
          this.modalMode = 'existing';
        },
        error: (err) => {
          console.error('No se pudo crear el cohorte', err);
          alert('No se pudo crear el cohorte.');
        },
      });
  }

  // ===== crear/actualizar plan (snake_case correcto) =====
  submit() {
    if (!this.canManagePlanes()) return;
    if (this.form.invalid) return;

    const programaId = Number(this.form.value.programaId);
    const cohorteId = Number(this.form.value.cohorteId);
    const version = String(this.form.value.version || '').trim();
    const niveles = Number(this.form.value.niveles);

    if (!programaId) {
      alert('Selecciona un programa.');
      return;
    }
    if (!cohorteId) {
      alert('Selecciona un cohorte.');
      return;
    }
    if (!version) {
      alert('Ingresa la versión.');
      return;
    }

    if (!Number.isInteger(niveles) || niveles <= 0) {
      alert('El número de niveles debe ser un entero positivo.');
      return;
    }


    // ¡OJO! el backend espera id_cohorte (no cohorte_id)
    const payload: any = {
      programa_id: programaId,
      version,
      id_cohorte: cohorteId,
      niveles,
    };

    this.loading = true;

    if (this.editingPlan) {
      const updateDto: UpdatePlanEstudioDTO = { activo: false };
      this.planService
        .update(this.editingPlan.id, updateDto)
        .pipe(
          finalize(() => {
            this.planService
              .create(payload)
              .pipe(finalize(() => (this.loading = false)))
              .subscribe({
                next: () => {
                  this.closeModal();
                  this.loadPlanes();
                },
                error: (err) => console.error('Error creando plan', err),
              });
          })
        )
        .subscribe({
          next: () => { },
          error: (err) => {
            console.error('Error desactivando plan', err);
            this.loading = false;
          },
        });
    } else {
      this.planService
        .create(payload)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => {
            this.closeModal();
            this.loadPlanes();
          },
          error: (err) => console.error('Error creando plan', err),
        });
    }
  }

  getProgramaNombre(id: number): string {
    const pr = this.programas.find((p) => p.id === id);
    return pr ? pr.nombre : '—';
  }

  // ===== NUEVO: helper para mostrar el cohorte en la lista =====
  getCohorteTexto(pl: any): string {
    // prioriza objeto embebido; si no, busca por id
    const coh: Cohorte | undefined =
      pl?.cohorte ||
      this.cohortes.find(
        (c) => c.id === (pl?.cohorteId ?? pl?.id_cohorte ?? null)
      );

    if (!coh) return '—';

    if (coh.periodo) return coh.periodo;
    if (coh.fecha_inicio && coh.fecha_fin)
      return `${coh.fecha_inicio} a ${coh.fecha_fin}`;
    return `#${coh.id}`;
  }
}
