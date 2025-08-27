import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Curso, CreateCursoDTO } from '../../dto/cursos.dto';
import { CursoService } from '../../services/curso.service';

import { ProgramaAcademico } from '../../dto/programas.dto';
import { ProgramaService } from '../../services/programa.service';

import { PlanEstudio } from '../../dto/planes-estudio.dto';
import { PlanEstudioService } from '../../services/plan-estudio.service';

import {
  CreatePlanEstudioCursoDTO,
  PlanEstudioCurso
} from '../../dto/plan-estudio-curso.dto';
import { PlanEstudioCursoService } from '../../services/plan-estudio-curso.service';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss']
})
export class CursosComponent implements OnInit {
  cursos: Curso[] = [];
  programas: ProgramaAcademico[] = [];
  planes: PlanEstudio[] = [];

  showModal = false;
  showLink  = false;

  form: FormGroup;
  linkForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService,
    private programaService: ProgramaService,
    private planService: PlanEstudioService,
    private pecService: PlanEstudioCursoService
  ) {
    // Formulario para crear/editar Cursos
    this.form = this.fb.group({
      codigo:     ['', Validators.required],
      nombre:     ['', Validators.required],
      nivel:      ['', Validators.required],
      habilitado: [true],
      HTI:        [0, [Validators.required, Validators.min(0)]],
      HTC:        [0, [Validators.required, Validators.min(0)]],
      HTE:        [0, [Validators.required, Validators.min(0)]]
    });

    // Formulario para vincular Curso ↔ PlanEstudio
    this.linkForm = this.fb.group({
      cursoId:        [null, Validators.required],
      planEstudioId:  [null, Validators.required],
      obligatorio:    [true],
      esElectiva:     [false],
      orden:          [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadCursos();
    this.loadProgramas();
    this.loadPlanes();
  }

  private loadCursos() {
    this.cursoService.getAll().subscribe(list => this.cursos = list);
  }

  private loadProgramas() {
    this.programaService.getAll().subscribe(list => this.programas = list);
  }

  private loadPlanes() {
    this.planService.getAll().subscribe(list => this.planes = list);
  }

  // ——— Modal de creación/edición de curso ———
  openModal() {
    this.showModal = true;
    this.form.reset({
      codigo:     '',
      nombre:     '',
      nivel:      '',
      habilitado: true,
      HTI:        0,
      HTC:        0,
      HTE:        0
    });
  }

  closeModal() {
    this.showModal = false;
  }

  submit() {
    if (this.form.invalid) return;

    const dto: CreateCursoDTO = this.form.value;
    this.cursoService.create(dto).subscribe(newCurso => {
      this.cursos.push(newCurso);
      this.closeModal();
    });
  }

  // ——— Modal de vinculación Curso ↔ PlanEstudio ———
  openLinkModal() {
    this.showLink = true;
    this.linkForm.reset({
      cursoId:       null,
      planEstudioId: null,
      obligatorio:   true,
      esElectiva:    false,
      orden:         1
    });
  }

  closeLinkModal() {
    this.showLink = false;
  }

  submitLink() {
    if (this.linkForm.invalid) return;

    const dto: CreatePlanEstudioCursoDTO = this.linkForm.value;
    this.pecService.create(dto).subscribe({
      next: (assoc: PlanEstudioCurso) => {
        this.closeLinkModal();
        alert('Curso vinculado al plan exitosamente.');
      },
      error: err => console.error('Error al vincular curso:', err)
    });
  }

  /** Muestra el nombre del programa a partir de su id */
  getProgramaNombre(id: number): string {
    const pr = this.programas.find(p => p.id === id);
    return pr ? pr.nombre : '—';
  }
}
