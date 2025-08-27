import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  PlanEstudioCurso,
  CreatePlanEstudioCursoDTO,
  UpdatePlanEstudioCursoDTO,
} from '../dto/plan-estudio-curso.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlanEstudioCursoService {
  private baseUrl = 'http://localhost:3000/plan-estudio-cursos';

  constructor(private http: HttpClient) {}

  /** Listar todas las asociaciones */
  getAll(): Observable<PlanEstudioCurso[]> {
    return this.http.get<PlanEstudioCurso[]>(this.baseUrl);
  }

  /** Obtener una asociación específica */
  getByIds(planId: number, cursoId: number): Observable<PlanEstudioCurso> {
    return this.http.get<PlanEstudioCurso>(
      `${this.baseUrl}/${planId}/${cursoId}`
    );
  }

  getByPlan(planEstudioId: number): Observable<PlanEstudioCurso[]> {
    const params = new HttpParams().set('planEstudioId', planEstudioId);
    return this.http.get<PlanEstudioCurso[]>(this.baseUrl, { params });
  }

  /** Crear nueva asociación */
  create(dto: CreatePlanEstudioCursoDTO): Observable<PlanEstudioCurso> {
    return this.http.post<PlanEstudioCurso>(this.baseUrl, dto);
  }

  /** Actualizar asociación existente */
  update(
    planId: number,
    cursoId: number,
    dto: UpdatePlanEstudioCursoDTO
  ): Observable<PlanEstudioCurso> {
    return this.http.patch<PlanEstudioCurso>(
      `${this.baseUrl}/${planId}/${cursoId}`,
      dto
    );
  }

  /** Eliminar asociación */
  delete(planId: number, cursoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${planId}/${cursoId}`);
  }
}
