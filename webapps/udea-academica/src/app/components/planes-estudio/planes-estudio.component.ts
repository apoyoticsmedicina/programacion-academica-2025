import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
// DTOs
import {
  PlanEstudio,
  CreatePlanEstudioDTO,
  UpdatePlanEstudioDTO
} from '../../dto/planes-estudio.dto';
import { PlanEstudioService } from '../../services/plan-estudio.service';
import {
  ProgramaAcademico
} from '../../dto/programas.dto';
import { ProgramaService } from '../../services/programa.service';

@Component({
  selector: 'app-planes-estudio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './planes-estudio.component.html',
  styleUrls: ['./planes-estudio.component.scss']
})
export class PlanesEstudioComponent implements OnInit {
  planes: PlanEstudio[] = [];
  programas: ProgramaAcademico[] = [];

  showModal = false;
  editingPlan: PlanEstudio | null = null;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private planService: PlanEstudioService,
    private programaService: ProgramaService
  ) {
    this.form = this.fb.group({
      programaId: [null, Validators.required],
      version: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProgramas();
    this.loadPlanes();
  }

  loadProgramas() {
    // ---------- PETICIÓN REAL (comentada) ----------
    // this.programaService
    //   .getAll()
    //   .subscribe(progs => (this.programas = progs));

    // ----------- DATOS DUMMY ------------
    this.programas = [
      { id: 1, nombre: 'Medicina', tipo: 'pregrado' },
      { id: 2, nombre: 'Instrumentación Quirúrgica', tipo: 'pregrado' },
      { id: 3, nombre: 'Técnica Profesional en Atención Prehospitalaria', tipo: 'pregrado' },
      { id: 4, nombre: 'Maestría en Salud Pública', tipo: 'posgrado' }
    ];
  }

  loadPlanes() {
    // ---------- PETICIÓN REAL (comentada) ----------
    // this.planService
    //   .getAll()
    //   .subscribe(pls => (this.planes = pls));

    // ----------- DATOS DUMMY ------------
    this.planes = [
      { id: 1, programaId: 1, version: '2022-I', activo: true },
      { id: 2, programaId: 2, version: '2023-I', activo: true },
      { id: 3, programaId: 1, version: '2021-II', activo: false }
    ];
  }

  openModal(plan?: PlanEstudio) {
    this.showModal = true;
    if (plan) {
      this.editingPlan = plan;
      this.form.setValue({
        programaId: plan.programaId,
        version: plan.version
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

    if (this.editingPlan) {
      // ---------- BACKEND REAL (comentado) ----------
      // const updateDto: UpdatePlanEstudioDTO = { activo: false };
      // this.planService.update(this.editingPlan.id, updateDto).subscribe(() => {
      //   this.planService.create(dto).subscribe(() => {
      //     this.closeModal();
      //     this.loadPlanes();
      //   });
      // });

      // Simulación de edición en dummy:
      const idx = this.planes.findIndex(p => p.id === this.editingPlan!.id);
      if (idx > -1) this.planes[idx].activo = false;
      const newId = Math.max(...this.planes.map(p => p.id)) + 1;
      this.planes.push({ id: newId, ...dto, activo: true });
      this.closeModal();

    } else {
      // ---------- BACKEND REAL (comentado) ----------
      // this.planService.create(dto).subscribe(() => {
      //   this.closeModal();
      //   this.loadPlanes();
      // });

      // Simulación de creación en dummy:
      const newId = this.planes.length
        ? Math.max(...this.planes.map(p => p.id)) + 1
        : 1;
      this.planes.push({ id: newId, ...dto, activo: true });
      this.closeModal();
    }

    // refresca la tabla (en real llamaría loadPlanes())
  }

  /** Encuentra nombre de programa por su id */
  getProgramaNombre(id: number): string {
    const pr = this.programas.find(p => p.id === id);
    return pr ? pr.nombre : '—';
  }
}
