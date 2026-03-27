// src/app/services/plan-estudio-curso.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PlanEstudioCursoDTO } from '../dto/plan-estudio-curso.dto';
import { environment } from '@env/environment';

const API = environment.apiBaseUrl;

function unwrapList<T>(res: any): T[] {
  return Array.isArray(res)
    ? res
    : (res?.items ?? res?.data ?? res?.results ?? res?.rows ?? res?.list ?? []);
}

@Injectable({ providedIn: 'root' })
export class PlanEstudioCursoService {
  constructor(private http: HttpClient) { }

  /** Crea la relación Curso ↔ Plan */
  create(input: any): Observable<any> {
    const body = this.toSnake(input);
    return this.http.post(`${API}/plan-estudio-cursos`, body);
  }

  /** Lista PEC por plan */
  getByPlan(planId: number): Observable<PlanEstudioCursoDTO[]> {
    const params = new HttpParams().set('plan_estudio_id', String(planId));
    return this.http
      .get(`${API}/plan-estudio-cursos`, { params })
      .pipe(map((res: any) => unwrapList<PlanEstudioCursoDTO>(res)));
  }

  /** Adaptador camelCase → snake_case */
  private toSnake(d: any) {
    if (!d) return d;

    // si ya viene en snake_case, lo devolvemos tal cual
    if ('plan_estudio_id' in d || 'curso_id' in d || 'tipo_curso_id' in d) {
      // compat: si te llega orden, conviértelo a nivel
      if (d.nivel === undefined && d.orden !== undefined) {
        return { ...d, nivel: d.orden };
      }
      return d;
    }

    const rawNivel = d.nivel ?? d.orden ?? null;
    const nivel =
      rawNivel === null || rawNivel === undefined || String(rawNivel).trim() === ''
        ? null
        : Number(String(rawNivel).trim());

    return {
      plan_estudio_id: Number(d.planEstudioId ?? d.planId),
      curso_id: Number(d.cursoId),
      tipo_curso_id: Number(d.tipoCursoId ?? d.tipo_curso_id), // ✅ este es el real
      nivel: Number.isFinite(nivel as number) ? (nivel as number) : null,
    };
  }
}
