// src/app/components/cronogramas/cronogramas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { ProgramaAcademico } from '../../dto/programas.dto';
import { PlanEstudio } from '../../dto/plan-estudio.dto';
import { PlanEstudioCursoDTO } from '../../dto/plan-estudio-curso.dto';
import { Curso } from '../../dto/cursos.dto';
import { ProgramaCursoDTO, ProgramaHoraDTO } from '../../dto/programa-curso.dto';

import { ProgramaService } from '../../services/programa.service';
import { PlanEstudioService } from '../../services/plan-estudio.service';
import { PlanEstudioCursoService } from '../../services/plan-estudio-curso.service';
import { CursoService } from '../../services/curso.service';
import { ProgramaCursoService } from '../../services/programa-curso.service';

import { DocenteService } from '../../services/docente.service';
import { Docente } from '../../dto/docentes.dto';

import { CronogramasService } from '../../services/cronogramas.service';
import { CronogramaGrupoDTO } from '../../dto/cronogramas.dto';

import { HasRoleDirective } from '../../directives/has-role.directive';
import { ROLES } from '../../auth/roles.const';
import { AuthService } from '../../services/auth.service';

import {
  EstadoServidorService,
  EstadoServidorDTO,
} from '../../services/estado-servidor.service';


function unwrapList<T>(res: any): T[] {
  return Array.isArray(res)
    ? res
    : (res?.items ??
      res?.data ??
      res?.results ??
      res?.rows ??
      res?.list ??
      []) as T[];
}

// ==== Tipos para cronograma / grupos (UI) ====

type GrupoDocente = {
  docenteId: number | null;
  horas: number | null;
};

type GrupoCronograma = {
  id?: number;
  nombre: string;
  docentes: GrupoDocente[];
};

type CursoCronogramaUI = {
  assoc: PlanEstudioCursoDTO;
  curso: Curso;
  principalPrograma: ProgramaCursoDTO | null;
  grupos: GrupoCronograma[];
};

type PlanCronograma = PlanEstudio & {
  cursos: CursoCronogramaUI[];
};

type ProgramaCronograma = ProgramaAcademico & {
  expanded: boolean;
  planes: PlanCronograma[];
};

@Component({
  selector: 'app-cronogramas',
  standalone: true,
  imports: [CommonModule, FormsModule, HasRoleDirective],
  templateUrl: './cronogramas.component.html',
  styleUrls: ['./cronogramas.component.scss'],
})
export class CronogramasComponent implements OnInit {
  programas: ProgramaCronograma[] = [];
  loading = false;
  error: string | null = null;

  docentes: Docente[] = [];

  // Modal de cronograma
  cronModalOpen = false;
  cronModalMode: 'pregrado' | 'posgrado' = 'pregrado';

  selectedPrograma: ProgramaCronograma | null = null;
  selectedPlan: PlanCronograma | null = null;
  selectedCurso: CursoCronogramaUI | null = null;

  // copia de trabajo de los grupos (se confirma al guardar)
  editGrupos: GrupoCronograma[] = [];

  effectiveEstado: EstadoServidorDTO | null = null;
  loadingEstadoServidor = false;

  ROLES = ROLES;

  constructor(
    private programaSvc: ProgramaService,
    private planSvc: PlanEstudioService,
    private pecSvc: PlanEstudioCursoService,
    private cursoSvc: CursoService,
    private progCursoSvc: ProgramaCursoService,
    private docenteSvc: DocenteService,
    private cronSvc: CronogramasService,
    private auth: AuthService,
    private estadoServidorSrv: EstadoServidorService
  ) { }

  ngOnInit(): void {
    this.loadEstadoServidor();
    this.loadProgramas();
    this.loadDocentes();
  }

  // =====================================================
  // Carga base
  // =====================================================
  private canManageCronogramas(): boolean {
    const rol = this.auth.getCurrentUser()?.rol;
    return rol === ROLES.SUPERADMIN || rol === ROLES.ADMIN;
  }

  private normalizeEstado(value: string | null | undefined): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private loadEstadoServidor(): void {
    this.loadingEstadoServidor = true;
    this.estadoServidorSrv
      .effective()
      .pipe(finalize(() => (this.loadingEstadoServidor = false)))
      .subscribe({
        next: (row) => {
          this.effectiveEstado = row ?? null;
        },
        error: (err) => {
          console.error('Error cargando estado efectivo del servidor', err);
          this.effectiveEstado = null;
        },
      });
  }

  get estadoServidorActual(): string {
    return this.normalizeEstado(this.effectiveEstado?.estado);
  }

  get isCronogramasEstado(): boolean {
    return this.estadoServidorActual === 'cronogramas';
  }

  get canConfigurarCronograma(): boolean {
    return this.canManageCronogramas() && this.isCronogramasEstado;
  }

  private loadProgramas(): void {
    this.loading = true;
    this.error = null;

    this.programaSvc
      .getAll()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          const list: ProgramaAcademico[] =
            unwrapList<ProgramaAcademico>(res) ?? [];
          this.programas = (list || []).map((p) => ({
            ...p,
            expanded: false,
            planes: [],
          }));
        },
        error: (err) => {
          console.error('Error cargando programas', err);
          this.programas = [];
          this.error = 'No se pudieron cargar los programas académicos.';
        },
      });
  }

  private loadDocentes(): void {
    this.docenteSvc
      .getAll()
      .pipe(
        catchError((e) => {
          console.error('Error cargando docentes', e);
          return of([]);
        })
      )
      .subscribe((res: any) => {
        this.docentes = unwrapList<Docente>(res) ?? [];
      });
  }

  private reloadAfterSave(): void {
    // limpiamos selección y grupos en edición
    this.selectedPrograma = null;
    this.selectedPlan = null;
    this.selectedCurso = null;
    this.editGrupos = [];

    // si quieres que los programas vuelvan colapsados:
    this.programas = [];

    // recargamos todo desde el backend
    this.loadProgramas();
    this.loadDocentes(); // opcional, pero barato
  }


  // =====================================================
  // Expandir programa -> cargar planes y cursos con programa de curso
  // =====================================================

  toggleExpand(p: ProgramaCronograma): void {
    p.expanded = !p.expanded;
    if (!p.expanded) return;
    if (p.planes.length) return; // ya cargados

    this.planSvc.getByPrograma(p.id).subscribe({
      next: (res: any) => {
        const planes: PlanEstudio[] = unwrapList<PlanEstudio>(res) ?? [];

        const activos = planes.filter(
          (plan) =>
            plan.activo &&
            ((plan as any).programaId === p.id ||
              (plan as any).programa_id === p.id ||
              (plan as any).programa?.id === p.id)
        );

        p.planes = activos.map((plan) => ({
          ...plan,
          cursos: [],
        }));

        p.planes.forEach((plan) => this.loadCursosConPrograma(plan));
      },
      error: (err) => {
        console.error('Error cargando planes por programa', err);
        p.planes = [];
      },
    });
  }

  private loadCursosConPrograma(plan: PlanCronograma): void {
    this.pecSvc.getByPlan(plan.id).subscribe({
      next: (resPec: any) => {
        const pecs: PlanEstudioCursoDTO[] =
          unwrapList<PlanEstudioCursoDTO>(resPec) ?? [];

        const ordenadas = [...(pecs || [])].sort(
          (a, b) => (a.orden ?? 0) - (b.orden ?? 0)
        );

        const soloEstePlan = ordenadas.filter((assoc) => {
          const anyAssoc = assoc as any;
          const planId =
            anyAssoc.planId ??
            anyAssoc.plan_id ??
            anyAssoc.plan?.id ??
            null;

          if (planId == null) return true; // si no trae FK explícita, no filtramos
          return planId === plan.id;
        });

        if (!soloEstePlan.length) {
          plan.cursos = [];
          return;
        }

        const calls = soloEstePlan.map((assoc) => {
          const anyAssoc = assoc as any;
          const cursoId =
            anyAssoc.cursoId ??
            anyAssoc.curso_id ??
            anyAssoc.curso?.id ??
            null;

          if (!cursoId) {
            console.warn('PEC sin cursoId válido', assoc);
            return of(null);
          }

          const curso$ = this.cursoSvc
            .getById(cursoId)
            .pipe(catchError(() => of(null as any)));

          const programas$ = this.progCursoSvc.getByPEC(anyAssoc.id).pipe(
            map((resp: any) => unwrapList<ProgramaCursoDTO>(resp) ?? []),
            catchError(() => of([] as ProgramaCursoDTO[]))
          );

          const cronogramas$ = this.cronSvc.getByCurso(cursoId).pipe(
            catchError(() => of([] as CronogramaGrupoDTO[]))
          );

          return forkJoin({
            assoc: of(assoc),
            curso: curso$,
            programas: programas$,
            cronogramas: cronogramas$,
          });
        });

        const validCalls = calls.filter(Boolean) as any[];

        if (!validCalls.length) {
          plan.cursos = [];
          return;
        }

        forkJoin(validCalls).subscribe({
          next: (results: any[]) => {
            const cursos: CursoCronogramaUI[] = [];

            for (const r of results) {
              if (!r || !r.curso) continue;

              const programas: ProgramaCursoDTO[] = r.programas || [];
              const principal = programas[0] ?? null;

              // Solo mostramos los cursos que YA tienen programa de curso asignado
              if (!principal) continue;

              const gruposApi: CronogramaGrupoDTO[] = r.cronogramas || [];

              const grupos: GrupoCronograma[] = gruposApi.map((g) => ({
                id: g.id,
                nombre: g.nombre,
                docentes: (g.docentes || []).map((d) => ({
                  docenteId: d.docenteId ?? null,
                  horas: d.horas ?? null,
                })),
              }));

              cursos.push({
                assoc: r.assoc,
                curso: r.curso,
                principalPrograma: principal,
                grupos,
              });
            }

            plan.cursos = cursos;
          },
          error: (err) => {
            console.error(
              'Error resolviendo cursos con programa de curso / cronogramas',
              err
            );
            plan.cursos = [];
          },
        });
      },
      error: (err) => {
        console.error('Error cargando PEC del plan', err);
        plan.cursos = [];
      },
    });
  }

  // =====================================================
  // Helpers de UI
  // =====================================================

  tipoLabel(p: { tipo?: string | null }): string {
    const t = (p.tipo || '').toLowerCase();
    if (t === 'pregrado') return 'Pregrado';
    if (t === 'posgrado') return 'Posgrado';
    return p.tipo || 'Programa';
  }

  getHoras(pc: ProgramaCursoDTO | null | undefined) {
    if (!pc || !pc.horas || !pc.horas.length) return null;
    const h: ProgramaHoraDTO = pc.horas[0];

    return {
      hPE: (h as any).hSemanalesPE ?? h.h_semanales_p_e ?? 0,
      hTI: (h as any).hSemanalesTI ?? h.h_semanales_t_i ?? 0,
      hAAT: (h as any).hSemanalesAAT ?? h.h_semanales_a_a_t ?? 0,
      hAAP: (h as any).hSemanalesAAP ?? h.h_semanales_a_a_p ?? 0,
      hAATP: (h as any).hSemanalesAATP ?? h.h_semanales_a_a_t_p ?? 0,
      hTotal: (h as any).hTotalesCurso ?? h.h_totales_curso ?? 0,
      creditos:
        (h as any).creditosCurso ??
        h.creditos_curso ??
        pc.creditos ??
        null,
    };
  }

  // =====================================================
  // Configurar cronograma (botón por curso)
  // =====================================================

  openCronogramaConfig(
    programa: ProgramaCronograma,
    plan: PlanCronograma,
    cursoRow: CursoCronogramaUI
  ) {
    if (!this.canConfigurarCronograma) return;
    this.selectedPrograma = programa;
    this.selectedPlan = plan;
    this.selectedCurso = cursoRow;

    const tipo = (programa.tipo || '').toLowerCase();
    this.cronModalMode = tipo === 'posgrado' ? 'posgrado' : 'pregrado';

    // Usamos lo que ya está cargado desde la API, o inicializamos
    if (cursoRow.grupos && cursoRow.grupos.length) {
      this.editGrupos = cursoRow.grupos.map((g) => ({
        ...g,
        docentes: g.docentes.map((d) => ({ ...d })),
      }));
    } else {
      // Inicial: 1 grupo (el usuario puede agregar más en pregrado)
      this.editGrupos = [this.createGrupoBase(1)];
    }

    this.cronModalOpen = true;
  }

  private createGrupoBase(index: number): GrupoCronograma {
    return {
      nombre: `Grupo ${index}`,
      docentes: [{ docenteId: null, horas: null }],
    };
  }

  addGrupo(): void {
    if (!this.canConfigurarCronograma) return;
    const nextIndex = this.editGrupos.length + 1;
    this.editGrupos.push(this.createGrupoBase(nextIndex));
  }

  removeGrupo(i: number): void {
    if (!this.canConfigurarCronograma) return;
    this.editGrupos.splice(i, 1);
  }

  addDocenteToGrupo(g: GrupoCronograma): void {
    if (!this.canConfigurarCronograma) return;
    g.docentes.push({ docenteId: null, horas: null });
  }

  removeDocenteFromGrupo(g: GrupoCronograma, index: number): void {
    if (!this.canConfigurarCronograma) return;
    if (g.docentes.length <= 1) return; // dejamos al menos uno visible
    g.docentes.splice(index, 1);
  }

  closeCronogramaModal(): void {
    this.cronModalOpen = false;
    this.selectedPrograma = null;
    this.selectedPlan = null;
    this.selectedCurso = null;
    this.editGrupos = [];
  }

  saveCronograma(): void {
    if (!this.canConfigurarCronograma) return;
    if (!this.selectedCurso) return;

    // Normalizamos: solo docentes con id y horas > 0
    const gruposLimpios: GrupoCronograma[] = this.editGrupos
      .map((g) => ({
        ...g,
        docentes: g.docentes.filter(
          (d) =>
            d.docenteId != null &&
            d.docenteId > 0 &&
            d.horas != null &&
            d.horas > 0
        ),
      }))
      .filter((g) => g.docentes.length > 0);

    if (!gruposLimpios.length) {
      alert('Debe definir al menos un grupo con al menos un docente y horas.');
      return;
    }

    // Mapeamos a DTO de backend
    const payload: CronogramaGrupoDTO[] = gruposLimpios.map((g) => ({
      id: g.id,
      nombre: g.nombre,
      docentes: g.docentes.map((d) => ({
        docenteId: d.docenteId as number,
        horas: d.horas ?? 0,
      })),
    }));

    const cursoId = this.selectedCurso.curso.id;

    this.cronSvc.replaceForCurso(cursoId, payload).subscribe({
      next: (resp: CronogramaGrupoDTO[]) => {
        // Actualizamos el curso seleccionado con lo que devuelve el backend
        const nuevosGrupos: GrupoCronograma[] = (resp || []).map((g) => ({
          id: g.id,
          nombre: g.nombre,
          docentes: (g.docentes || []).map((d) => ({
            docenteId: d.docenteId ?? null,
            horas: d.horas ?? null,
          })),
        }));

        this.selectedCurso!.grupos = nuevosGrupos;

        this.closeCronogramaModal();

        this.reloadAfterSave();

        alert('Cronograma guardado correctamente.');
      },
      error: (err) => {
        console.error('Error guardando cronograma', err);
        alert('Ocurrió un error al guardar el cronograma.');
      },
    });
  }

  // Muestra el resumen de grupos en la tabla principal
  resumenGrupo(g: GrupoCronograma): string {
    if (!g || !g.docentes || !g.docentes.length) return '';
    const labels: string[] = [];

    for (const d of g.docentes) {
      if (!d.docenteId) continue;

      const doc = this.docentes.find((x) => x.id === d.docenteId);
      const base = this.docenteResumen(doc) || `Docente #${d.docenteId}`;

      const horas = d.horas ?? 0;
      labels.push(`${base} (${horas}h)`);
    }

    return labels.join('<br>');
  }


  /** Texto para mostrar al docente: nombre – vinculación – #documento */
  docenteResumen(doc: Docente | null | undefined): string {
    if (!doc) return '';

    const anyDoc: any = doc;

    const nombre = `${doc.nombres ?? ''} ${doc.apellidos ?? ''}`.trim();

    const vincRaw =
      anyDoc.vinculacion ??
      anyDoc.tipo_vinculacion ??
      anyDoc.vinculo ??
      '';
    const vinc =
      vincRaw && String(vincRaw).trim().length
        ? String(vincRaw).trim()
        : '';

    const docNum =
      anyDoc.documento ??
      anyDoc.num_documento ??
      anyDoc.numero_documento ??
      anyDoc.identificacion ??
      '';

    const partes: string[] = [];
    if (nombre) partes.push(nombre);
    if (vinc) partes.push(vinc);
    if (docNum) partes.push(`${docNum}`);

    return partes.join(' – ');
  }

  downloadExcel(): void {
    if (!this.canManageCronogramas()) return;
    this.cronSvc.downloadExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Cronogramas.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error descargando Excel de cronogramas', err);
        alert('No se pudo descargar el Excel de cronogramas.');
      },
    });
  }


}
