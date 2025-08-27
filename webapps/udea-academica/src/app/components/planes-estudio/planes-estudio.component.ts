import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

// DTOs
import {
  PlanEstudio,
  CreatePlanEstudioDTO,
  UpdatePlanEstudioDTO,
} from '../../dto/planes-estudio.dto';

import { PlanEstudioService } from '../../services/plan-estudio.service';
import { ProgramaAcademico } from '../../dto/programas.dto';
import { ProgramaService } from '../../services/programa.service';

@Component({
  selector: 'app-planes-estudio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './planes-estudio.component.html',
  styleUrls: ['./planes-estudio.component.scss'],
})

export class PlanesEstudioComponent implements OnInit {
  planes: PlanEstudio[] = [];
  programas: ProgramaAcademico[] = [];

  showModal = false;
  editingPlan: PlanEstudio | null = null;
  loading = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private planService: PlanEstudioService,
    private programaService: ProgramaService
  ) {
    this.form = this.fb.group({
      programaId: [null, Validators.required],
      version: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadProgramas();
    this.loadPlanes();
  }

  loadProgramas() {
    this.loading = true;
    this.programaService.getAll() 
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: progs => {
          this.programas = progs;
          console.log('programas cargados:', progs);
        },
        error: err => console.error('Error cargando programas', err)
      });
  }

  loadPlanes() {
    this.loading = true;
    this.planService
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: pls => (this.planes = pls),
        error: err => console.error('Error cargando planes', err)
      });
  }

  openModal(plan?: PlanEstudio) {
    this.showModal = true;
    if (plan) {
      this.editingPlan = plan;
      this.form.setValue({
        programaId: plan.programaId,
        version: plan.version,
      });
    } else {
      this.editingPlan = null;
      this.form.reset({ programaId: null, version: '' });
    }
  }

  closeModal() {
    this.showModal = false;
  }

  submit() {
    if (this.form.invalid) return;

    const dto: CreatePlanEstudioDTO = {
      programaId: this.form.value.programaId,
      version: this.form.value.version
    };

    this.loading = true;

    if (this.editingPlan) {
      // Desactivar el plan actual y luego crear uno nuevo
      const updateDto: UpdatePlanEstudioDTO = { activo: false };
      this.planService
        .update(this.editingPlan.id, updateDto)
        .pipe(
          finalize(() => {
            // Una vez desactivado, creamos el nuevo
            this.planService
              .create(dto)
              .pipe(finalize(() => (this.loading = false)))
              .subscribe({
                next: () => {
                  this.closeModal();
                  this.loadPlanes();
                },
                error: err => console.error('Error creando plan', err)
              });
          })
        )
        .subscribe({
          next: () => {},
          error: err => console.error('Error desactivando plan', err)
        });
    } else {
      // Solo crear un nuevo plan
      this.planService
        .create(dto)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => {
            this.closeModal();
            this.loadPlanes();
          },
          error: err => console.error('Error creando plan', err)
        });
    }
  }

  /** Encuentra nombre de programa por su id */
  getProgramaNombre(id: number): string {
    const pr = this.programas.find((p) => p.id === id);
    return pr ? pr.nombre : '—';
  }
}
