// src/app/components/solicitudes-cambio/solicitudes-cambio.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { finalize, switchMap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

import { ROLES } from '../../auth/roles.const';
import { AuthService } from '../../services/auth.service';

import {
  MiContextoService,
  CursoAsignadoDTO,
} from '../../services/mi-contexto.service';

import {
  SolicitudesCambioService,
  SolicitudCambioDTO,
  PropuestaAvanzadoPayload,
} from '../../services/solicitudes-cambio.service';

import { PlanEstudioService } from '../../services/plan-estudio.service';
import { PlanEstudioCursoService } from '../../services/plan-estudio-curso.service';
import { ProgramaCursoService } from '../../services/programa-curso.service';

import { DocenteService } from '../../services/docente.service';
import { Docente } from '../../dto/docentes.dto';

function unwrapList<T>(res: any): T[] {
  return Array.isArray(res)
    ? res
    : res?.items ?? res?.data ?? res?.results ?? res?.rows ?? res?.list ?? [];
}

function getPlanIdFromPEC(pec: any): number | null {
  if (!pec) return null;
  return pec.planId ?? pec.plan_id ?? (pec.plan && pec.plan.id) ?? null;
}

type EvalRow = { momentos_evaluacion: string; porcentaje: number };
type BiblioRow = { cultura: string; referencia: string; palabras_clave: string };
type ComunidadRow = {
  docente_id: string | null;
  nombre: string;
  unidad_academica: string;
  porcentaje: number;
  fromBackend?: boolean;
};

@Component({
  selector: 'app-solicitudes-cambio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './solicitudes-cambio.component.html',
  styleUrls: ['./solicitudes-cambio.component.scss'],
})
export class SolicitudesCambioComponent implements OnInit {
  ROLES = ROLES;

  // ===== Roles / paneles =====
  showCoordPanel = false;
  showAdminPanel = false;

  // ====== Datos (coord) ======
  cursosAsignados: CursoAsignadoDTO[] = [];
  selectedCursoId: number | null = null;
  selectedProgramaCursoId: number | null = null;

  // Snapshot actual (columna izquierda en coordinador)
  snapshotActual: PropuestaAvanzadoPayload | null = null;
  snapshotEval: EvalRow[] = [];
  snapshotBiblio: BiblioRow[] = [];
  snapshotComunidad: ComunidadRow[] = [];

  // Propuesta editable (derecha) -> SIEMPRE inicia vacía
  evalRows: EvalRow[] = [];
  biblioRows: BiblioRow[] = [];
  comunidadRows: ComunidadRow[] = [];
  docentes: Docente[] = [];

  // ====== Solicitudes ======
  misSolicitudes: SolicitudCambioDTO[] = [];
  pendientesAdmin: SolicitudCambioDTO[] = [];

  // ====== UI state ======
  loadingCursos = false;
  loadingMisSolicitudes = false;
  loadingPendientes = false;
  resolvingProgramaCurso = false;
  loadingDocentes = false;
  submitting = false;

  error: string | null = null;
  success: string | null = null;

  // ====== Admin selección / modo ======
  selectedSolicitudAdmin: SolicitudCambioDTO | null = null;
  adminView: 'list' | 'detail' = 'list';

  // ====== Admin: view-model (listas ya mapeadas) ======
  adminActualEval: EvalRow[] = [];
  adminPropEval: EvalRow[] = [];

  adminActualBiblio: BiblioRow[] = [];
  adminPropBiblio: BiblioRow[] = [];

  adminActualComunidad: ComunidadRow[] = [];
  adminPropComunidad: ComunidadRow[] = [];

  // ====== Form (coord: textos+metodología / admin: comentario) ======
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private mi: MiContextoService,
    private solicitudes: SolicitudesCambioService,
    private planSvc: PlanEstudioService,
    private pecSvc: PlanEstudioCursoService,
    private pcSvc: ProgramaCursoService,
    private docenteSvc: DocenteService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      // coord
      motivo: [null],

      // propuesto (vacío por defecto)
      perfil: [null],
      intencionalidades_formativas: [null],
      aportes_curso_formacion: [null],
      descripcion_conocimientos: [null],

      medios_recursos: [null],
      formas_interaccion: [null],
      estrategias_internacionalizacion: [null],
      estrategias_enfoque: [null],

      // admin
      admin_comentario: [null],
    });
  }

  // ============================================================
  // JSON helper (snapshot/propuesta pueden venir string u object)
  // ============================================================
  private parseMaybeJson<T = any>(v: any): T {
    if (!v) return {} as T;
    if (typeof v === 'string') {
      try {
        return JSON.parse(v) as T;
      } catch {
        return {} as T;
      }
    }
    return v as T;
  }

  private normalizeSolicitud(s: SolicitudCambioDTO): SolicitudCambioDTO {
    const snap: any = this.parseMaybeJson((s as any)?.snapshot);
    const prop: any = this.parseMaybeJson((s as any)?.propuesta);

    return {
      ...(s as any),
      snapshot: snap ?? {},
      propuesta: prop ?? {},
    } as any;
  }

  private forceUiTick(): void {
    Promise.resolve().then(() => this.cdr.detectChanges());
  }

  // ============================================================
  // Helpers: “solo cambios” (NO placeholders, NO vacíos)
  // ============================================================
  private normTextChange(v: any): string | undefined {
    if (v === null || v === undefined) return undefined;
    const s = String(v).trim();
    if (!s) return undefined;

    const lower = s.toLowerCase();
    const banned = new Set(['por definir.', 'por definir', 'n/a', 'na', '—', '-']);
    if (banned.has(lower)) return undefined;

    return s;
  }

  private cleanEvalRows(rows: EvalRow[]): EvalRow[] | undefined {
    const clean = (rows || [])
      .map((r) => ({
        momentos_evaluacion: String(r?.momentos_evaluacion ?? '').trim(),
        porcentaje: Number(r?.porcentaje ?? 0) || 0,
      }))
      .filter((r) => r.momentos_evaluacion.length > 0);

    if (!clean.length) return undefined;

    const total = clean.reduce((acc, r) => acc + (Number(r.porcentaje) || 0), 0);
    if (total !== 100) {
      throw new Error(`La suma de evaluación debe ser 100%. Actualmente: ${total}%.`);
    }
    return clean;
  }

  private cleanBiblioRows(
    rows: BiblioRow[]
  ):
    | Array<{
      cultura?: string | null;
      referencia: string;
      palabras_clave?: string | null;
    }>
    | undefined {
    const clean = (rows || [])
      .map((b) => ({
        cultura: String(b?.cultura ?? '').trim(),
        referencia: String(b?.referencia ?? '').trim(),
        palabras_clave: String(b?.palabras_clave ?? '').trim(),
      }))
      .filter((b) => b.referencia.length > 0);

    if (!clean.length) return undefined;

    return clean.map((b) => ({
      cultura: b.cultura ? b.cultura : null,
      referencia: b.referencia,
      palabras_clave: b.palabras_clave ? b.palabras_clave : null,
    }));
  }

  private cleanComunidadRows(
    rows: ComunidadRow[]
  ): Array<{ docente_id: number; unidad_academica?: string | null; porcentaje: number }> | undefined {
    const clean = (rows || [])
      .map((r) => ({
        docente_id: Number(r?.docente_id ?? 0),
        unidad_academica: String(r?.unidad_academica ?? '').trim(),
        porcentaje: Number(r?.porcentaje ?? 0) || 0,
      }))
      .filter((x) => Number.isInteger(x.docente_id) && x.docente_id > 0);

    if (!clean.length) return undefined;

    return clean.map((x) => ({
      docente_id: x.docente_id,
      unidad_academica: x.unidad_academica ? x.unidad_academica : null,
      porcentaje: x.porcentaje,
    }));
  }

  private buildPropuestaOnlyChanges(): any {
    const p: any = {};

    const perfil = this.normTextChange(this.form.value.perfil);
    if (perfil !== undefined) p.perfil = perfil;

    const inten = this.normTextChange(this.form.value.intencionalidades_formativas);
    if (inten !== undefined) p.intencionalidades_formativas = inten;

    const aportes = this.normTextChange(this.form.value.aportes_curso_formacion);
    if (aportes !== undefined) p.aportes_curso_formacion = aportes;

    const desc = this.normTextChange(this.form.value.descripcion_conocimientos);
    if (desc !== undefined) p.descripcion_conocimientos = desc;

    const medios = this.normTextChange(this.form.value.medios_recursos);
    if (medios !== undefined) p.medios_recursos = medios;

    const formas = this.normTextChange(this.form.value.formas_interaccion);
    if (formas !== undefined) p.formas_interaccion = formas;

    const inter = this.normTextChange(this.form.value.estrategias_internacionalizacion);
    if (inter !== undefined) p.estrategias_internacionalizacion = inter;

    const enfoque = this.normTextChange(this.form.value.estrategias_enfoque);
    if (enfoque !== undefined) p.estrategias_enfoque = enfoque;

    const evaluacion = this.cleanEvalRows(this.evalRows);
    if (evaluacion !== undefined) p.evaluacion = evaluacion;

    const bibliografia = this.cleanBiblioRows(this.biblioRows);
    if (bibliografia !== undefined) p.bibliografia = bibliografia;

    const comunidad = this.cleanComunidadRows(this.comunidadRows);
    if (comunidad !== undefined) p.comunidad = comunidad;

    return p;
  }

  private normText(v: any): string | null {
    const s = (v ?? '').toString().trim();
    return s.length ? s : null;
  }

  // ============================================================
  // Helpers robustos de lectura (coordinador)
  // ============================================================
  private mapEvalList(src: any): EvalRow[] {
    const arr = Array.isArray(src) ? src : [];
    return arr.map((r: any) => ({
      momentos_evaluacion: String(r?.momentos_evaluacion ?? r?.momentosEvaluacion ?? ''),
      porcentaje: Number(r?.porcentaje ?? 0),
    }));
  }

  private mapBiblioList(src: any): BiblioRow[] {
    const arr = Array.isArray(src) ? src : [];
    return arr.map((b: any) => ({
      cultura: String(b?.cultura ?? ''),
      referencia: String(b?.referencia ?? b?.bibliografia ?? ''),
      palabras_clave: String(b?.palabras_clave ?? b?.palabrasClave ?? ''),
    }));
  }

  private mapComunidadList(src: any): ComunidadRow[] {
    const arr = Array.isArray(src) ? src : [];
    return arr.map((c: any) => {
      const did = c?.docente_id ?? c?.docenteId ?? null;
      const didNum = did != null ? Number(did) : null;

      const nombreRaw = String(c?.nombre ?? '').trim();
      const nombre = nombreRaw || this.resolveDocenteNombre(didNum);

      return {
        docente_id: did != null ? String(did) : null,
        nombre,
        unidad_academica: String(c?.unidad_academica ?? c?.unidadAcademica ?? ''),
        porcentaje: Number(c?.porcentaje ?? 0),
        fromBackend: true,
      };
    });
  }

  private resolveDocenteNombre(docenteId: number | null): string {
    if (!docenteId) return '';
    const d = this.docentes.find((x) => x.id === docenteId);
    if (d) return `${d.nombres} ${d.apellidos}`.trim();
    return `Docente #${docenteId}`;
  }

  // ============================================================
  // Roles / init
  // ============================================================
  private rol(): string | null {
    return this.auth.getCurrentUser()?.rol ?? null;
  }

  private isCoordOnly(): boolean {
    const r = this.rol();
    return r === ROLES.COORD_CURSO || r === ROLES.COORD_PROGRAMA;
  }

  private isAdminLike(): boolean {
    const r = this.rol();
    return r === ROLES.ADMIN || r === ROLES.SUPERADMIN;
  }

  ngOnInit(): void {
    this.error = null;
    this.success = null;

    this.showAdminPanel = this.isAdminLike();
    this.showCoordPanel = this.isCoordOnly();

    if (this.showAdminPanel || this.showCoordPanel) {
      this.loadDocentes();
    }

    if (this.showCoordPanel) {
      this.loadMisCursos();
      this.loadMisSolicitudes();
    }

    if (this.showAdminPanel) {
      this.loadPendientes();
    }
  }

  // ====== LOADERS ======
  private loadMisCursos(): void {
    this.loadingCursos = true;
    this.mi
      .cursos()
      .pipe(finalize(() => (this.loadingCursos = false)))
      .subscribe({
        next: (rows) => (this.cursosAsignados = rows ?? []),
        error: (e) => {
          console.error(e);
          this.cursosAsignados = [];
          this.error = 'No se pudieron cargar tus cursos asignados.';
        },
      });
  }

  private loadMisSolicitudes(): void {
    this.loadingMisSolicitudes = true;
    this.solicitudes
      .mias()
      .pipe(finalize(() => (this.loadingMisSolicitudes = false)))
      .subscribe({
        next: (rows) => (this.misSolicitudes = rows ?? []),
        error: (e) => {
          console.error(e);
          this.misSolicitudes = [];
          this.error = 'No se pudieron cargar tus solicitudes.';
        },
      });
  }

  private loadPendientes(): void {
    this.loadingPendientes = true;
    this.solicitudes
      .pendientes()
      .pipe(finalize(() => (this.loadingPendientes = false)))
      .subscribe({
        next: (rows: any) => {
          const list = (rows ?? []) as any[];
          this.pendientesAdmin = list.map((s) => ({
            ...s,
            snapshot: this.parseMaybeJson(s.snapshot),
            propuesta: this.parseMaybeJson(s.propuesta),
          })) as any;

          // si estabas en detalle y ya no existe, vuelve a lista
          if (this.adminView === 'detail' && this.selectedSolicitudAdmin) {
            const still = this.pendientesAdmin.find((x) => x.id === this.selectedSolicitudAdmin?.id);
            if (!still) {
              this.adminBackToList();
            } else {
              // refresca el seleccionado con versión normalizada
              this.selectedSolicitudAdmin = still;
            }
          }
        },
        error: (e) => {
          console.error(e);
          this.pendientesAdmin = [];
          this.error = 'No se pudieron cargar las solicitudes pendientes.';
        },
      });
  }

  private loadDocentes(): void {
    this.loadingDocentes = true;
    this.docenteSvc
      .getAll()
      .pipe(finalize(() => (this.loadingDocentes = false)))
      .subscribe({
        next: (res: any) => (this.docentes = unwrapList<Docente>(res) ?? []),
        error: (e) => {
          console.error(e);
          this.docentes = [];
        },
      });
  }

  // ====== Coordinador: seleccionar curso ======
  onSelectCurso(raw: any): void {
    this.error = null;
    this.success = null;

    const cursoId = Number(raw);
    if (!Number.isInteger(cursoId) || cursoId <= 0) {
      this.resetCoordContext();
      return;
    }

    this.selectedCursoId = cursoId;
    this.selectedProgramaCursoId = null;

    this.snapshotActual = null;
    this.snapshotEval = [];
    this.snapshotBiblio = [];
    this.snapshotComunidad = [];

    this.evalRows = [];
    this.biblioRows = [];
    this.comunidadRows = [];

    this.form.patchValue(
      {
        motivo: null,
        perfil: null,
        intencionalidades_formativas: null,
        aportes_curso_formacion: null,
        descripcion_conocimientos: null,
        medios_recursos: null,
        formas_interaccion: null,
        estrategias_internacionalizacion: null,
        estrategias_enfoque: null,
      },
      { emitEvent: false }
    );
    this.form.markAsPristine();

    this.resolveProgramaCursoIdForCurso(cursoId);
  }

  private resetCoordContext(): void {
    this.selectedCursoId = null;
    this.selectedProgramaCursoId = null;

    this.snapshotActual = null;
    this.snapshotEval = [];
    this.snapshotBiblio = [];
    this.snapshotComunidad = [];

    this.evalRows = [];
    this.biblioRows = [];
    this.comunidadRows = [];

    this.form.reset();
  }

  private resolveProgramaCursoIdForCurso(cursoId: number): void {
    this.resolvingProgramaCurso = true;

    this.planSvc
      .getAll()
      .pipe(
        switchMap(async (res: any) => {
          const planes = (unwrapList<any>(res) ?? []).filter((p: any) => !!p?.activo);
          if (!planes.length) return { pcId: null, pc: null };

          for (const plan of planes) {
            try {
              const pecRes = await firstValueFrom(this.pecSvc.getByPlan(plan.id));
              const pecs = unwrapList<any>(pecRes) ?? [];
              const pecsDePlan = pecs.filter((pec: any) => getPlanIdFromPEC(pec) === plan.id);

              const pecCurso =
                pecsDePlan.find(
                  (p: any) => p.cursoId === cursoId || p.curso_id === cursoId || p.curso?.id === cursoId
                ) ?? null;

              if (!pecCurso) continue;

              const pecId = pecCurso.id ?? pecCurso.id_plan_estudio_curso ?? null;
              if (!pecId) continue;

              const pcRes = await firstValueFrom(this.pcSvc.getByPEC(pecId));
              const pcs = unwrapList<any>(pcRes) ?? [];
              if (!pcs.length) continue;

              const pcId = Number(pcs[0].id) || null;
              if (!pcId) continue;

              return { pcId, pc: pcs[0] };
            } catch {
              // continuar
            }
          }

          return { pcId: null, pc: null };
        }),
        finalize(() => (this.resolvingProgramaCurso = false))
      )
      .subscribe({
        next: (r: any) => {
          this.selectedProgramaCursoId = r?.pcId ?? null;

          if (!this.selectedProgramaCursoId) {
            this.error = 'Este curso no tiene un programa de curso asociado (PEC/ProgramaCurso).';
            return;
          }

          this.prefillSnapshotFromProgramaCurso(r.pc);
        },
        error: (e) => {
          console.error(e);
          this.error = 'No se pudo resolver el programa del curso.';
        },
      });
  }

  private prefillSnapshotFromProgramaCurso(pc: any): void {
    const anyPc: any = pc;

    this.snapshotActual = {
      perfil: anyPc.perfil ?? null,
      intencionalidades_formativas:
        anyPc.intencionalidadesFormativas ?? anyPc.intencionalidades_formativas ?? null,
      aportes_curso_formacion: anyPc.aportesCursoFormacion ?? anyPc.aportes_curso_formacion ?? null,
      descripcion_conocimientos: anyPc.descripcionConocimientos ?? anyPc.descripcion_conocimientos ?? null,

      medios_recursos:
        (anyPc.metodologias && anyPc.metodologias[0] && anyPc.metodologias[0].medios_recursos) ?? null,
      formas_interaccion:
        (anyPc.metodologias && anyPc.metodologias[0] && anyPc.metodologias[0].formas_interaccion) ?? null,
      estrategias_internacionalizacion:
        (anyPc.metodologias && anyPc.metodologias[0] && anyPc.metodologias[0].estrategias_internacionalizacion) ?? null,
      estrategias_enfoque:
        (anyPc.metodologias && anyPc.metodologias[0] && anyPc.metodologias[0].estrategias_enfoque) ?? null,
    };

    this.snapshotEval = this.mapEvalList(anyPc.evaluaciones ?? []);
    this.snapshotBiblio = this.mapBiblioList(anyPc.bibliografia ?? []);

    const comunidad: any[] = anyPc.docentes ?? [];
    this.snapshotComunidad = (comunidad || []).map((pd: any): ComunidadRow => {
      const doc = pd.docente ?? {};
      const docenteIdRaw = doc.id ?? pd.docenteId ?? pd.docente_id ?? pd.id_docente ?? null;
      const didNum = docenteIdRaw != null ? Number(docenteIdRaw) : null;

      const nombre = [doc.nombres, doc.apellidos].filter(Boolean).join(' ').trim() || this.resolveDocenteNombre(didNum);

      return {
        docente_id: docenteIdRaw != null ? String(docenteIdRaw) : null,
        nombre,
        unidad_academica: String(doc.unidad_academica ?? doc.dependencia ?? ''),
        porcentaje: Number(pd.porcentaje ?? 0),
        fromBackend: !!(doc.unidad_academica ?? doc.dependencia),
      };
    });
  }

  // ====== Evaluación (propuesta) ======
  addEvalRow(): void {
    this.evalRows.push({ momentos_evaluacion: '', porcentaje: 0 });
  }
  removeEvalRow(i: number): void {
    this.evalRows.splice(i, 1);
  }
  onEvalChange(i: number, field: 'momentos_evaluacion' | 'porcentaje', v: any): void {
    const row = this.evalRows[i];
    if (!row) return;
    if (field === 'momentos_evaluacion') row.momentos_evaluacion = String(v ?? '');
    else row.porcentaje = Number(v ?? 0) || 0;
  }
  get evalTotalPorcentaje(): number {
    return (this.evalRows || [])
      .filter((r) => (r.momentos_evaluacion ?? '').trim().length > 0)
      .reduce((acc, r) => acc + (Number(r.porcentaje) || 0), 0);
  }
  get evalSumaValida(): boolean {
    const filas = (this.evalRows || []).filter((r) => (r.momentos_evaluacion ?? '').trim().length > 0);
    if (!filas.length) return true;
    return this.evalTotalPorcentaje === 100;
  }

  // ====== Bibliografía (propuesta) ======
  addBiblioRow(): void {
    this.biblioRows.push({ cultura: '', referencia: '', palabras_clave: '' });
  }
  removeBiblioRow(i: number): void {
    this.biblioRows.splice(i, 1);
  }
  onBiblioChange(i: number, field: 'cultura' | 'referencia' | 'palabras_clave', v: any): void {
    const row = this.biblioRows[i];
    if (!row) return;
    (row as any)[field] = String(v ?? '');
  }

  // ====== Comunidad (propuesta) ======
  addComunidadRow(): void {
    this.comunidadRows.push({
      docente_id: null,
      nombre: '',
      unidad_academica: '',
      porcentaje: 0,
      fromBackend: false,
    });
  }
  removeComunidadRow(i: number): void {
    this.comunidadRows.splice(i, 1);
  }
  onComunidadDocenteChange(i: number, docenteIdStr: string): void {
    const row = this.comunidadRows[i];
    if (!row) return;

    const docenteId = docenteIdStr || null;
    row.docente_id = docenteId;

    if (!docenteId) {
      row.nombre = '';
      row.unidad_academica = '';
      row.fromBackend = false;
      return;
    }

    const idNum = Number(docenteId);
    const doc = this.docentes.find((d) => d.id === idNum);
    if (doc) {
      row.nombre = `${doc.nombres} ${doc.apellidos}`.trim();
      const unidadBackend = (doc as any).unidad_academica || (doc as any).dependencia || '';
      if (unidadBackend) {
        row.unidad_academica = unidadBackend;
        row.fromBackend = true;
      } else {
        row.unidad_academica = '';
        row.fromBackend = false;
      }
    } else {
      row.nombre = this.resolveDocenteNombre(idNum);
      row.unidad_academica = '';
      row.fromBackend = false;
    }
  }
  onComunidadChange(i: number, field: 'unidad_academica' | 'porcentaje', v: any): void {
    const row = this.comunidadRows[i];
    if (!row) return;

    if (field === 'porcentaje') row.porcentaje = Number(v ?? 0) || 0;
    else {
      row.unidad_academica = String(v ?? '');
      row.fromBackend = false;
    }
  }

  // ====== Coordinador: enviar solicitud ======
  submitSolicitud(): void {
    this.error = null;
    this.success = null;

    if (!this.selectedProgramaCursoId) {
      this.error = 'Selecciona un curso con programa asociado.';
      return;
    }

    try {
      const motivo = this.normTextChange(this.form.value.motivo) ?? null;
      const propuesta = this.buildPropuestaOnlyChanges();

      if (!Object.keys(propuesta).length) {
        this.error = 'No hay cambios propuestos. Completa al menos un campo o agrega filas.';
        return;
      }

      this.submitting = true;
      this.solicitudes
        .crear({
          programaCursoId: this.selectedProgramaCursoId,
          motivo,
          propuesta,
        } as any)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: () => {
            this.success = 'Solicitud enviada correctamente.';
            this.loadMisSolicitudes();

            this.form.patchValue(
              {
                motivo: null,
                perfil: null,
                intencionalidades_formativas: null,
                aportes_curso_formacion: null,
                descripcion_conocimientos: null,
                medios_recursos: null,
                formas_interaccion: null,
                estrategias_internacionalizacion: null,
                estrategias_enfoque: null,
              },
              { emitEvent: false }
            );
            this.evalRows = [];
            this.biblioRows = [];
            this.comunidadRows = [];
            this.form.markAsPristine();
          },
          error: (e) => {
            console.error(e);
            this.error = e?.error?.message || 'No se pudo enviar la solicitud.';
          },
        });
    } catch (err: any) {
      this.error = err?.message || 'Validación falló.';
    }
  }

  // ============================================================
  // Admin: navegación list <-> detail
  // ============================================================
  selectAdminSolicitud(s: SolicitudCambioDTO): void {
    const normalized = this.normalizeSolicitud(s); // ✅ (si usas opción A)
    const snap: any = (normalized as any).snapshot ?? {};
    const prop: any = (normalized as any).propuesta ?? {};

    this.selectedSolicitudAdmin = normalized;

    this.form.patchValue({ admin_comentario: null }, { emitEvent: false });
    this.error = null;
    this.success = null;

    // ✅ NUEVAS referencias (spread) => Angular detecta el cambio inmediatamente
    this.adminActualEval = [...this.mapEvalList(snap.evaluacion)];
    this.adminPropEval = [...this.mapEvalList(prop.evaluacion)];

    this.adminActualBiblio = [...this.mapBiblioList(snap.bibliografia)];
    this.adminPropBiblio = [...this.mapBiblioList(prop.bibliografia)];

    this.adminActualComunidad = [...this.mapComunidadList(snap.comunidad)];
    this.adminPropComunidad = [...this.mapComunidadList(prop.comunidad)];

    this.adminView = 'detail';

    // ✅ fuerza repintado inmediato
    this.forceUiTick();
  }

  adminBackToList(): void {
    this.selectedSolicitudAdmin = null;
    this.form.patchValue({ admin_comentario: null }, { emitEvent: false });
    this.error = null;
    this.success = null;
    this.adminView = 'list';

    this.adminActualEval = [];
    this.adminPropEval = [];
    this.adminActualBiblio = [];
    this.adminPropBiblio = [];
    this.adminActualComunidad = [];
    this.adminPropComunidad = [];

    this.forceUiTick();
  }

  aprobarSeleccionada(): void {
    if (!this.selectedSolicitudAdmin) return;
    const comentario = this.normText(this.form.value.admin_comentario);

    this.submitting = true;
    this.solicitudes
      .aprobar(this.selectedSolicitudAdmin.id, { comentario })
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.success = 'Solicitud aprobada.';
          this.adminBackToList();
          this.loadPendientes();
        },
        error: (e) => {
          console.error(e);
          this.error = e?.error?.message || 'No se pudo aprobar.';
        },
      });
  }

  rechazarSeleccionada(): void {
    if (!this.selectedSolicitudAdmin) return;
    const comentario = this.normText(this.form.value.admin_comentario);

    this.submitting = true;
    this.solicitudes
      .rechazar(this.selectedSolicitudAdmin.id, { comentario })
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.success = 'Solicitud rechazada.';
          this.adminBackToList();
          this.loadPendientes();
        },
        error: (e) => {
          console.error(e);
          this.error = e?.error?.message || 'No se pudo rechazar.';
        },
      });
  }

  // ====== helpers UI ======
  getCursoLabel(c: CursoAsignadoDTO): string {
    const curso = c?.curso;
    if (!curso) return 'Curso';
    return `${curso.codigo} — ${curso.nombre}`;
  }

  getEstadoLabel(s: SolicitudCambioDTO): string {
    switch (s.estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'aprobada':
        return 'Aprobada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return s.estado;
    }
  }

  // ✅ Texto fijo para botones admin
  get adminRejectLabel(): string {
    return this.submitting ? 'Procesando…' : 'Rechazar';
  }

  get adminApproveLabel(): string {
    return this.submitting ? 'Procesando…' : 'Aprobar';
  }
}