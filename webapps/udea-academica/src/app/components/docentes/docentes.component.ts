// src/app/components/docentes/docentes.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { DocenteService } from '../../services/docente.service';
import {
  Docente,
  CreateDocenteDTO,
  UpdateDocenteDTO,
  nombreCortoDocente
} from '../../dto/docentes.dto';

// ===== Helper para normalizar respuestas a listas =====
function unwrapList<T>(res: any): T[] {
  return Array.isArray(res)
    ? res
    : (res?.items ?? res?.data ?? res?.results ?? res?.rows ?? res?.list ?? []) as T[];
}

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './docentes.component.html',
  styleUrls: ['./docentes.component.scss'],
})
export class DocentesComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private docenteSvc = inject(DocenteService);

  // listado
  docentes: Docente[] = [];
  filtered: Docente[] = [];

  // búsqueda
  q = '';

  // ui flags
  loading = false;
  saving = false;
  deleting = false;
  modalOpen = false;

  // form modal
  form!: FormGroup;
  editingId: number | null = null;

  // subs
  private subs: Subscription[] = [];

  // ================= NUEVO: catálogos de vinculación / dedicación =================
  vinculaciones: string[] = ['ocacional', 'vinculado', 'adhonorem', 'catedra', 'catedra calendario'];

  // opciones de dedicación que se muestran según la vinculación seleccionada
  dedicacionesDisponibles: string[] = [];

  departamentos: string[] = ['cirugía', 'educación médica', 'farmacología y toxicología', 'fisiología y bioquímica', 'instituto de investigaciones médicas', 'medicina física y rehabilitación', 'medicina interna', 'medicina preventiva y salud publica', 'microbiología y parasitología', 'morfologia', 'obstetricia y ginecoloía', 'patología', 'pediatría y puericultura', 'psiquiatría y ciencias del comportamiento', 'radiología y radioterapia'];

  ngOnInit(): void {
    this.makeForm();
    this.setupVinculacionListener();
    this.load();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private makeForm() {
    this.form = this.fb.group({
      tipo_documento: ['', [Validators.required]],
      documento: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.pattern(/^\d+$/),
        ],
      ],
      nombres: ['', [Validators.required]],
      apellidos: ['', [Validators.required]],
      vinculacion: [''],
      dedicacion: [''],
      departamento: [''],
      unidad_academica: [''],
      correo_institucional: [
        '',
        [
          Validators.pattern(/^[^@\s]+@udea\.edu\.co$/i),
        ],
      ],
      correo_personal: ['', [Validators.email]],

      activo: [true],
    });

    // estado inicial de las dedicaciones (sin vinculación aún)
    this.dedicacionesDisponibles = [];
  }


  private setupVinculacionListener() {
    const ctrl = this.form.get('vinculacion');
    if (!ctrl) return;

    const s = ctrl.valueChanges.subscribe((v) => {
      this.onVinculacionChange(v);
    });
    this.subs.push(s);

    // también aplicamos la lógica inicial por si se abre en modo edición
    this.onVinculacionChange(ctrl.value);
  }

  // decide qué dedicaciones mostrar según la vinculación
  private resolverDedicaciones(vinculacion: string | null | undefined): string[] {
    const v = (vinculacion ?? '').toLowerCase().trim();

    if (v === 'vinculado' || v === 'ocacional') {
      return ['tiempo completo', 'medio tiempo'];
    }
    if (v === 'adhonorem') {
      return ['horas'];
    }
    if (v === 'catedra') {
      return ['horas catedra'];
    }
    if (v === 'catedra calendario') {
      return ['horas catedra'];
    }
    // si no hay vinculación seleccionada o no coincide, no mostramos dedicaciones
    return [];
  }

  private onVinculacionChange(vinculacion: string | null | undefined) {
    const dedicCtrl = this.form.get('dedicacion');
    if (!dedicCtrl) return;

    this.dedicacionesDisponibles = this.resolverDedicaciones(vinculacion);
    const actual = dedicCtrl.value as string | null;

    // si la dedicación actual no es válida para la nueva vinculación, la limpiamos
    if (!actual || !this.dedicacionesDisponibles.includes(actual)) {
      // si solo hay una opción posible, la seleccionamos automáticamente
      if (this.dedicacionesDisponibles.length === 1) {
        dedicCtrl.setValue(this.dedicacionesDisponibles[0]);
      } else {
        dedicCtrl.setValue('');
      }
    }
  }

  // ===== CRUD =====
  load() {
    this.loading = true;
    const s = this.docenteSvc.getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          // Normalizamos para evitar objetos tipo { items: [...] }
          this.docentes = unwrapList<Docente>(res) ?? [];
          this.applyFilter(); // recalcula filtered a partir de docentes
        },
        error: (err) => {
          console.error(err);
          alert('No se pudo cargar la lista de docentes.');
          this.docentes = [];
          this.filtered = [];
        },
      });
    this.subs.push(s);
  }

  openCreate() {
    this.editingId = null;
    this.form.reset({
      tipo_documento: 'CC',
      documento: '',
      nombres: '',
      apellidos: '',
      vinculacion: '',
      dedicacion: '',
      departamento: '',
      unidad_academica: '',
      correo_institucional: '',
      correo_personal: '',
      activo: true,
    });
    // recalculamos dedicaciones al limpiar
    this.onVinculacionChange('');
    this.modalOpen = true;
  }

  openEdit(d: Docente) {
    this.editingId = d.id;
    this.form.reset({
      tipo_documento: d.tipo_documento ?? 'CC',
      documento: d.documento,
      nombres: d.nombres,
      apellidos: d.apellidos,
      vinculacion: d.vinculacion ?? '',
      dedicacion: d.dedicacion ?? '',
      departamento: d.departamento ?? '',
      unidad_academica: (d as any).unidad_academica ?? '', // compat
      correo_institucional: (d as any).correo_institucional ?? '',
      correo_personal: (d as any).correo_personal ?? '',
      activo: d.activo,
    });

    // ajustamos las dedicaciones permitidas según la vinculación actual del docente
    this.onVinculacionChange(d.vinculacion ?? '');
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  save() {
    if (this.form.invalid) return;

    // Cast seguro al nuevo DTO (emails opcionales)
    const payload = this.form.value as CreateDocenteDTO;

    this.saving = true;

    const req$ = this.editingId == null
      ? this.docenteSvc.create(payload)
      : this.docenteSvc.update(this.editingId, payload as UpdateDocenteDTO);

    const s = req$
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.modalOpen = false;
          this.load();
        },
        error: (err) => {
          console.error(err);
          // manejo de conflicto por documento duplicado
          if (err?.status === 409) {
            alert('Ya existe un docente con ese documento.');
          } else {
            alert('No se pudo guardar el docente.');
          }
        },
      });
    this.subs.push(s);
  }

  remove(d: Docente) {
    if (!confirm(`¿Eliminar al docente ${nombreCortoDocente(d)}?`)) return;
    this.deleting = true;
    const s = this.docenteSvc.delete(d.id)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: () => this.load(),
        error: (err) => {
          console.error(err);
          alert('No se pudo eliminar.');
        },
      });
    this.subs.push(s);
  }

  toggleActivo(d: Docente) {
    const updated: UpdateDocenteDTO = { activo: !d.activo };
    const s = this.docenteSvc.update(d.id, updated).subscribe({
      next: () => {
        d.activo = !d.activo;
        this.applyFilter(false); // recalcula desde el filtrado actual
      },
      error: (err) => {
        console.error(err);
        alert('No se pudo cambiar el estado.');
      },
    });
    this.subs.push(s);
  }

  // ===== búsqueda =====
  applyFilter(recalcSource = true) {
    const needle = (this.q || '').toLowerCase().trim();

    // Defensa extra: si por alguna razón el origen no es array, lo forzamos a []
    const base = recalcSource ? this.docentes : this.filtered;
    const src: Docente[] = Array.isArray(base) ? base : [];

    if (!needle) {
      this.filtered = [...src];
      return;
    }

    this.filtered = src.filter((d) => {
      const haystack = [
        d.tipo_documento,
        d.documento,
        d.nombres,
        d.apellidos,
        d.vinculacion,
        d.dedicacion,
        d.departamento,
        d.unidad_academica,
        d.correo_institucional,
        d.correo_personal,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  // helpers
  nombreCorto(d: Docente) {
    return nombreCortoDocente(d);
  }

  trackById = (_: number, d: Docente) => d.id;
}
