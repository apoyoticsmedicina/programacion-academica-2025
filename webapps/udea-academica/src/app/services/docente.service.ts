// src/app/services/docente.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Docente,
  CreateDocenteDTO,
  UpdateDocenteDTO,
} from '../dto/docentes.dto';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class DocenteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/docentes`;

  /** GET /docentes */
  getAll(): Observable<Docente[]> {
    return this.http.get<Docente[]>(this.base);
  }

  /** GET /docentes/:id */
  getById(id: number): Observable<Docente> {
    return this.http.get<Docente>(`${this.base}/${id}`);
  }

  /** POST /docentes */
  create(payload: CreateDocenteDTO): Observable<Docente> {
    return this.http.post<Docente>(this.base, payload);
  }

  /** PATCH /docentes/:id */
  update(id: number, payload: UpdateDocenteDTO): Observable<Docente> {
    return this.http.patch<Docente>(`${this.base}/${id}`, payload);
  }

  /** DELETE /docentes/:id */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
