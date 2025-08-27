// src/app/services/plan-estudio.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PlanEstudio,
  CreatePlanEstudioDTO,
  UpdatePlanEstudioDTO,
} from '../dto/planes-estudio.dto';

@Injectable({ providedIn: 'root' })
export class PlanEstudioService {
  private baseUrl = 'http://localhost:3000/planes-estudio';

  constructor(private http: HttpClient) {}

  /** Obtiene todos los planes de estudio */
  getAll(): Observable<PlanEstudio[]> {
    return this.http.get<PlanEstudio[]>(this.baseUrl);
  }

  /** Crea un nuevo plan de estudio */
  create(dto: CreatePlanEstudioDTO): Observable<PlanEstudio> {
    return this.http.post<PlanEstudio>(this.baseUrl, dto);
  }

  /** Actualiza un plan (por ejemplo, desactiva uno existente) */
  update(id: number, dto: UpdatePlanEstudioDTO): Observable<PlanEstudio> {
    return this.http.patch<PlanEstudio>(`${this.baseUrl}/${id}`, dto);
  }

  /** Opcional: si lo necesitas, filtrado por programa */
  getByPrograma(programaId: number) {
    return this.http.get<PlanEstudio[]>(
      `${this.baseUrl}?programaId=${programaId}`
    );
  }
}
