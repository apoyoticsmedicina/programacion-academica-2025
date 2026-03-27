// src/app/services/programa-curso-requisito.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ProgramaCursoRequisitoDTO,
  CreateProgramaCursoRequisitoDTO,
} from '../dto/programa-curso-requisito.dto';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ProgramaCursoRequisitoService {
  private readonly base = `${environment.apiBaseUrl}/programas-curso`;

  constructor(private http: HttpClient) {}

  list(
    programaCursoId: number,
    tipo?: 'prerrequisito' | 'correquisito'
  ): Observable<ProgramaCursoRequisitoDTO[]> {
    const url =
      `${this.base}/${programaCursoId}/requisitos` +
      (tipo ? `?tipo=${encodeURIComponent(tipo)}` : '');
    return this.http.get<ProgramaCursoRequisitoDTO[]>(url);
  }

  /** crea 1 requisito */
  create(
    programaCursoId: number,
    payload: CreateProgramaCursoRequisitoDTO
  ): Observable<ProgramaCursoRequisitoDTO> {
    return this.http.post<ProgramaCursoRequisitoDTO>(
      `${this.base}/${programaCursoId}/requisitos`,
      payload
    );
  }

  /** elimina 1 requisito por PK compuesta en el body */
  remove(
    programaCursoId: number,
    payload: CreateProgramaCursoRequisitoDTO
  ): Observable<void> {
    return this.http.request<void>(
      'DELETE',
      `${this.base}/${programaCursoId}/requisitos`,
      { body: payload }
    );
  }

  /** elimina TODOS los requisitos del ProgramaCurso */
  clearAll(programaCursoId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/${programaCursoId}/requisitos`
    );
  }

  /** inserta en bloque */
  bulk(
    programaCursoId: number,
    rows: CreateProgramaCursoRequisitoDTO[]
  ): Observable<{ inserted: number; items: ProgramaCursoRequisitoDTO[] }> {
    return this.http.post<{ inserted: number; items: ProgramaCursoRequisitoDTO[] }>(
      `${this.base}/${programaCursoId}/requisitos/bulk`,
      { rows }
    );
  }
}
