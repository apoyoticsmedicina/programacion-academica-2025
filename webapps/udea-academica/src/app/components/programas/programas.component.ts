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
  ProgramaAcademico,
  CreateProgramaDTO
} from '../../dto/programas.dto';
import { PlanEstudio } from '../../dto/planes-estudio.dto';
import { Curso } from '../../dto/cursos.dto';

// Servicios (comentados hasta implementar backend)
// import { ProgramaService } from '../../services/programa.service';
// import { PlanEstudioService } from '../../services/plan-estudio.service';
// import { CursoService } from '../../services/curso.service';

type PlanConCursos = PlanEstudio & { cursos: Curso[] };
type ProgramaConPlanes = ProgramaAcademico & {
  expanded: boolean;
  planes: PlanConCursos[];
};

@Component({
  selector: 'app-programas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './programas.component.html',
  styleUrls: ['./programas.component.scss']
})
export class ProgramasComponent implements OnInit {
  programas: ProgramaConPlanes[] = [];
  showModal = false;
  form: FormGroup;

  constructor(private fb: FormBuilder /*,
              private programaService: ProgramaService,
              private planService: PlanEstudioService,
              private cursoService: CursoService */) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['pregrado', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProgramas();
  }

  private loadProgramas(): void {
    // Datos dummy: sólo programas
    this.programas = [
      { id: 1, nombre: 'Medicina', tipo: 'pregrado', expanded: false, planes: [] },
      { id: 2, nombre: 'Instrumentación Quirúrgica', tipo: 'pregrado', expanded: false, planes: [] }
    ];

    // Cuando tengas servicio:
    // this.programaService.getAll().subscribe(data => {
    //   this.programas = data.map(p => ({ ...p, expanded: false, planes: [] }));
    // });
  }

  toggleExpand(p: ProgramaConPlanes): void {
    p.expanded = !p.expanded;

    if (p.expanded && p.planes.length === 0) {
      // Cargamos dummy de planes y cursos
      if (p.id === 1) {
        p.planes = [
          {
            id: 1,
            programaId: 1,
            version: '2021-1',
            activo: false,
            cursos: [
              { id: 1, codigo: 'MED101', nombre: 'Anatomía Humana', fechaInicio: '', fechaFin: '', habilitado: true, esElectiva: false, HTI: 48, HTC: 48, HTE: 24 },
              { id: 2, codigo: 'MED102', nombre: 'Fisiología',          fechaInicio: '', fechaFin: '', habilitado: true, esElectiva: false, HTI: 48, HTC: 48, HTE: 24 }
            ]
          },
          {
            id: 2,
            programaId: 1,
            version: '2022-1',
            activo: true,
            cursos: [
              { id: 3, codigo: 'MED201', nombre: 'Patología',       fechaInicio: '', fechaFin: '', habilitado: true, esElectiva: false, HTI: 48, HTC: 48, HTE: 24 },
              { id: 4, codigo: 'MED202', nombre: 'Farmacología',    fechaInicio: '', fechaFin: '', habilitado: true, esElectiva: false, HTI: 48, HTC: 48, HTE: 24 }
            ]
          }
        ];
      } else if (p.id === 2) {
        p.planes = [
          {
            id: 3,
            programaId: 2,
            version: '2023-1',
            activo: true,
            cursos: [
              { id: 5, codigo: 'INS301', nombre: 'Instrumentación Avanzada', fechaInicio: '', fechaFin: '', habilitado: true, esElectiva: false, HTI: 32, HTC: 32, HTE: 16 }
            ]
          }
        ];
      }

      // Servicio real:
      // this.planService.getByPrograma(p.id).subscribe(pls => {
      //   // luego para cada plan, si quieres cargar cursos:
      //   // pls.forEach(plan => this.cursoService.getByPlan(plan.id).subscribe(cs => plan.cursos = cs));
      // });
    }
  }

  openModal(): void {
    this.showModal = true;
    this.form.reset({ tipo: 'pregrado' });
  }

  closeModal(): void {
    this.showModal = false;
  }

  submit(): void {
    if (this.form.invalid) return;

    const dto = this.form.value as CreateProgramaDTO;
    console.log('Crear programa', dto);

    // Si tuvieras backend:
    // this.programaService.create(dto).subscribe(() => {
    //   this.closeModal();
    //   this.loadProgramas();
    // });

    // **Dummy push** al array para que se vea inmediatamente:
    const nextId = this.programas.length
      ? Math.max(...this.programas.map(p => p.id)) + 1
      : 1;

    this.programas.push({
      id: nextId,
      nombre: dto.nombre,
      tipo: dto.tipo,
      expanded: false,
      planes: []
    });

    this.closeModal();
    this.form.reset({ tipo: 'pregrado' });
  }
}
