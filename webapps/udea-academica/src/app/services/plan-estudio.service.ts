// src/app/services/plan-estudio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PlanEstudio } from '../dto/plan-estudio.dto';
import { environment } from '@env/environment';

function unwrapList<T>(res: any): T[] {
  return Array.isArray(res)
    ? res
    : (res?.items ?? res?.data ?? res?.results ?? res?.rows ?? res?.list ?? []);
}

@Injectable({ providedIn: 'root' })
export class PlanEstudioService {
  // 👇 Ahora la base sale del environment
  private readonly API = `${environment.apiBaseUrl}/planes-estudio`;

  constructor(private http: HttpClient) { }

  /** Lista todos los planes */
  getAll(): Observable<PlanEstudio[]> {
    return this.http.get(this.API).pipe(
      map((res: any) => unwrapList<PlanEstudio>(res) ?? [])
    );
  }

  /** Lista planes por programa (puedes filtrar activos en el componente) */
  getByPrograma(programaId: number): Observable<PlanEstudio[]> {
    // El backend espera programa_id como query param
    const url = `${this.API}?programa_id=${encodeURIComponent(
      String(programaId),
    )}`;
    return this.http.get(url).pipe(
      map((res: any) => unwrapList<PlanEstudio>(res) ?? [])
    );
  }

  /**
   * Crea un plan de estudio.
   * Acepta camelCase o snake_case y normaliza a lo que espera el backend:
   * { programa_id, version, id_cohorte }
   */
  create(payload: any): Observable<PlanEstudio> {
    const body = {
      programa_id: payload.programa_id ?? payload.programaId,
      version: payload.version,
      id_cohorte: payload.id_cohorte ?? payload.cohorteId,
      niveles: payload.niveles ?? payload.numeroNiveles ?? payload.numNiveles,
    };
    return this.http.post<PlanEstudio>(this.API, body);
  }

  /**
   * Actualiza parcialmente un plan (por ejemplo { activo: false }).
   * PATCH /planes-estudio/:id
   */
  update(
    id: number,
    data: Partial<PlanEstudio> | { activo?: boolean },
  ): Observable<PlanEstudio> {
    return this.http.patch<PlanEstudio>(`${this.API}/${id}`, data);
  }
}
