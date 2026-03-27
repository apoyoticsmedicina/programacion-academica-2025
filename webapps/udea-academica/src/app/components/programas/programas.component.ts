// src/app/components/programas/programas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ProgramaAcademico, CreateProgramaDTO } from '../../dto/programas.dto';
import { PlanEstudio } from '../../dto/plan-estudio.dto';
import { PlanEstudioCursoDTO } from '../../dto/plan-estudio-curso.dto';
import { Curso } from '../../dto/cursos.dto';
import {
  ProgramaCursoDTO,
  ProgramaHoraDTO,
  ProgramaMetodologiaDTO,
} from '../../dto/programa-curso.dto';
import { ProgramaCursoRequisitoDTO } from '../../dto/programa-curso-requisito.dto';

import { ProgramaService } from '../../services/programa.service';
import { PlanEstudioService } from '../../services/plan-estudio.service';
import { PlanEstudioCursoService } from '../../services/plan-estudio-curso.service';
import { CursoService } from '../../services/curso.service';

// nuevos servicios
import { ProgramaCursoService } from '../../services/programa-curso.service';
import { ProgramaCursoRequisitoService } from '../../services/programa-curso-requisito.service';

import { HasRoleDirective } from '../../directives/has-role.directive';
import { ROLES } from '../../auth/roles.const';
import { AuthService } from '../../services/auth.service';

// ------------------ Helpers / Tipos ------------------
function unwrapList<T>(res: any): T[] {
  return Array.isArray(res)
    ? res
    : res?.items ?? res?.data ?? res?.results ?? res?.rows ?? res?.list ?? [];
}

type RequisitoUI = {
  tipo: 'prerrequisito' | 'correquisito' | string;
  cursoId: number;
  curso?: Curso;
};

type CursoUI = {
  assoc: PlanEstudioCursoDTO;
  expanded: boolean;
  loading: boolean;
  error?: string | null;

  curso?: Curso;
  programasCurso?: ProgramaCursoDTO[];
  requisitos?: RequisitoUI[];

  // programaCurso principal (para mostrar información en el panel)
  principalPrograma?: ProgramaCursoDTO | null;
};

type PlanConCursos = PlanEstudio & {
  cursos: CursoUI[];
};

type ProgramaConPlanes = ProgramaAcademico & {
  expanded: boolean;
  planes: PlanConCursos[];
};

type NivelGroup = { nivel: number | null; cursos: CursoUI[] };


@Component({
  selector: 'app-programas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HasRoleDirective],
  templateUrl: './programas.component.html',
  styleUrls: ['./programas.component.scss'],
})
export class ProgramasComponent implements OnInit {
  ROLES = ROLES;
  programas: ProgramaConPlanes[] = [];
  showModal = false;
  form: FormGroup;

  // cache por PEC.id
  private pecCache: Record<
    number,
    Omit<CursoUI, 'assoc' | 'expanded' | 'loading'>
  > = {};

  constructor(
    private fb: FormBuilder,
    private programaSvc: ProgramaService,
    private planSvc: PlanEstudioService,
    private pecSvc: PlanEstudioCursoService,
    private cursoSvc: CursoService,
    private progCursoSvc: ProgramaCursoService,
    private progReqSvc: ProgramaCursoRequisitoService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      tipo: ['pregrado', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProgramas();
  }

  // ================= Carga de Programas / Planes / PEC =================

  private loadProgramas(): void {
    this.programaSvc.getAll().subscribe({
      next: (res: any) => {
        // backend: { items, total, page, pageSize }
        const list: ProgramaAcademico[] = res?.items ?? [];
        this.programas = (list || []).map((p) => ({
          ...p,
          expanded: false,
          planes: [],
        }));
      },
      error: (err) => {
        console.error('Error cargando programas', err);
        this.programas = [];
      },
    });
  }

  toggleExpand(p: ProgramaConPlanes): void {
    p.expanded = !p.expanded;
    if (!p.expanded || p.planes.length) return;

    this.planSvc.getByPrograma(p.id).subscribe({
      next: (res: any) => {
        const planes: PlanEstudio[] = unwrapList<PlanEstudio>(res);
        const activos = (planes || []).filter(
          (plan) =>
            plan.activo &&
            ((plan as any).programaId === p.id ||
              (plan as any).programa_id === p.id ||
              (plan as any).programa?.id === p.id)
        );

        p.planes = activos.map((plan) => ({ ...plan, cursos: [] }));

        p.planes.forEach((plan) => {
          this.pecSvc.getByPlan(plan.id).subscribe({
            next: (resPec: any) => {
              const pecs: PlanEstudioCursoDTO[] =
                unwrapList<PlanEstudioCursoDTO>(resPec);

              const ordenadas = [...(pecs || [])].sort(
                (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
              );

              // filtrar solo los PEC del plan actual
              const soloEstePlan = ordenadas.filter((assoc) => {
                const anyAssoc = assoc as any;
                const planId =
                  anyAssoc.planId ??
                  anyAssoc.plan_id ??
                  anyAssoc.plan?.id ??
                  null;

                if (planId == null) return true;
                return planId === plan.id;
              });

              plan.cursos = soloEstePlan.map<CursoUI>((assoc) => ({
                assoc,
                expanded: false,
                loading: false,
                error: null,
              }));

              this.preloadPlanCredits(plan);
            },
            error: (e) => {
              console.error('Error cargando PEC del plan', e);
              plan.cursos = [];
            },
          });
        });
      },
      error: (e) => {
        console.error('Error cargando planes por programa', e);
        p.planes = [];
      },
    });
  }

  // ================= Expandir/colapsar cada curso =================

  toggleCourse(plan: PlanConCursos, row: CursoUI): void {
    row.expanded = !row.expanded;
    if (!row.expanded) return;

    const pecId = row.assoc.id;
    if (!pecId) {
      row.error = 'Asociación (PEC) sin id. Verifique datos.';
      return;
    }

    // resolver id del curso de forma robusta
    const cursoId =
      (row.assoc as any).cursoId ??
      (row.assoc as any).curso_id ??
      (row.assoc as any).curso?.id;

    if (!cursoId) {
      console.error('PEC sin cursoId válido', row.assoc);
      row.error = 'No se encontró el curso asociado a este plan.';
      return;
    }

    // si ya está en cache por PEC, usarlo
    const cache = this.pecCache[pecId];
    if (cache) {
      row.curso = cache.curso;
      row.programasCurso = cache.programasCurso;
      row.requisitos = cache.requisitos;
      row.principalPrograma =
        cache.principalPrograma ?? (cache.programasCurso || [])[0] ?? null;
      return;
    }

    row.loading = true;
    row.error = null;

    // 1) curso base
    const curso$ = this.cursoSvc
      .getById(cursoId)
      .pipe(catchError(() => of(undefined as unknown as Curso)));

    // 2) programas de curso asociados a este PEC
    const programas$ = this.progCursoSvc.getByPEC(pecId).pipe(
      map((resp: any) => unwrapList<ProgramaCursoDTO>(resp)),
      catchError(() => of([] as ProgramaCursoDTO[]))
    );

    forkJoin({ curso: curso$, programas: programas$ }).subscribe({
      next: ({ curso, programas }) => {
        row.curso = curso;
        row.programasCurso = programas;
        row.principalPrograma = programas[0] ?? null;

        // si no hay programa de curso, no seguimos cargando detalles
        if (!row.principalPrograma) {
          this.pecCache[pecId] = {
            curso: row.curso,
            programasCurso: [],
            requisitos: [],
            principalPrograma: null,
          };
          row.loading = false;
          return;
        }

        // 3) requisitos
        const reqCalls = programas.map((pc) =>
          this.progReqSvc.list(pc.id).pipe(
            map((res: any) => unwrapList<ProgramaCursoRequisitoDTO>(res)),
            catchError(() => of([] as ProgramaCursoRequisitoDTO[]))
          )
        );

        forkJoin({
          allReqs: reqCalls.length
            ? forkJoin(reqCalls)
            : of<ProgramaCursoRequisitoDTO[][]>([]),
        }).subscribe({
          next: ({ allReqs }) => {
            const requisitos: RequisitoUI[] = (allReqs.flat() || []).map((r) => ({
              tipo: r.tipo,
              cursoId: (r as any).requisito?.id ?? (r as any).requisitoCursoId,
              curso: (r as any).requisito ?? undefined,
            }));

            row.requisitos = requisitos;

            this.pecCache[pecId] = {
              curso: row.curso,
              programasCurso: programas,
              requisitos,
              principalPrograma: row.principalPrograma ?? null,
            };
          },
          error: () => {
            row.error =
              'No se pudo cargar la información completa del programa de curso.';
          },
          complete: () => {
            row.loading = false;
          },
        });
      },
      error: () => {
        row.error = 'No se pudo cargar la información de este curso.';
        row.loading = false;
      },
    });
  }

  // ================= AGRUPAR POR NIVEL =================

  private getNivelFromAssoc(assoc: PlanEstudioCursoDTO): number | null {
    const anyA: any = assoc as any;
    const raw = anyA.nivel ?? anyA.nivel_plan ?? anyA.nivelPlan ?? null;
    const n = raw != null ? Number(raw) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  getCursosPorNivel(plan: PlanConCursos): Array<{ nivel: number; cursos: CursoUI[] }> {
    const mapNiveles = new Map<number, CursoUI[]>();

    for (const cu of plan.cursos || []) {
      const nivel = this.getNivelFromAssoc(cu.assoc) ?? 0; // 0 = Sin nivel
      if (!mapNiveles.has(nivel)) mapNiveles.set(nivel, []);
      mapNiveles.get(nivel)!.push(cu);
    }

    const nivelesOrdenados = Array.from(mapNiveles.keys()).sort((a, b) => {
      if (a === 0) return 1;
      if (b === 0) return -1;
      return a - b;
    });

    return nivelesOrdenados.map((nivel) => ({
      nivel,
      cursos: (mapNiveles.get(nivel) || []).sort(
        (a, b) => (a.assoc.orden ?? 0) - (b.assoc.orden ?? 0)
      ),
    }));
  }

  private getCreditosFromCursoUI(cu: CursoUI): number {
    const pc: any = cu.principalPrograma;
    const assocCurso: any = (cu.assoc as any)?.curso;
    const curso: any = cu.curso;

    const raw =
      pc?.creditos ??
      assocCurso?.creditos ??
      curso?.creditos ??
      0;

    const n = Number(raw ?? 0);
    return Number.isFinite(n) ? n : 0;
  }

  getTotalCreditosNivel(plan: PlanConCursos, nivel: number | null): number {
    const grupos = this.getCursosPorNivel(plan);
    const g = grupos.find((x) => x.nivel === nivel);
    if (!g) return 0;

    return g.cursos.reduce((acc, cu) => acc + this.getCreditosFromCursoUI(cu), 0);
  }

  trackByNivel = (_: number, g: { nivel: number }) => g.nivel;

  trackByCursoUI = (_: number, cu: CursoUI) =>
    (cu.assoc as any)?.id ?? (cu.assoc as any)?.cursoId ?? _;

  // ================= Modal crear programa =================
  private canManageProgramas(): boolean {
    const rol = this.auth.getCurrentUser()?.rol;
    return rol === ROLES.SUPERADMIN || rol === ROLES.ADMIN;
  }

  openModal(): void {
    if (!this.canManageProgramas()) return;
    this.showModal = true;
    this.form.reset({ nombre: '', codigo: '', tipo: 'pregrado' });
  }

  closeModal(): void {
    this.showModal = false;
  }

  submit(): void {
    if (!this.canManageProgramas()) return;
    if (this.form.invalid) return;

    const raw = this.form.value;

    const dto: CreateProgramaDTO = {
      codigo: String(raw.codigo).trim(), // enviar string numérico
      nombre: String(raw.nombre).trim(),
      tipo: raw.tipo,
    };

    this.programaSvc.create(dto).subscribe({
      next: () => {
        this.closeModal();
        this.loadProgramas();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  // ================= Helpers de UI =================

  tipoCursoLabel(assoc: PlanEstudioCursoDTO): string {
    const t = (assoc as any)?.tipo?.tipo?.toLowerCase();
    if (!t) return '—';
    return t === 'electiva' ? 'Electiva' : 'Obligatorio';
  }

  tipoCursoClass(assoc: PlanEstudioCursoDTO): string {
    const t = (assoc as any)?.tipo?.tipo?.toLowerCase();
    return t === 'electiva' ? 'electiva' : 'obligatorio';
  }

  // Horas (normaliza camelCase / snake_case)
  getHoras(pc: ProgramaCursoDTO | null | undefined) {
    if (!pc || !(pc as any).horas || !(pc as any).horas.length) return null;
    const h: ProgramaHoraDTO = (pc as any).horas[0];

    return {
      hPE: (h as any).hSemanalesPE ?? (h as any).h_semanales_p_e ?? 0,
      hTI: (h as any).hSemanalesTI ?? (h as any).h_semanales_t_i ?? 0,
      hAAT: (h as any).hSemanalesAAT ?? (h as any).h_semanales_a_a_t ?? 0,
      hAAP: (h as any).hSemanalesAAP ?? (h as any).h_semanales_a_a_p ?? 0,
      hAATP: (h as any).hSemanalesAATP ?? (h as any).h_semanales_a_a_t_p ?? 0,
      hTotal: (h as any).hTotalesCurso ?? (h as any).h_totales_curso ?? 0,
      creditos: (h as any).creditosCurso ?? (h as any).creditos_curso ?? (pc as any).creditos ?? null,
    };
  }

  // Nombre de estrategia didáctica
  getEstrategiaNombre(m: ProgramaMetodologiaDTO | null | undefined): string {
    if (!m || !(m as any).estrategia) return 'Estrategia didáctica';
    const e = (m as any).estrategia as any;
    return (
      e.nombre ||
      e.descripcion ||
      e.estrategia ||
      (e.id ? `Estrategia #${e.id}` : 'Estrategia didáctica')
    );
  }

  private preloadPlanCredits(plan: PlanConCursos): void {
    if (!plan?.cursos?.length) return;

    const calls = plan.cursos
      .filter((row) => !!row.assoc?.id)
      .map((row) => {
        const pecId = row.assoc.id;

        // Si ya está en cache, hidratar el row y listo
        const cache = this.pecCache[pecId];
        if (cache) {
          row.curso = cache.curso;
          row.programasCurso = cache.programasCurso;
          row.requisitos = cache.requisitos;
          row.principalPrograma =
            cache.principalPrograma ?? (cache.programasCurso || [])[0] ?? null;
          return of(true);
        }

        // Resolver cursoId robusto
        const cursoId =
          (row.assoc as any).cursoId ??
          (row.assoc as any).curso_id ??
          (row.assoc as any).curso?.id;

        // Programas de curso del PEC
        const programas$ = this.progCursoSvc.getByPEC(pecId).pipe(
          map((resp: any) => unwrapList<ProgramaCursoDTO>(resp)),
          catchError(() => of([] as ProgramaCursoDTO[]))
        );

        // Curso base (para créditos si el programa no los trae)
        const curso$ = cursoId
          ? this.cursoSvc
            .getById(cursoId)
            .pipe(catchError(() => of(undefined as unknown as Curso)))
          : of(undefined as unknown as Curso);

        return forkJoin({ programas: programas$, curso: curso$ }).pipe(
          map(({ programas, curso }) => {
            row.programasCurso = programas;
            row.principalPrograma = programas[0] ?? null;
            row.curso = curso;

            // Guardar en cache para que toggleCourse no repita llamadas
            this.pecCache[pecId] = {
              curso: row.curso,
              programasCurso: row.programasCurso,
              requisitos: row.requisitos ?? [],
              principalPrograma: row.principalPrograma ?? null,
            };

            return true;
          }),
          catchError(() => of(false))
        );
      });

    if (!calls.length) return;

    // Ejecuta todo en paralelo (sin bloquear UI)
    forkJoin(calls).subscribe();
  }

}
