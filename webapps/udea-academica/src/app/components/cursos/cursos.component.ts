
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

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss']
})
export class CursosComponent implements OnInit {
  cursos: Curso[] = [];
  showModal = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService
  ) {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      esElectiva: [false]
    });
  }

  ngOnInit() {
    this.loadCursos();
  }

  loadCursos() {
    // REST: this.cursoService.getAll().subscribe(list => this.cursos = list);

    // DUMMY DATA:
    this.cursos = [
      {
        id: 1,
        codigo: 'MED101',
        nombre: 'Anatomía Humana',
        fechaInicio: '2024-02-01',
        fechaFin: '2024-06-30',
        habilitado: true,
        esElectiva: false,
        HTI: 48,
        HTC: 40,
        HTE: 8
      },
      {
        id: 2,
        codigo: 'INS201',
        nombre: 'Instrumentación Quirúrgica I',
        fechaInicio: '2024-02-01',
        fechaFin: '2024-06-30',
        habilitado: true,
        esElectiva: false,
        HTI: 32,
        HTC: 24,
        HTE: 8
      },
      {
        id: 3,
        codigo: 'ELE300',
        nombre: 'Ética Médica',
        fechaInicio: '2024-02-01',
        fechaFin: '2024-06-30',
        habilitado: true,
        esElectiva: true,
        HTI: 16,
        HTC: 12,
        HTE: 4
      }
    ];
  }

  openModal() {
    this.showModal = true;
    this.form.reset({ codigo: '', nombre: '', esElectiva: false });
  }

  closeModal() {
    this.showModal = false;
  }

  submit() {
    if (this.form.invalid) return;

    // Extraemos y forzamos que esElectiva sea boolean
    const raw = this.form.value;
    const dto: CreateCursoDTO = {
      codigo: raw.codigo,
      nombre: raw.nombre,
      esElectiva: raw.esElectiva ?? false
    };

    // REST:
    // this.cursoService.create(dto).subscribe(() => {
    //   this.closeModal();
    //   this.loadCursos();
    // });

    // SIMULACIÓN:
    const newId = this.cursos.length
      ? Math.max(...this.cursos.map(c => c.id)) + 1
      : 1;

    const nuevoCurso: Curso = {
      id: newId,
      codigo: dto.codigo,
      nombre: dto.nombre,
      esElectiva: dto.esElectiva!,
      // asignamos fechas de ejemplo
      fechaInicio: new Date().toISOString().slice(0, 10),
      fechaFin: new Date().toISOString().slice(0, 10),
      habilitado: true,
      HTI: 0,
      HTC: 0,
      HTE: 0
    };

    this.cursos.push(nuevoCurso);
    this.closeModal();
  }
}
