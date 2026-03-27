import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { finalize, catchError, map, switchMap, tap } from 'rxjs/operators';

import { Curso, CreateCursoDTO } from '../../dto/cursos.dto';
import { CursoService } from '../../services/curso.service';

import { ProgramaAcademico } from '../../dto/programas.dto';
import { ProgramaService } from '../../services/programa.service';

import { PlanEstudio } from '../../dto/plan-estudio.dto';
import { PlanEstudioService } from '../../services/plan-estudio.service';
import { ProgramaDocenteService } from '../../services/programa-docente.service';
import { PlanEstudioCursoDTO } from '../../dto/plan-estudio-curso.dto';
import { PlanEstudioCursoService } from '../../services/plan-estudio-curso.service';

import {
  ProgramaCursoDTO,
  CreateProgramaCursoDTO,
} from '../../dto/programa-curso.dto';
import { ProgramaCursoService } from '../../services/programa-curso.service';

import {
  CatalogosService,
  TipoCursoItem,
  CaracteristicaItem,
  ClaseCursoItem,
  ModalidadCursoItem,
  EstrategiaDidacticaItem,
} from '../../services/catalogos.service';

import { HorasCursoService } from '../../services/horas-curso.service';
import { ProgramaCursoRequisitoService } from '../../services/programa-curso-requisito.service';
import { CreateProgramaCursoRequisitoDTO } from '../../dto/programa-curso-requisito.dto';

import { DocenteService } from '../../services/docente.service';
import { Docente } from '../../dto/docentes.dto';
import { CreateProgramaDocenteDTO } from '../../dto/programa-docente.dto';
import { TitleCaseAllPipe } from '../../shared/pipes/title-case-all.pipe';

import { HasRoleDirective } from '../../directives/has-role.directive';
import { ROLES } from '../../auth/roles.const';
import { AuthService } from '../../services/auth.service';

function unwrapList<T>(res: any): T[] {
  return Array.isArray(res)
    ? res
    : res?.items ?? res?.data ?? res?.results ?? res?.rows ?? res?.list ?? [];
}

function getPlanIdFromPEC(pec: any): number | null {
  if (!pec) return null;
  return pec.planId ?? pec.plan_id ?? (pec.plan && pec.plan.id) ?? null;
}

// ====== Tipos auxiliares ======
type ProgramaCursoView = ProgramaCursoDTO & {
  plan?: PlanEstudio;
  programa?: ProgramaAcademico | null;
  cohorte?: {
    id: number;
    periodo: string;
    fecha_inicio: string;
    fecha_fin: string;
  } | null;
  horas?: any[];
  metodologias?: any[];
  evaluaciones?: any[];
  perfil?: string | null;
  intencionalidadesFormativas?: string | null;
  aportesCursoFormacion?: string | null;
  descripcionConocimientos?: string | null;
  docentes?: any[];
  requisitos?: any[];
};

type EvalRow = { momentos_evaluacion: string; porcentaje: number };

type BiblioRow = {
  cultura: string;
  bibliografia: string; // nombre en UI
  palabras_clave: string;
};

type ComunidadRow = {
  docente_id: string | null;
  nombre: string;
  unidad_academica: string;
  porcentaje: number;
  fromBackend?: boolean;
};

type SlotEstado = {
  open: boolean;
  loading: boolean;
  items: ProgramaCursoView[];
  error?: string;
};

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TitleCaseAllPipe,
    HasRoleDirective,
  ],
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss'],
})
export class CursosComponent implements OnInit {
  // ===== Datos base =====
  cursos: Curso[] = [];
  programas: ProgramaAcademico[] = [];
  planes: PlanEstudio[] = [];

  // Panel “Programas asignados” por curso
  programasPorCurso: Record<number, SlotEstado> = {};

  // ===== Modales (crear/vincular) =====
  showModal = false;
  showLink = false;

  // ===== Pantallas internas =====
  showProgScreen = false; // Asignar programa
  showAvanzadoScreen = false; // Detalles avanzados

  // ===== Formularios =====
  form: FormGroup;
  linkForm: FormGroup;
  progForm: FormGroup;
  avanzadoForm: FormGroup;

  filteredCursos: Curso[] = [];

  // búsqueda
  qCursos = '';

  trackByCursoId = (_: number, c: Curso) => c.id;

  // ===== Estado de pantalla ProgramaCurso =====
  progCurso_ctx = {
    cursoId: null as number | null,
    planesDePrograma: [] as PlanEstudio[],
    cursosDelPlan: [] as Curso[],
    pecEncontrado: null as PlanEstudioCursoDTO | null,

    // flags
    loadingPlanes: false,
    loadingPEC: false,
    pecCheckDone: false,

    // catálogos
    carList: [] as CaracteristicaItem[],
    claseList: [] as ClaseCursoItem[],
    modalidadList: [] as ModalidadCursoItem[],

    // UI
    claseLocked: false,
    vigenciaText: '—',
    semestresVigencia: [] as string[],
  };

  private existingPcId: number | null = null;

  // ===== Estado de pantalla Avanzado =====
  avanzado_ctx = {
    pcId: null as number | null,
    estrategias: [] as EstrategiaDidacticaItem[],
    estrategiasSeleccionadas: [] as number[], // selección múltiple
    evalRows: [] as EvalRow[],
    biblioRows: [] as BiblioRow[],
    comunidadRows: [] as ComunidadRow[],
    docentes: [] as Docente[],
  };

  // Catálogo: Tipos de curso (para el modal de vinculación PEC)
  tipoCursoList: TipoCursoItem[] = [];

  ROLES = ROLES;

  constructor(
    private fb: FormBuilder,
    private cursoService: CursoService,
    private programaService: ProgramaService,
    private planService: PlanEstudioService,
    private pecService: PlanEstudioCursoService,
    private programaCursoSvc: ProgramaCursoService,
    private catalogosSvc: CatalogosService,
    private horasSvc: HorasCursoService,
    private reqSvc: ProgramaCursoRequisitoService,
    private docenteSvc: DocenteService,
    private programaDocenteSvc: ProgramaDocenteService,
    private auth: AuthService
  ) {
    // === Crear curso ===
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
    });

    // === Vincular PEC (usa tipo_curso_id) ===
    this.linkForm = this.fb.group({
      curso_id: [null, Validators.required],
      plan_estudio_id: [null, Validators.required],
      tipo_curso_id: [null, Validators.required],
      nivel: [null, Validators.required],
    });

    this.linkForm.get('plan_estudio_id')?.valueChanges.subscribe(() => {
      // al cambiar plan, limpiar nivel porque cambia el rango permitido
      this.linkForm.patchValue({ nivel: null }, { emitEvent: false });
    });

    // === Asignar Programa + Detalles + Requisitos ===
    // ✅ IMPORTANTE: se agrega programaId (se usa en patchValue) para evitar errores
    this.progForm = this.fb.group({
      cursoId: [null, Validators.required],
      planEstudioId: [null, Validators.required],
      id_plan_estudio_curso: [null, Validators.required],

      programaId: [null], // <-- solo para compatibilidad (no cambia nombres de variables)

      unidad_academica: ['Medicina', Validators.required],
      id_caracteristicas: [null, Validators.required],
      id_clase_curso: [{ value: null, disabled: false }, Validators.required],
      id_modalidad_curso: [null, Validators.required],
      nucleo_curso: [''],

      numero_semanas: [16, [Validators.required, Validators.min(1)]],

      h_semanales_p_e: [0, [Validators.required, Validators.min(0)]],
      h_semanales_t_i: [0, [Validators.required, Validators.min(0)]],
      h_semanales_a_a_t: [0, [Validators.required, Validators.min(0)]],
      h_semanales_a_a_p: [0, [Validators.required, Validators.min(0)]],
      h_semanales_a_a_t_p: [0, [Validators.required, Validators.min(0)]],
      h_totales_curso: [{ value: 0, disabled: true }],
      creditos_curso: [0, [Validators.min(0)]],

      semestre_vigencia: [null],

      sin_prerrequisitos: [true],
      prerequisitos: [[] as number[]],

      sin_corequisitos: [true],
      correquisitos: [[] as number[]],
    });

    // ===== formulario avanzado =====
    this.avanzadoForm = this.fb.group({
      perfil: [null],
      intencionalidades_formativas: [null],
      aportes_curso_formacion: [null],
      descripcion_conocimientos: [null],
      estrategia_didactica_id: [null], // queda por compatibilidad
      medios_recursos: [null],
      formas_interaccion: [null],
      estrategias_internacionalizacion: [null],
      estrategias_enfoque: [null],
    });

    // recalcular totales
    this.progForm.valueChanges.subscribe(() => this.recalcTotalHoras());
  }

  private canManageCursos(): boolean {
    const rol = this.auth.getCurrentUser()?.rol;
    return rol === ROLES.SUPERADMIN || rol === ROLES.ADMIN;
  }

  private getSelectedPlan(): any | null {
    const planId = Number(this.linkForm.value.plan_estudio_id ?? 0);
    if (!planId) return null;
    return this.planes.find((p) => p.id === planId) ?? null;
  }

  /** Lee numero de niveles soportando camel/snake */
  getMaxNivelesSeleccionado(): number | null {
    const plan: any = this.getSelectedPlan();
    if (!plan) return null;

    const raw =
      plan.niveles ??
      plan.numeroNiveles ??
      plan.numero_niveles ??
      plan.numNiveles ??
      plan.num_niveles ??
      null;

    const n = raw != null ? Number(raw) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  /** Construye opciones 1..N */
  getNivelOptions(): number[] {
    const max = this.getMaxNivelesSeleccionado();
    if (!max) return [];
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  get maxNivelesSeleccionado(): number | null {
    return this.getMaxNivelesSeleccionado();
  }

  get nivelOptions(): number[] {
    return this.getNivelOptions();
  }

  // ====== INIT ======
  ngOnInit() {
    this.loadCursos();
    this.loadProgramas();
    this.loadPlanes();
    this.loadCatalogosBase();
    this.loadDocentes();
    this.showModal = false;
    this.showLink = false;
    this.showProgScreen = false;
    this.showAvanzadoScreen = false;
  }

  // ====== Cargas base ======
  private loadCatalogosBase() {
    this.catalogosSvc.getCaracteristicas().subscribe({
      next: (list) => (this.progCurso_ctx.carList = list ?? []),
      error: (e) => console.error(e),
    });

    this.catalogosSvc.getModalidadesCurso().subscribe({
      next: (list) => (this.progCurso_ctx.modalidadList = list ?? []),
      error: (e) => console.error(e),
    });

    this.catalogosSvc.getClasesCurso().subscribe({
      next: (list) => (this.progCurso_ctx.claseList = list ?? []),
      error: (e) => {
        console.error(e);
        this.progCurso_ctx.claseList = [];
      },
    });

    this.loadTiposCurso();

    if (this.catalogosSvc.getEstrategiasDidacticas) {
      this.catalogosSvc.getEstrategiasDidacticas().subscribe({
        next: (list) => (this.avanzado_ctx.estrategias = list ?? []),
        error: (e) => console.error(e),
      });
    }
  }

  /** Recarga el panel “Programas asignados” para un curso y lo deja abierto. */
  private reloadProgramasForCurso(
    cursoId: number,
    afterLoad?: () => void
  ): void {
    const slot =
      this.programasPorCurso[cursoId] ??
      (this.programasPorCurso[cursoId] = {
        open: true,
        loading: false,
        items: [],
      });

    slot.open = true;
    slot.loading = true;
    slot.error = undefined;
    slot.items = [];

    const planesActivos = (this.planes || []).filter((p) => p.activo);
    if (!planesActivos.length) {
      slot.loading = false;
      if (afterLoad) afterLoad();
      return;
    }

    let pendientesPlanes = planesActivos.length;
    let pendientesProgramas = 0;
    let finalizado = false;

    const tryFinish = () => {
      if (finalizado) return;
      if (pendientesPlanes <= 0 && pendientesProgramas <= 0) {
        finalizado = true;
        slot.loading = false;
        if (afterLoad) afterLoad();
      }
    };

    for (const plan of planesActivos) {
      this.pecService.getByPlan(plan.id).subscribe({
        next: (res: any) => {
          const pecs = unwrapList<PlanEstudioCursoDTO>(res) ?? [];

          // solo PEC realmente de este plan
          const pecsDeEstePlan = pecs.filter(
            (pec: any) => getPlanIdFromPEC(pec) === plan.id
          );

          // y además del curso indicado
          const pecDelCurso = pecsDeEstePlan.filter(
            (x: any) =>
              x.cursoId === cursoId ||
              x.curso_id === cursoId ||
              x.curso?.id === cursoId
          );
          if (!pecDelCurso.length) return;

          for (const pec of pecDelCurso as any[]) {
            pendientesProgramas++;
            this.programaCursoSvc.getByPEC(pec.id).subscribe({
              next: (resp: any) => {
                const items = unwrapList<ProgramaCursoDTO>(resp) ?? [];

                const enriched: ProgramaCursoView[] = items.map((it) => {
                  const pcView: ProgramaCursoView = {
                    ...it,
                    plan,
                    programa: plan.programa || null,
                    cohorte: (plan as any).cohorte || null,
                  };

                  // cargar requisitos
                  if (pcView.id) {
                    this.reqSvc.list(pcView.id).subscribe({
                      next: (resReq: any) => {
                        pcView.requisitos = unwrapList<any>(resReq) ?? [];
                      },
                      error: (err: unknown) => {
                        console.error(
                          'Error cargando requisitos del programa de curso',
                          err
                        );
                      },
                    });
                  }

                  return pcView;
                });

                slot.items = [...slot.items, ...enriched];
              },
              error: (e: unknown) => {
                console.error(e);
                slot.error = 'No se pudo cargar algún programa.';
              },
              complete: () => {
                pendientesProgramas--;
                tryFinish();
              },
            });
          }
        },
        error: (e: unknown) => {
          console.error(e);
          slot.error = 'No se pudo cargar la información.';
        },
        complete: () => {
          pendientesPlanes--;
          tryFinish();
        },
      });
    }
  }

  private upsertHoras(pcId: number, detDto: any) {
    return this.horasSvc.list(pcId).pipe(
      switchMap((rows) => {
        const first = Array.isArray(rows) && rows.length ? rows[0] : null;
        if (first?.id) {
          return this.horasSvc.update(first.id, detDto);
        }
        return this.horasSvc.create(pcId, detDto);
      }),
      catchError((e) => {
        console.error('No se pudieron guardar horas:', e);
        return of(null);
      })
    );
  }

  private replaceRequisitos(
    pcId: number,
    rows: CreateProgramaCursoRequisitoDTO[]
  ) {
    // 1) listar existentes
    return this.reqSvc.list(pcId).pipe(
      switchMap((exist) => {
        const actuales = Array.isArray(exist) ? exist : [];

        // 2) borrar existentes (por PK compuesta)
        const deletes$ = actuales.map((r: any) => {
          const payload: CreateProgramaCursoRequisitoDTO = {
            curso_id: Number(
              r.cursoId ?? r.curso_id ?? r.curso?.id ?? r.id_curso ?? 0
            ),
            requisito_curso_id: Number(
              r.requisitoCursoId ??
              r.requisito_curso_id ??
              r.requisito?.id ??
              r.id_requisito_curso ??
              0
            ),
            tipo: (r.tipo ?? '').toString().toLowerCase() as any,
          };

          // si por alguna razón vino incompleto, no intentamos borrar
          if (!payload.curso_id || !payload.requisito_curso_id || !payload.tipo) {
            return of(null);
          }

          return this.reqSvc.remove(pcId, payload).pipe(catchError(() => of(null)));
        });

        const doDeletes$ = deletes$.length ? forkJoin(deletes$) : of([]);

        // 3) insertar la selección nueva
        return doDeletes$.pipe(
          switchMap(() => {
            if (!rows.length) return of({ inserted: 0, items: [] } as any);
            return this.reqSvc.bulk(pcId, rows).pipe(
              catchError((e) => {
                console.error('No se pudieron guardar requisitos:', e);
                return of({ inserted: 0, items: [] } as any);
              })
            );
          })
        );
      }),
      catchError((e) => {
        console.error('No se pudieron sincronizar requisitos:', e);
        return of(null);
      })
    );
  }


  private prefillAvanzadoFromProgramaCurso(pc: ProgramaCursoView) {
    const anyPc: any = pc;

    // Campos de texto principales
    this.avanzadoForm.patchValue(
      {
        perfil: anyPc.perfil ?? '',
        intencionalidades_formativas:
          anyPc.intencionalidadesFormativas ??
          anyPc.intencionalidades_formativas ??
          '',
        aportes_curso_formacion:
          anyPc.aportesCursoFormacion ?? anyPc.aportes_curso_formacion ?? '',
        descripcion_conocimientos:
          anyPc.descripcionConocimientos ??
          anyPc.descripcion_conocimientos ??
          '',
        medios_recursos:
          (anyPc.metodologias &&
            anyPc.metodologias[0] &&
            anyPc.metodologias[0].medios_recursos) ||
          '',
        formas_interaccion:
          (anyPc.metodologias &&
            anyPc.metodologias[0] &&
            anyPc.metodologias[0].formas_interaccion) ||
          '',
        estrategias_internacionalizacion:
          (anyPc.metodologias &&
            anyPc.metodologias[0] &&
            anyPc.metodologias[0].estrategias_internacionalizacion) ||
          '',
        estrategias_enfoque:
          (anyPc.metodologias &&
            anyPc.metodologias[0] &&
            anyPc.metodologias[0].estrategias_enfoque) ||
          '',
        estrategia_didactica_id: null,
      },
      { emitEvent: false }
    );

    // Estrategias seleccionadas (checkboxes)
    const estrategiasIds = new Set<number>();
    const metodologias: any[] = anyPc.metodologias ?? [];
    for (const m of metodologias) {
      const e = m.estrategia || m;
      const eid = e?.id ?? m.estrategiaId ?? m.estrategia_id ?? null;
      if (eid) estrategiasIds.add(Number(eid));
    }
    this.avanzado_ctx.estrategiasSeleccionadas = Array.from(estrategiasIds);

    // Evaluaciones
    const evals: any[] = anyPc.evaluaciones ?? [];
    this.avanzado_ctx.evalRows = evals.map((e) => ({
      momentos_evaluacion: String(
        e.momentosEvaluacion ?? e.momentos_evaluacion ?? ''
      ),
      porcentaje: Number(e.porcentaje ?? 0),
    }));

    // Bibliografía
    const biblio: any[] = anyPc.bibliografia ?? [];
    this.avanzado_ctx.biblioRows = biblio.map((b) => ({
      cultura: String(b.cultura ?? ''),
      bibliografia: String(b.referencia ?? b.bibliografia ?? ''),
      palabras_clave: String(b.palabras_clave ?? ''),
    }));

    // Comunidad académica
    const comunidad: any[] = anyPc.docentes ?? [];
    this.avanzado_ctx.comunidadRows = comunidad.map((pd: any): ComunidadRow => {
      const doc = pd.docente ?? {};
      const docenteIdRaw =
        doc.id ??
        pd.docenteId ??
        pd.docente_id ??
        pd.id_docente ?? // por si el backend usa id_docente
        null;

      return {
        docente_id: docenteIdRaw != null ? String(docenteIdRaw) : null,
        nombre: [doc.nombres, doc.apellidos].filter(Boolean).join(' '),
        unidad_academica: String(doc.unidad_academica ?? doc.dependencia ?? ''),
        porcentaje: Number(pd.porcentaje ?? 0),
        fromBackend: !!(doc.unidad_academica ?? doc.dependencia),
      };
    });
  }

  private loadDocentes() {
    this.docenteSvc
      .getAll()
      .pipe(finalize(() => { }))
      .subscribe({
        next: (docs) => {
          this.avanzado_ctx.docentes = unwrapList<Docente>(docs) ?? [];
        },
        error: (e) => {
          console.error(e);
          this.avanzado_ctx.docentes = [];
        },
      });
  }

  private loadCursos() {
    this.cursoService.getAll().subscribe({
      next: (res: any) => {
        this.cursos = unwrapList<Curso>(res) ?? [];
        for (const c of this.cursos) {
          if (!this.programasPorCurso[c.id]) {
            this.programasPorCurso[c.id] = {
              open: false,
              loading: false,
              items: [],
            };
          }
        }
        this.applyCursosFilter(true);
      },
      error: (e: unknown) => {
        console.error(e);
        this.cursos = [];
      },
    });
  }

  private loadProgramas() {
    this.programaService.getAll().subscribe({
      next: (res: any) =>
        (this.programas = unwrapList<ProgramaAcademico>(res) ?? []),
      error: (e: unknown) => {
        console.error(e);
        this.programas = [];
      },
    });
  }

  private loadPlanes() {
    this.planService.getAll().subscribe({
      next: (res: any) => (this.planes = unwrapList<PlanEstudio>(res) ?? []),
      error: (e: unknown) => {
        console.error(e);
        this.planes = [];
      },
    });
  }

  private loadTiposCurso() {
    this.catalogosSvc.getTiposCurso().subscribe({
      next: (list) => (this.tipoCursoList = list ?? []),
      error: (e) => console.error(e),
    });
  }

  // ====== Crear Curso ======
  openModal() {
    if (!this.canManageCursos()) return;
    this.showModal = true;
    this.form.reset({ codigo: '', nombre: '' });
  }
  closeModal() {
    this.showModal = false;
  }

  submit() {
    if (!this.canManageCursos()) return;
    if (this.form.invalid) return;
    const dto: CreateCursoDTO = this.form.value;
    this.cursoService.create(dto).subscribe({
      next: (newCurso: Curso) => {
        this.cursos.push(newCurso);
        this.programasPorCurso[newCurso.id] = {
          open: false,
          loading: false,
          items: [],
        };
        this.applyCursosFilter(true);
        this.closeModal();
      },
      error: (e: unknown) => console.error('Error al crear curso:', e),
    });
  }

  // ====== Vincular Curso ↔ Plan (PEC) ======
  openLinkModal() {
    if (!this.canManageCursos()) return;
    this.showLink = true;
    this.linkForm.reset({
      curso_id: null,
      plan_estudio_id: null,
      tipo_curso_id: null,
      nivel: null,
    });
  }
  closeLinkModal() {
    this.showLink = false;
  }

  submitLink() {
    if (!this.canManageCursos()) return;
    if (this.linkForm.invalid) return;

    const cursoId = Number(this.linkForm.value.curso_id);
    const planId = Number(this.linkForm.value.plan_estudio_id);
    const tipoCursoId = Number(this.linkForm.value.tipo_curso_id);
    const nivel = Number(this.linkForm.value.nivel);

    if (!cursoId || !planId || !tipoCursoId || !nivel) return;

    const max = this.getMaxNivelesSeleccionado();
    if (!max) {
      alert('El plan seleccionado no tiene número de niveles configurado.');
      return;
    }
    if (nivel < 1 || nivel > max) {
      alert(`El nivel debe estar entre 1 y ${max}.`);
      return;
    }

    const payload: any = {
      curso_id: cursoId,
      plan_estudio_id: planId,
      tipo_curso_id: tipoCursoId,
      nivel,
    };

    this.pecService.create(payload).subscribe({
      next: () => {
        this.closeLinkModal();
        alert('Curso vinculado al plan exitosamente.');
      },
      error: (err: unknown) => {
        console.error('Error al vincular curso:', err);
        alert('No se pudo vincular el curso al plan.');
      },
    });
  }

  // ====== Pantalla: Asignar Programa ======
  openProgScreen(curso: Curso) {
    if (!this.canManageCursos()) return;
    this.showProgScreen = true;

    this.progCurso_ctx.cursoId = curso.id;
    this.progCurso_ctx.planesDePrograma = [];
    this.progCurso_ctx.cursosDelPlan = [];
    this.progCurso_ctx.pecEncontrado = null;
    this.progCurso_ctx.pecCheckDone = false;
    this.progCurso_ctx.vigenciaText = '—';
    this.progCurso_ctx.semestresVigencia = [];
    this.setClaseLocked(false);
    this.existingPcId = null;
    this.progForm.reset({
      cursoId: curso.id,
      planEstudioId: null,
      id_plan_estudio_curso: null,
      programaId: null,

      unidad_academica: 'Medicina',
      id_caracteristicas: null,
      id_clase_curso: null,
      id_modalidad_curso: null,
      nucleo_curso: '',
      numero_semanas: 16,
      h_semanales_p_e: 0,
      h_semanales_t_i: 0,
      h_semanales_a_a_t: 0,
      h_semanales_a_a_p: 0,
      h_semanales_a_a_t_p: 0,
      h_totales_curso: 0,
      creditos_curso: 0,
      semestre_vigencia: null,
      sin_prerrequisitos: true,
      prerequisitos: [],
      sin_corequisitos: true,
      correquisitos: [],
    });

    this.setRequisitoEnabled('pre', false);
    this.setRequisitoEnabled('co', false);

    // Planes donde aparece el curso, para el combo
    this.loadPlanesDeCurso(curso.id);

    // precargar, si existe, el ProgramaCurso desde backend
    this.loadExistingProgramaForCurso(curso.id);

    // mantener el panel "Programas asignados" en memoria
    this.reloadProgramasForCurso(curso.id);
  }

  closeProgScreen() {
    this.showProgScreen = false;
  }

  onPlanSelected(rawPlanId: any) {
    const planId = rawPlanId != null ? Number(rawPlanId) : null;

    this.progCurso_ctx.pecEncontrado = null;
    this.progCurso_ctx.pecCheckDone = false;
    this.progCurso_ctx.cursosDelPlan = [];
    this.progCurso_ctx.vigenciaText = this.computeVigencia(planId);
    this.progCurso_ctx.semestresVigencia = this.computeSemestres(planId);
    this.setClaseLocked(false);

    // limpiamos lista de clases mientras cambia el plan
    this.progCurso_ctx.claseList = [];

    // cargar clases filtradas por plan (con fallback al global si falla)
    if (planId) {
      this.catalogosSvc.getClasesByPlan(planId).subscribe({
        next: (list) => (this.progCurso_ctx.claseList = list ?? []),
        error: (e) => {
          console.error('Error getClasesByPlan, usando todas las clases:', e);
          this.catalogosSvc.getClasesCurso().subscribe({
            next: (listAll) => (this.progCurso_ctx.claseList = listAll ?? []),
            error: (e2) => {
              console.error('Error getClasesCurso', e2);
              this.progCurso_ctx.claseList = [];
            },
          });
        },
      });
    }

    // derivamos el programa desde el plan seleccionado
    let programaId: number | null = null;
    if (planId) {
      const plan = this.planes.find((p) => p.id === planId);
      if (plan) {
        const anyPlan: any = plan;
        programaId =
          anyPlan.programaId ?? anyPlan.programa_id ?? anyPlan.programa?.id ?? null;
      }
    }

    this.progForm.patchValue({
      programaId,
      id_clase_curso: null,
      semestre_vigencia: this.progCurso_ctx.semestresVigencia[0] ?? null,
    });

    if (!planId || !this.progCurso_ctx.cursoId) return;

    this.progCurso_ctx.loadingPEC = true;

    const cursoActualId = this.progCurso_ctx.cursoId;

    this.pecService.getByPlan(planId).subscribe({
      next: (res: any) => {
        const pecs = unwrapList<PlanEstudioCursoDTO>(res) ?? [];

        // filtramos PEC realmente asociados a este plan
        const pecsDePlan = pecs.filter(
          (pec: any) => getPlanIdFromPEC(pec) === planId
        );

        // PEC del curso actual
        const pecCursoActual =
          pecsDePlan.find(
            (p: any) =>
              p.cursoId === cursoActualId ||
              p.curso_id === cursoActualId ||
              p.curso?.id === cursoActualId
          ) ?? null;

        this.progCurso_ctx.pecEncontrado = pecCursoActual;
        this.progCurso_ctx.pecCheckDone = true;

        if (pecCursoActual) {
          const anyPec: any = pecCursoActual;
          const pecId = anyPec.id ?? anyPec.id_plan_estudio_curso ?? null;

          this.progForm.patchValue({
            id_plan_estudio_curso: pecId,
          });

          // si ya existe un ProgramaCurso para ese PEC, precargamos los campos
          if (pecId) {
            this.programaCursoSvc.getByPEC(pecId).subscribe({
              next: (resp: any) => {
                const list = unwrapList<ProgramaCursoDTO>(resp) ?? [];
                if (!list.length) {
                  this.existingPcId = null;
                  return;
                }

                // Por ahora tomamos el primero (si hubiera varios por vigencia)
                const pc = list[0] as any;

                this.existingPcId = Number(pc.id) || null;
                this.prefillProgFormFromProgramaCurso(pc, planId);
              },
              error: (e: unknown) => {
                console.error('Error cargando programa existente', e);
              },
            });
          }
        } else {
          this.progForm.patchValue({
            id_plan_estudio_curso: null,
          });
        }

        // Si no hay PEC del curso actual, no hay prerequisitos/correquisitos
        if (!pecCursoActual) {
          this.progCurso_ctx.cursosDelPlan = [];
          return;
        }

        // Construimos lista de otros cursos del mismo plan
        const cursosDelPlan: Curso[] = [];

        for (const pec of pecsDePlan) {
          const anyPec: any = pec;

          const idCurso =
            anyPec.cursoId ?? anyPec.curso_id ?? anyPec.curso?.id ?? null;

          if (!idCurso || idCurso === cursoActualId) continue;

          const curso = this.cursos.find((c) => c.id === idCurso);
          if (!curso) continue;

          if (!cursosDelPlan.some((c) => c.id === curso.id)) {
            cursosDelPlan.push(curso);
          }
        }

        this.progCurso_ctx.cursosDelPlan = cursosDelPlan;
      },
      error: (e: unknown) => {
        console.error('Error getByPlan en onPlanSelected', e);
        this.progCurso_ctx.cursosDelPlan = [];
        this.progCurso_ctx.pecEncontrado = null;
        this.progCurso_ctx.pecCheckDone = true;
      },
      complete: () => {
        this.progCurso_ctx.loadingPEC = false;
      },
    });
  }

  private loadPlanesDeCurso(cursoId: number) {
    this.progCurso_ctx.loadingPlanes = true;
    this.progCurso_ctx.planesDePrograma = [];

    const planesActivos = (this.planes || []).filter((p) => p.activo);
    if (!planesActivos.length) {
      this.progCurso_ctx.loadingPlanes = false;
      return;
    }

    let pendientes = planesActivos.length;

    for (const plan of planesActivos) {
      this.pecService.getByPlan(plan.id).subscribe({
        next: (res: any) => {
          const pecs = unwrapList<PlanEstudioCursoDTO>(res) ?? [];

          // nos quedamos solo con los PEC que realmente son de ESTE plan
          const pecsDeEstePlan = pecs.filter(
            (pec: any) => getPlanIdFromPEC(pec) === plan.id
          );

          // ¿alguno de esos PEC tiene el curso actual?
          const tieneCurso = pecsDeEstePlan.some(
            (x: any) =>
              x.cursoId === cursoId ||
              x.curso_id === cursoId ||
              x.curso?.id === cursoId
          );

          if (tieneCurso) {
            this.progCurso_ctx.planesDePrograma.push(plan);
          }
        },
        error: (e: unknown) => {
          console.error(e);
        },
        complete: () => {
          pendientes--;
          if (pendientes <= 0) {
            this.progCurso_ctx.loadingPlanes = false;
          }
        },
      });
    }
  }

  private setClaseLocked(lock: boolean) {
    this.progCurso_ctx.claseLocked = lock;
    const ctrl = this.progForm.get('id_clase_curso');
    if (lock) ctrl?.disable();
    else ctrl?.enable();
  }

  private setRequisitoEnabled(kind: 'pre' | 'co', enabled: boolean) {
    const box = kind === 'pre' ? 'prerequisitos' : 'correquisitos';
    const flag = kind === 'pre' ? 'sin_prerrequisitos' : 'sin_corequisitos';

    this.progForm.get(flag)?.setValue(!enabled, { emitEvent: false });

    if (!enabled) {
      this.progForm.get(box)?.setValue([], { emitEvent: false });
    }
  }

  toggleNoTiene(kind: 'pre' | 'co') {
    const flag = kind === 'pre' ? 'sin_prerrequisitos' : 'sin_corequisitos';
    const enabled = !this.progForm.get(flag)?.value;
    this.setRequisitoEnabled(kind, enabled);
  }

  isReqChecked(kind: 'pre' | 'co', id: number): boolean {
    const key = kind === 'pre' ? 'prerequisitos' : 'correquisitos';
    const arr: number[] = this.progForm.get(key)?.value ?? [];
    return arr.includes(id);
  }

  onReqToggle(kind: 'pre' | 'co', id: number, checked: boolean) {
    const key = kind === 'pre' ? 'prerequisitos' : 'correquisitos';
    const ctrl = this.progForm.get(key);
    const arr: number[] = [...(ctrl?.value ?? [])];

    if (checked) {
      if (!arr.includes(id)) arr.push(id);
    } else {
      const i = arr.indexOf(id);
      if (i > -1) arr.splice(i, 1);
    }
    ctrl?.setValue(arr);
  }

  private recalcTotalHoras() {
    const v = this.progForm.value;

    const semanas = Number(v.numero_semanas || 0);

    const hSemana =
      Number(v.h_semanales_p_e || 0) +
      Number(v.h_semanales_t_i || 0) +
      Number(v.h_semanales_a_a_t || 0) +
      Number(v.h_semanales_a_a_p || 0) +
      Number(v.h_semanales_a_a_t_p || 0);

    // Horas totales del curso (semestrales)
    const total = hSemana * (isNaN(semanas) ? 0 : semanas);

    this.progForm.get('h_totales_curso')?.setValue(total, { emitEvent: false });

    // Créditos = horas totales / 48
    const creditos = total > 0 ? Number((total / 48).toFixed(2)) : 0;

    this.progForm.get('creditos_curso')?.setValue(creditos, {
      emitEvent: false,
    });
  }

  private computeVigencia(planId: number | null): string {
    if (!planId) return '—';
    const plan = this.planes.find((p) => p.id === planId);
    const ch: any = plan && (plan as any).cohorte;
    if (!ch) return '—';
    const ini = ch.fecha_inicio ?? ch.fechaInicio ?? '';
    const fin = ch.fecha_fin ?? ch.fechaFin ?? '';
    return `${ch.periodo ?? '—'} (${ini} → ${fin})`;
  }

  private computeSemestres(planId: number | null): string[] {
    if (!planId) return [];
    const plan = this.planes.find((p) => p.id === planId);
    const ch: any = plan && (plan as any).cohorte;
    if (!ch?.periodo) return [];
    const periodo: string = ch.periodo;
    const [ini, fin] = periodo.split('/');
    if (!ini || !fin) return [periodo];

    const res: string[] = [];
    const [yStartStr, sStartStr] = ini.split('-');
    const [yEndStr, sEndStr] = fin.split('-');
    let yStart = Number(yStartStr);
    let sStart = Number(sStartStr);
    const yEnd = Number(yEndStr);
    const sEnd = Number(sEndStr);

    while (yStart < yEnd || (yStart === yEnd && sStart <= sEnd)) {
      res.push(`${yStart}-${sStart}`);
      if (sStart === 1) {
        sStart = 2;
      } else {
        sStart = 1;
        yStart += 1;
      }
    }

    return res;
  }

  // ====== Guardar Programa ======
  submitProg() {
    if (!this.canManageCursos()) return;
    if (this.progForm.invalid || !this.progCurso_ctx.pecEncontrado) return;

    const v = this.progForm.getRawValue();

    const basePayload: CreateProgramaCursoDTO = {
      id_plan_estudio_curso: v.id_plan_estudio_curso,
      unidad_academica: v.unidad_academica,
      id_caracteristicas: v.id_caracteristicas,
      id_clase_curso: v.id_clase_curso,
      id_modalidad_curso: v.id_modalidad_curso,
      nucleo_curso: v.nucleo_curso || null,
      creditos: v.creditos_curso != null ? Number(v.creditos_curso) : null,
      vigencia: v.semestre_vigencia || null,
    };

    const req$ = this.existingPcId
      ? this.programaCursoSvc.update(this.existingPcId, basePayload as any)
      : this.programaCursoSvc.create(basePayload);

    req$.subscribe({
      next: (saved: any) => {
        const pcId = this.existingPcId ?? saved.id;
        this.existingPcId = pcId;

        // ================== HORAS ==================
        const detDto = {
          h_semanales_p_e: Number(v.h_semanales_p_e || 0),
          h_semanales_t_i: Number(v.h_semanales_t_i || 0),
          h_semanales_a_a_t: Number(v.h_semanales_a_a_t || 0),
          h_semanales_a_a_p: Number(v.h_semanales_a_a_p || 0),
          h_semanales_a_a_t_p: Number(v.h_semanales_a_a_t_p || 0),
          h_totales_curso: Number(v.h_totales_curso || 0),
          creditos_curso: Number(v.creditos_curso || 0),
        };

        // ✅ Upsert horas (update si ya existe, create si no)
        this.upsertHoras(pcId, detDto).subscribe();

        // ================== REQUISITOS ==================
        const pre: number[] = this.progForm.get('prerequisitos')?.value ?? [];
        const co: number[] = this.progForm.get('correquisitos')?.value ?? [];
        const cursoPrincipalId = this.progCurso_ctx.cursoId!;
        const rows: CreateProgramaCursoRequisitoDTO[] = [];

        if (!this.progForm.get('sin_prerrequisitos')?.value) {
          for (const reqId of pre) {
            rows.push({
              curso_id: cursoPrincipalId,
              requisito_curso_id: Number(reqId),
              tipo: 'prerrequisito',
            });
          }
        }

        if (!this.progForm.get('sin_corequisitos')?.value) {
          for (const reqId of co) {
            rows.push({
              curso_id: cursoPrincipalId,
              requisito_curso_id: Number(reqId),
              tipo: 'correquisito',
            });
          }
        }

        // ✅ Replace requisitos (borra los existentes y deja exactamente los nuevos)
        this.replaceRequisitos(pcId, rows).subscribe();

        // ================== UI / REFRESH ==================
        const cursoId = this.progCurso_ctx.cursoId;
        if (cursoId) {
          this.reloadProgramasForCurso(cursoId);
        }

        alert('Programa asignado al curso.');
        this.closeProgScreen();
      },
      error: (err: unknown) => {
        console.error(err);
        alert('No se pudo asignar el programa.');
      },
    });
  }


  // ====== Panel “Programas asignados” ======
  toggleProgramas(cursoId: number, forceReload = false) {
    const slot =
      this.programasPorCurso[cursoId] ??
      (this.programasPorCurso[cursoId] = {
        open: false,
        loading: false,
        items: [],
      });

    slot.open = !slot.open;
    if (!slot.open) return;

    if (slot.items.length && !forceReload) return;

    this.reloadProgramasForCurso(cursoId);
  }

  // ====== Pantalla “Detalles avanzados” ======
  openAvanzadoScreen(cursoId: number | null = null) {
    if (!this.canManageCursos()) return;
    if (!cursoId || cursoId <= 0) {
      alert('Primero debes asignar el programa al curso.');
      return;
    }

    // Guardamos curso actual para poder recargar luego el panel
    this.progCurso_ctx.cursoId = cursoId;

    const abrirConPrograma = () => {
      const pc = this.getProgramaCursoPreview(cursoId);
      if (!pc || !pc.id) {
        alert('Este curso aún no tiene programa asignado.');
        return;
      }

      this.showAvanzadoScreen = true;
      this.avanzado_ctx.pcId = pc.id;
      this.avanzado_ctx.evalRows = [];
      this.avanzado_ctx.biblioRows = [];
      this.avanzado_ctx.comunidadRows = [];
      this.avanzado_ctx.estrategiasSeleccionadas = [];

      this.avanzadoForm.reset({
        perfil: null,
        intencionalidades_formativas: null,
        aportes_curso_formacion: null,
        descripcion_conocimientos: null,
        estrategia_didactica_id: null,
        medios_recursos: null,
        formas_interaccion: null,
        estrategias_internacionalizacion: null,
        estrategias_enfoque: null,
      });

      // Precargamos desde el ProgramaCurso existente
      this.prefillAvanzadoFromProgramaCurso(pc);
    };

    const slot = this.programasPorCurso[cursoId];
    if (slot && slot.items && slot.items.length) {
      abrirConPrograma();
    } else {
      this.reloadProgramasForCurso(cursoId, abrirConPrograma);
    }
  }

  closeAvanzadoScreen() {
    this.showAvanzadoScreen = false;
    this.avanzado_ctx.pcId = null;
    this.avanzado_ctx.evalRows = [];
    this.avanzado_ctx.biblioRows = [];
    this.avanzado_ctx.comunidadRows = [];
    this.avanzado_ctx.estrategiasSeleccionadas = [];
  }

  // === EVALUACIÓN ===
  addEvalRow() {
    const nueva: EvalRow = { momentos_evaluacion: '', porcentaje: 0 };
    this.avanzado_ctx.evalRows.push(nueva);
  }

  removeEvalRow(i: number) {
    this.avanzado_ctx.evalRows.splice(i, 1);
  }

  onEvalChange(i: number, field: 'momentos_evaluacion' | 'porcentaje', v: any) {
    const row = this.avanzado_ctx.evalRows[i];
    if (!row) return;

    if (field === 'momentos_evaluacion') {
      row.momentos_evaluacion = String(v ?? '');
    } else {
      const num = Number(v ?? 0);
      row.porcentaje = isNaN(num) ? 0 : num;
    }
  }

  get evalTotalPorcentaje(): number {
    return (this.avanzado_ctx.evalRows || [])
      .filter((r) => (r.momentos_evaluacion ?? '').toString().trim().length > 0)
      .reduce((acc, r) => acc + (Number(r.porcentaje) || 0), 0);
  }

  get evalSumaValida(): boolean {
    const filasConMomento = (this.avanzado_ctx.evalRows || []).filter((r) =>
      (r.momentos_evaluacion ?? '').toString().trim().length > 0
    );
    if (!filasConMomento.length) return true;
    return this.evalTotalPorcentaje === 100;
  }

  // === BIBLIOGRAFÍA ===
  addBiblioRow() {
    this.avanzado_ctx.biblioRows.push({
      cultura: '',
      bibliografia: '',
      palabras_clave: '',
    });
  }

  removeBiblioRow(i: number) {
    this.avanzado_ctx.biblioRows.splice(i, 1);
  }

  onBiblioChange(
    i: number,
    field: 'cultura' | 'bibliografia' | 'palabras_clave',
    v: any
  ) {
    const row = this.avanzado_ctx.biblioRows[i];
    if (!row) return;
    (row as any)[field] = v ?? '';
  }

  // === COMUNIDAD ACADÉMICA ===
  addComunidadRow() {
    this.avanzado_ctx.comunidadRows.push({
      docente_id: null,
      nombre: '',
      unidad_academica: '',
      porcentaje: 0,
      fromBackend: false,
    });
  }

  removeComunidadRow(i: number) {
    this.avanzado_ctx.comunidadRows.splice(i, 1);
  }

  onComunidadDocenteChange(i: number, docenteIdStr: string) {
    const row = this.avanzado_ctx.comunidadRows[i];
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
    const doc = this.avanzado_ctx.docentes.find((d) => d.id === idNum);
    if (doc) {
      row.nombre = `${doc.nombres} ${doc.apellidos}`;

      const unidadBackend =
        (doc as any).unidad_academica || (doc as any).dependencia || '';

      if (unidadBackend) {
        row.unidad_academica = unidadBackend;
        row.fromBackend = true;
      } else {
        row.unidad_academica = '';
        row.fromBackend = false;
      }
    } else {
      row.nombre = '';
      row.unidad_academica = '';
      row.fromBackend = false;
    }
  }

  onComunidadChange(
    i: number,
    field: 'nombre' | 'unidad_academica' | 'porcentaje',
    v: any
  ) {
    const row = this.avanzado_ctx.comunidadRows[i];
    if (!row) return;

    if (field === 'porcentaje') {
      const num = Number(v ?? 0);
      row.porcentaje = isNaN(num) ? 0 : num;
    } else {
      (row as any)[field] = v ?? '';
      if (field === 'unidad_academica') {
        row.fromBackend = false;
      }
    }
  }

  /** Toma las filas de Comunidad y arma la selección de docentes con porcentaje */
  private buildSeleccionDesdeComunidad(): Array<{
    id_docente: number;
    porcentaje: number;
  }> {
    const rows = this.avanzado_ctx.comunidadRows || [];
    const out: Array<{ id_docente: number; porcentaje: number }> = [];
    const seen = new Set<number>();

    for (const r of rows) {
      const id = Number(r.docente_id ?? 0);
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const pct = Number(r.porcentaje ?? 0);
      out.push({ id_docente: id, porcentaje: isNaN(pct) ? 0 : pct });
    }
    return out;
  }

  // === Estrategias didácticas (checklist) ===
  isEstrategiaChecked(id: number): boolean {
    return this.avanzado_ctx.estrategiasSeleccionadas.includes(id);
  }

  onEstrategiaToggle(id: number, checked: boolean) {
    const cur = new Set(this.avanzado_ctx.estrategiasSeleccionadas);
    if (checked) cur.add(id);
    else cur.delete(id);
    this.avanzado_ctx.estrategiasSeleccionadas = Array.from(cur.values());
  }

  // ====== Requisitos (para la vista previa) ======
  private getRequisitosByTipo(
    pc: any,
    tipoBuscado: 'prerrequisito' | 'correquisito'
  ): { codigo: string; nombre: string }[] {
    if (!pc) return [];

    const reqs: any[] =
      pc.requisitos ??
      pc.requisitosCurso ??
      pc.requisitos_curso ??
      pc.requisitos_programa_curso ??
      [];

    if (!Array.isArray(reqs)) return [];

    const tipoLower = tipoBuscado.toLowerCase();

    const filtrados = reqs.filter((r: any) => {
      const tipo = (r.tipo ?? r.tipo_requisito ?? r.type ?? '')
        .toString()
        .toLowerCase();
      return tipo === tipoLower;
    });

    const out: { codigo: string; nombre: string }[] = [];

    for (const r of filtrados) {
      const idReq =
        r.requisitoCursoId ??
        r.requisito_curso_id ??
        r.cursoRequisitoId ??
        r.curso_requisito_id ??
        r.curso_id ??
        r.curso?.id ??
        null;

      if (!idReq) continue;

      const curso = this.cursos.find((c) => c.id === Number(idReq));
      if (!curso) continue;

      out.push({ codigo: curso.codigo, nombre: curso.nombre });
    }

    return out;
  }

  getPrerrequisitosLabel(pc: any): string {
    const lista = this.getRequisitosByTipo(pc, 'prerrequisito');
    if (!lista.length) return 'No tiene';
    return lista.map((c) => `${c.codigo} — ${c.nombre}`).join(', ');
  }

  getCorrequisitosLabel(pc: any): string {
    const lista = this.getRequisitosByTipo(pc, 'correquisito');
    if (!lista.length) return 'No tiene';
    return lista.map((c) => `${c.codigo} — ${c.nombre}`).join(', ');
  }

  // ====== DOCX ======
  downloadProgramaDocx(pcId: number) {
    if (!pcId) {
      alert('No se encontró el programa de curso.');
      return;
    }

    this.programaCursoSvc.downloadDocx(pcId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `programa-curso-${pcId}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error descargando DOCX', err);
        alert('No se pudo descargar el documento.');
      },
    });
  }

  // ====== Helpers de presentación ======
  getProgramaCursoPreview(cursoId: number): ProgramaCursoView | null {
    const slot = this.programasPorCurso[cursoId];
    if (!slot || !slot.items || slot.items.length === 0) return null;

    const sorted = [...slot.items].sort((a, b) => a.id - b.id);
    return sorted[0];
  }

  getProgramasLabel(cursoId: number): string {
    const slot = this.programasPorCurso[cursoId];
    if (!slot || !slot.items || slot.items.length === 0) return '—';

    const nombresSet = new Set<string>();
    for (const pc of slot.items) {
      const nombre = pc.programa?.nombre;
      if (nombre) nombresSet.add(nombre);
    }

    return nombresSet.size ? Array.from(nombresSet).join(', ') : '—';
  }

  getEstrategiaNombre(m: any): string {
    if (!m) return 'Estrategia';

    const e = m.estrategia as any;

    // 1) Si el backend ya envía el objeto completo
    if (e?.nombre || e?.descripcion) {
      return e.nombre || e.descripcion;
    }

    // 2) Si solo tenemos el id, lo buscamos en el catálogo cargado en avanzado_ctx
    const id = e?.id ?? m.estrategiaId ?? m.estrategia_id ?? m.id;

    if (id && this.avanzado_ctx.estrategias?.length) {
      const cat = this.avanzado_ctx.estrategias.find((x) => x.id === id);
      if (cat) {
        return cat.nombre || cat.descripcion || `Estrategia #${id}`;
      }
    }

    // 3) Último recurso
    return id ? `Estrategia #${id}` : 'Estrategia';
  }

  submitAvanzado() {
    if (!this.canManageCursos()) return;
    const pcId = this.avanzado_ctx.pcId;
    if (!pcId) {
      alert('No hay Programa de Curso cargado.');
      return;
    }

    // 1. Estrategias (desde checkboxes)
    const estrategiasIds = [...this.avanzado_ctx.estrategiasSeleccionadas];

    // 2. Evaluación limpia
    const evalLimpia = (this.avanzado_ctx.evalRows || [])
      .filter((r: any) => {
        const txt = r?.momentos_evaluacion;
        return typeof txt === 'string' && txt.trim().length > 0;
      })
      .map((r: any) => ({
        momentos_evaluacion: r.momentos_evaluacion.trim(),
        porcentaje: Number(r.porcentaje) || 0,
      }));

    const totalPct = evalLimpia.reduce(
      (acc: number, r: any) => acc + (Number(r.porcentaje) || 0),
      0
    );

    if (evalLimpia.length && totalPct !== 100) {
      alert(
        `La suma de los porcentajes de evaluación debe ser 100%. ` +
        `Actualmente es ${totalPct}%.`
      );
      return;
    }

    // 3. Bibliografía limpia
    const biblioLimpia = (this.avanzado_ctx.biblioRows || [])
      .filter((b) => {
        const anyFilled =
          (b.cultura ?? '').trim() ||
          (b.bibliografia ?? '').trim() ||
          (b.palabras_clave ?? '').trim();
        return !!anyFilled;
      })
      .map((b) => ({
        cultura: String(b.cultura || ''),
        referencia: String(b.bibliografia || ''),
        palabras_clave: String(b.palabras_clave || ''),
      }));

    // 4. Armamos payload (normalizando strings para evitar null)
    const f = this.avanzadoForm.value;
    const payload = {
      perfil: String(f.perfil || ''),
      intencionalidades_formativas: String(
        f.intencionalidades_formativas || ''
      ),
      aportes_curso_formacion: String(f.aportes_curso_formacion || ''),
      descripcion_conocimientos: String(f.descripcion_conocimientos || ''),

      estrategias: estrategiasIds,
      medios_recursos: String(f.medios_recursos || ''),
      formas_interaccion: String(f.formas_interaccion || ''),
      estrategias_internacionalizacion: String(
        f.estrategias_internacionalizacion || ''
      ),
      estrategias_enfoque: String(f.estrategias_enfoque || ''),

      evaluacion: evalLimpia,
      bibliografia: biblioLimpia,
    };

    // 5. Enviamos
    this.programaCursoSvc.upsertAvanzado(pcId, payload).subscribe({
      next: (res: any) => {
        console.log('Avanzado guardado', res);

        // sincronizar docentes (desde Comunidad)
        const seleccionComunidad = this.buildSeleccionDesdeComunidad();
        this.syncProgramaDocentesFromComunidad(pcId, seleccionComunidad);
      },
      error: (err: any) => {
        console.error('No se pudo guardar avanzado', err);
        alert('No se pudo guardar avanzado');
      },
    });
  }

  /** Sincroniza docentes de Comunidad con /programas-docente */
  private syncProgramaDocentesFromComunidad(
    pcId: number,
    seleccion: Array<{ id_docente: number; porcentaje: number }>
  ) {
    this.programaDocenteSvc.getByProgramaCurso(pcId).subscribe({
      next: (res: any) => {
        const existing = (res?.items ?? []) as any[];

        // Indexar existentes por id_docente
        const mapExistente = new Map<number, any>();
        for (const row of existing) {
          const did = row?.docente?.id ?? row?.docenteId ?? row?.docente_id;
          if (did) mapExistente.set(Number(did), row);
        }

        const incomingIds = new Set(seleccion.map((s) => s.id_docente));

        // 1) Crear/Actualizar
        for (const sel of seleccion) {
          const ya = mapExistente.get(sel.id_docente);
          if (!ya) {
            // CREATE
            this.programaDocenteSvc
              .create({
                id_docente: sel.id_docente,
                id_programa: pcId,
                porcentaje: String(sel.porcentaje ?? 0),
              } as CreateProgramaDocenteDTO)
              .subscribe({
                error: (e) =>
                  console.error('No se pudo crear programa_docente', e),
              });
          } else {
            // UPDATE si cambió el porcentaje
            const actual = Number(ya?.porcentaje ?? 0);
            const nuevo = Number(sel.porcentaje ?? 0);
            if (actual !== nuevo) {
              this.programaDocenteSvc
                .update(ya.id, { porcentaje: String(nuevo) })
                .subscribe({
                  error: (e) =>
                    console.error('No se pudo actualizar porcentaje', e),
                });
            }
          }
        }

        // 2) DELETE los que ya no están en Comunidad
        for (const row of existing) {
          const did = row?.docente?.id ?? row?.docenteId ?? row?.docente_id;
          if (did && !incomingIds.has(Number(did))) {
            this.programaDocenteSvc.delete(row.id).subscribe({
              error: (e) =>
                console.error('No se pudo borrar programa_docente', e),
            });
          }
        }

        alert('Detalles avanzados guardados.');
        this.closeAvanzadoScreen();

        const cursoId = this.progCurso_ctx.cursoId;
        if (cursoId) {
          this.reloadProgramasForCurso(cursoId);
        }
      },
      error: (e) => {
        console.error(e);
        alert(
          'Detalles avanzados guardados, pero no se pudo sincronizar docentes.'
        );
        this.closeAvanzadoScreen();
      },
    });
  }

  private loadExistingProgramaForCurso(cursoId: number) {
    const planesActivos = (this.planes || []).filter((p) => p.activo);
    if (!planesActivos.length) return;

    let encontrado = false;

    for (const plan of planesActivos) {
      this.pecService.getByPlan(plan.id).subscribe({
        next: (res: any) => {
          if (encontrado) return;

          const pecs = unwrapList<PlanEstudioCursoDTO>(res) ?? [];
          const pecsDePlan = pecs.filter(
            (pec: any) => getPlanIdFromPEC(pec) === plan.id
          );

          const pecCursoActual =
            pecsDePlan.find(
              (p: any) =>
                p.cursoId === cursoId ||
                p.curso_id === cursoId ||
                p.curso?.id === cursoId
            ) ?? null;

          if (!pecCursoActual || encontrado) return;

          encontrado = true;

          const anyPec: any = pecCursoActual;
          const pecId = anyPec.id ?? anyPec.id_plan_estudio_curso ?? null;

          // Guardamos contexto del PEC
          this.progCurso_ctx.pecEncontrado = pecCursoActual;
          this.progCurso_ctx.pecCheckDone = true;

          // Texto y semestres de vigencia para ese plan
          this.progCurso_ctx.vigenciaText = this.computeVigencia(plan.id);
          this.progCurso_ctx.semestresVigencia = this.computeSemestres(plan.id);

          // Cargar clases filtradas para ese plan
          this.catalogosSvc.getClasesByPlan(plan.id).subscribe({
            next: (list) => (this.progCurso_ctx.claseList = list ?? []),
            error: (e) => {
              console.error(
                'Error getClasesByPlan en loadExistingProgramaForCurso, usando todas las clases:',
                e
              );
              this.catalogosSvc.getClasesCurso().subscribe({
                next: (listAll) =>
                  (this.progCurso_ctx.claseList = listAll ?? []),
                error: (e2) => {
                  console.error('Error getClasesCurso', e2);
                  this.progCurso_ctx.claseList = [];
                },
              });
            },
          });

          // Construir lista de cursos del plan (para pre/co requisitos)
          const cursosDelPlan: Curso[] = [];
          for (const pec of pecsDePlan) {
            const anyP = pec as any;
            const idCurso =
              anyP.cursoId ?? anyP.curso_id ?? anyP.curso?.id ?? null;

            if (!idCurso || idCurso === cursoId) continue;
            const curso = this.cursos.find((c) => c.id === idCurso);
            if (!curso) continue;

            if (!cursosDelPlan.some((c) => c.id === curso.id)) {
              cursosDelPlan.push(curso);
            }
          }
          this.progCurso_ctx.cursosDelPlan = cursosDelPlan;

          // Parchear campos básicos del form
          this.progForm.patchValue(
            {
              planEstudioId: plan.id,
              id_plan_estudio_curso: pecId,
              semestre_vigencia: this.progCurso_ctx.semestresVigencia[0] ?? null,
            },
            { emitEvent: false }
          );

          // Traer ProgramaCurso y prellenar detalle
          if (pecId) {
            this.programaCursoSvc.getByPEC(pecId).subscribe({
              next: (resp: any) => {
                const list = unwrapList<ProgramaCursoDTO>(resp) ?? [];
                if (!list.length) {
                  this.existingPcId = null;
                  return;
                }

                const pc = list[0] as any;
                this.existingPcId = Number(pc.id) || null;
                this.prefillProgFormFromProgramaCurso(pc, plan.id);
              },
              error: (e: unknown) => {
                console.error('Error cargando programa existente', e);
              },
            });
          }
        },
        error: (e: unknown) => {
          console.error('Error getByPlan en loadExistingProgramaForCurso', e);
        },
      });
    }
  }

  private prefillProgFormFromProgramaCurso(pc: any, planId: number | null) {
    const unidad = pc.unidadAcademica ?? pc.unidad_academica ?? 'Medicina';

    const id_caracteristicas_raw =
      pc.id_caracteristicas ??
      pc.caracteristicas_id ??
      pc.caracteristicas?.id ??
      pc.caracteristica_id ??
      null;

    const id_clase_curso_raw =
      pc.id_clase_curso ?? pc.clase_curso_id ?? pc.clase?.id ?? null;

    const id_modalidad_curso_raw =
      pc.id_modalidad_curso ?? pc.modalidad_curso_id ?? pc.modalidad?.id ?? null;

    const id_caracteristicas =
      id_caracteristicas_raw != null ? Number(id_caracteristicas_raw) : null;
    const id_clase_curso =
      id_clase_curso_raw != null ? Number(id_clase_curso_raw) : null;
    const id_modalidad_curso =
      id_modalidad_curso_raw != null ? Number(id_modalidad_curso_raw) : null;

    const nucleo = pc.nucleoCurso ?? pc.nucleo_curso ?? '';
    const vigencia = pc.vigencia ?? pc.semestre_vigencia ?? null;

    const horas: any[] = pc.horas ?? pc.horasCurso ?? pc.horas_curso ?? [];
    const h0 = horas.length ? horas[0] : null;

    let h_semanales_p_e = 0;
    let h_semanales_t_i = 0;
    let h_semanales_a_a_t = 0;
    let h_semanales_a_a_p = 0;
    let h_semanales_a_a_t_p = 0;
    let h_totales_curso = 0;
    let numero_semanas = 16;

    if (h0) {
      h_semanales_p_e = Number(h0.h_semanales_p_e ?? h0.hSemanalesPE ?? 0);
      h_semanales_t_i = Number(h0.h_semanales_t_i ?? h0.hSemanalesTI ?? 0);
      h_semanales_a_a_t = Number(h0.h_semanales_a_a_t ?? h0.hSemanalesAAT ?? 0);
      h_semanales_a_a_p = Number(h0.h_semanales_a_a_p ?? h0.hSemanalesAAP ?? 0);
      h_semanales_a_a_t_p = Number(
        h0.h_semanales_a_a_t_p ?? h0.hSemanalesAATP ?? 0
      );
      h_totales_curso = Number(h0.h_totales_curso ?? h0.hTotalesCurso ?? 0);

      const sumaSemana =
        h_semanales_p_e +
        h_semanales_t_i +
        h_semanales_a_a_t +
        h_semanales_a_a_p +
        h_semanales_a_a_t_p;

      if (sumaSemana > 0 && h_totales_curso > 0) {
        const weeks = h_totales_curso / sumaSemana;
        if (!isNaN(weeks) && weeks > 0) {
          numero_semanas = Math.round(weeks);
        }
      }
    }

    const reqs: any[] =
      pc.requisitos_programa_curso ??
      pc.requisitos ??
      pc.requisitosCurso ??
      pc.requisitos_curso ??
      [];

    const preIds: number[] = [];
    const coIds: number[] = [];

    for (const r of reqs) {
      const tipo = (r.tipo ?? r.tipo_requisito ?? '').toString().toLowerCase();
      const idReqRaw =
        r.requisitoCursoId ??
        r.requisito_curso_id ??
        r.curso_requisito_id ??
        r.curso_id ??
        r.curso?.id ??
        null;
      if (!idReqRaw) continue;

      const idReq = Number(idReqRaw);

      if (tipo === 'prerrequisito') preIds.push(idReq);
      else if (tipo === 'correquisito') coIds.push(idReq);
    }

    this.progForm.patchValue(
      {
        planEstudioId: planId,
        unidad_academica: unidad,
        id_caracteristicas,
        id_clase_curso,
        id_modalidad_curso,
        nucleo_curso: nucleo,
        semestre_vigencia: vigencia,
        numero_semanas,
        h_semanales_p_e,
        h_semanales_t_i,
        h_semanales_a_a_t,
        h_semanales_a_a_p,
        h_semanales_a_a_t_p,
        h_totales_curso,
        creditos_curso:
          Number(
            pc.creditos ??
            pc.creditos_curso ??
            (h0 ? h0.creditos_curso ?? h0.creditosCurso : 0)
          ) || 0,
        sin_prerrequisitos: preIds.length === 0,
        prerequisitos: preIds,
        sin_corequisitos: coIds.length === 0,
        correquisitos: coIds,
      },
      { emitEvent: false }
    );

    this.setRequisitoEnabled('pre', preIds.length > 0);
    this.setRequisitoEnabled('co', coIds.length > 0);

    this.recalcTotalHoras();
  }

  applyCursosFilter(recalcSource = true) {
    const needle = (this.qCursos || '').toLowerCase().trim();

    const base = recalcSource ? this.cursos : this.filteredCursos;
    const src: Curso[] = Array.isArray(base) ? base : [];

    if (!needle) {
      this.filteredCursos = [...src];
      return;
    }

    this.filteredCursos = src.filter((c) => {
      const haystack = [c.codigo, c.nombre].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(needle);
    });
  }
}
