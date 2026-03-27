// src/app/services/programa-curso.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ProgramaCursoDTO,
  CreateProgramaCursoDTO,
  UpdateProgramaCursoDTO,
  ProgramaHoraDTO,
  ProgramaMetodologiaDTO,
  ProgramaEvaluacionDTO,
  ProgramaDocenteRowDTO,
  ProgramaBibliografiaDTO,
} from '../dto/programa-curso.dto';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ProgramaCursoService {
  // 👇 Ahora la base viene del environment
  private readonly base = `${environment.apiBaseUrl}/programas-curso`;

  constructor(private http: HttpClient) { }

  // ---------- helpers ----------
  private pick = (o: any, camel: string, snake: string) =>
    o?.[camel] ?? o?.[snake];

  private normalizeHoras = (hArr: any[] = []): ProgramaHoraDTO[] =>
    hArr.map((h: any) => ({
      id: h.id,
      // llenamos ambas formas por si en algún lado usas snake
      hSemanalesPE: h.hSemanalesPE ?? h.h_semanales_p_e,
      h_semanales_p_e: h.hSemanalesPE ?? h.h_semanales_p_e,

      hSemanalesTI: h.hSemanalesTI ?? h.h_semanales_t_i,
      h_semanales_t_i: h.hSemanalesTI ?? h.h_semanales_t_i,

      hSemanalesAAT: h.hSemanalesAAT ?? h.h_semanales_a_a_t,
      h_semanales_a_a_t: h.hSemanalesAAT ?? h.h_semanales_a_a_t,

      hSemanalesAAP: h.hSemanalesAAP ?? h.h_semanales_a_a_p,
      h_semanales_a_a_p: h.hSemanalesAAP ?? h.h_semanales_a_a_p,

      hSemanalesAATP: h.hSemanalesAATP ?? h.h_semanales_a_a_t_p,
      h_semanales_a_a_t_p: h.hSemanalesAATP ?? h.h_semanales_a_a_t_p,

      hTotalesCurso: h.hTotalesCurso ?? h.h_totales_curso,
      h_totales_curso: h.hTotalesCurso ?? h.h_totales_curso,

      creditosCurso: h.creditosCurso ?? h.creditos_curso,
      creditos_curso: h.creditosCurso ?? h.creditos_curso,
    }));

  private normalize(raw: any): ProgramaCursoDTO {
    return {
      id: raw.id,
      planEstudioCursoId: this.pick(
        raw,
        'planEstudioCursoId',
        'plan_estudio_curso_id'
      ),
      unidadAcademica:
        this.pick(raw, 'unidadAcademica', 'unidad_academica') ?? '',
      nucleoCurso: this.pick(raw, 'nucleoCurso', 'nucleo_curso') ?? null,
      creditos:
        this.pick(raw, 'creditos', 'creditos_curso') ??
        (raw.creditos != null ? Number(raw.creditos) : null),
      vigencia:
        this.pick(raw, 'vigencia', 'semestre_vigencia') ?? raw.vigencia ?? null,

      planCurso: raw.planCurso ?? raw.plan_curso ?? null,
      caracteristicas: raw.caracteristicas ?? null,
      clase: raw.clase ?? null,
      modalidad: raw.modalidad ?? null,

      perfil: raw.perfil ?? null,
      intencionalidadesFormativas:
        this.pick(
          raw,
          'intencionalidadesFormativas',
          'intencionalidades_formativas'
        ) ?? null,
      aportesCursoFormacion:
        this.pick(raw, 'aportesCursoFormacion', 'aportes_curso_formacion') ??
        null,
      descripcionConocimientos:
        this.pick(
          raw,
          'descripcionConocimientos',
          'descripcion_conocimientos'
        ) ?? null,

      horas: this.normalizeHoras(raw.horas ?? raw.horas_curso ?? []),

      metodologias: (() => {
        const base = (raw.metodologia ?? [])[0] ?? {};
        const estrategias = raw.estrategiasMetodologicas ?? [];

        // si no hay nada, devolvemos []
        if (!base && !estrategias.length) return [];

        // si hay estrategias, creamos una fila por estrategia,
        // reutilizando los textos de `metodologia`
        const rows = estrategias.length ? estrategias : [null];

        return rows.map((em: any, idx: number) => ({
          id: em?.id ?? base.id ?? idx,
          estrategia: em?.estrategia ?? null,
          medios_recursos: base.mediosYRecursos ?? null,
          formas_interaccion: base.formasInteraccion ?? null,
          estrategias_internacionalizacion:
            base.estrategiasInternacionalizacion ?? null,
          estrategias_enfoque: base.estrategiasEnfoque ?? null,
        })) as ProgramaMetodologiaDTO[];
      })(),

      evaluaciones: (raw.evaluaciones ?? raw.evaluacion ?? []).map(
        (e: any): ProgramaEvaluacionDTO => ({
          id: e.id,
          momentosEvaluacion: e.momentosEvaluacion ?? e.momentos_evaluacion,
          momentos_evaluacion:
            e.momentos_evaluacion ?? e.momentosEvaluacion ?? '',
          porcentaje: e.porcentaje != null ? Number(e.porcentaje) : null,
        })
      ),

      docentes: (raw.docentes ?? raw.programas_docente ?? []).map(
        (pd: any): ProgramaDocenteRowDTO => ({
          id: pd.id,
          porcentaje: String(pd.porcentaje ?? '0'),
          docente: pd.docente ?? null,
        })
      ),

      // 🔹 Bibliografía avanzada
      bibliografia: (raw.bibliografia ?? []).map((b: any) => ({
        id: b.id,
        cultura: b.cultura ?? null,
        referencia: b.referencia ?? '',
        palabras_clave: b.palabrasClave ?? b.palabras_clave ?? null,
      })),
    };
  }

  /** Listar por id_plan_estudio_curso (PEC) */
  getByPEC(
    pecId: number
  ): Observable<{ items: ProgramaCursoDTO[]; total: number }> {
    const params = new HttpParams().set('plan_estudio_curso_id', String(pecId));
    return this.http
      .get<{ items: any[]; total: number }>(this.base, { params })
      .pipe(
        map(({ items, total }) => ({
          items: (items ?? []).map(this.normalize.bind(this)),
          total,
        }))
      );
  }

  getById(id: number): Observable<ProgramaCursoDTO> {
    return this.http
      .get<any>(`${this.base}/${id}`)
      .pipe(map((raw) => this.normalize(raw)));
  }

  create(dto: CreateProgramaCursoDTO): Observable<ProgramaCursoDTO> {
    return this.http
      .post<any>(this.base, dto)
      .pipe(map((raw) => this.normalize(raw)));
  }

  update(
    id: number,
    dto: UpdateProgramaCursoDTO
  ): Observable<ProgramaCursoDTO> {
    return this.http
      .patch<any>(`${this.base}/${id}`, dto)
      .pipe(map((raw) => this.normalize(raw)));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // src/app/services/programa-curso.service.ts
  // src/app/services/programa-curso.service.ts
  downloadDocx(id: number): Observable<Blob> {
    const url = `${this.base}/${id}/docx`;

    return this.http.post(url, {}, {
      responseType: 'blob',   // <- esto hace que el tipo devuelto sea Observable<Blob>
    });
  }



  /** Detalles avanzados */
  upsertAvanzado(
    id: number,
    payload: {
      perfil?: string | null;
      intencionalidades_formativas?: string | null;
      aportes_curso_formacion?: string | null;
      descripcion_conocimientos?: string | null;
      estrategias?: number[];
      medios_recursos?: string | null;
      formas_interaccion?: string | null;
      estrategias_internacionalizacion?: string | null;
      estrategias_enfoque?: string | null;
      evaluacion?: Array<{ momentos_evaluacion: string; porcentaje: number }>;
    }
  ): Observable<ProgramaCursoDTO> {
    return this.http
      .post<any>(`${this.base}/${id}/avanzado`, payload)
      .pipe(map((raw) => this.normalize(raw)));
  }
}
