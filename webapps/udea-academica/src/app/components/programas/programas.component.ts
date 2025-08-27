import { Component, OnInit }       from '@angular/core';
import { CommonModule }            from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  ProgramaAcademico,
  CreateProgramaDTO
} from '../../dto/programas.dto';
import {
  PlanEstudio,
  CreatePlanEstudioDTO,
  UpdatePlanEstudioDTO
} from '../../dto/planes-estudio.dto';
import { PlanEstudioCurso } from '../../dto/plan-estudio-curso.dto';

import { ProgramaService }         from '../../services/programa.service';
import { PlanEstudioService }      from '../../services/plan-estudio.service';
import { PlanEstudioCursoService } from '../../services/plan-estudio-curso.service';

type PlanConCursos = PlanEstudio & {
  cursos: PlanEstudioCurso[];
};

type ProgramaConPlanes = ProgramaAcademico & {
  expanded: boolean;
  planes:   PlanConCursos[];
};

@Component({
  selector: 'app-programas',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './programas.component.html',
  styleUrls:   ['./programas.component.scss']
})
export class ProgramasComponent implements OnInit {
  programas: ProgramaConPlanes[] = [];
  showModal = false;
  form:      FormGroup;

  constructor(
    private fb:         FormBuilder,
    private programaSvc: ProgramaService,
    private planSvc:     PlanEstudioService,
    private pecSvc:      PlanEstudioCursoService
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      tipo:   ['pregrado', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProgramas();
  }

  private loadProgramas(): void {
    this.programaSvc.getAll().subscribe(progs => {
      this.programas = progs.map(p => ({
        ...p,
        expanded: false,
        planes:   []
      }));
    });
  }

  toggleExpand(p: ProgramaConPlanes): void {
    p.expanded = !p.expanded;
    if (!p.expanded || p.planes.length) return;

    // 1) Traer todos los planes de este programa
    this.planSvc.getByPrograma(p.id).subscribe(pls => {
      // 2) Filtrar solo los activos
      const activos = pls.filter(plan => plan.activo);
      // 3) Inicializar con array vacío de cursos
      p.planes = activos.map(plan => ({ ...plan, cursos: [] }));

      // 4) Para cada plan, traer sus asociaciones curso↔plan
      p.planes.forEach(plan => {
        this.pecSvc.getByPlan(plan.id).subscribe(assocs => {
          // 5) Ordenar por `orden`
          assocs.sort((a, b) => a.orden - b.orden);
          plan.cursos = assocs;
        });
      });
    });
  }

  openModal(): void {
    this.showModal = true;
    this.form.reset({ nombre: '', tipo: 'pregrado' });
  }

  closeModal(): void {
    this.showModal = false;
  }

  submit(): void {
    if (this.form.invalid) return;
    const dto: CreateProgramaDTO = this.form.value;
    this.programaSvc.create(dto).subscribe(() => {
      this.closeModal();
      this.loadProgramas();
    });
  }

  /** Para mostrar el nombre de un programa por su id */
  getProgramaNombre(id: number): string {
    const pr = this.programas.find(p => p.id === id);
    return pr ? pr.nombre : '';
  }
}
