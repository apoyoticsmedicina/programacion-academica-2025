// src/app/services/programa-docente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProgramaDocenteDTO,
  CreateProgramaDocenteDTO,
  UpdateProgramaDocenteDTO,
} from '../dto/programa-docente.dto';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ProgramaDocenteService {
  private readonly base = `${environment.apiBaseUrl}/programas-docente`;

  constructor(private http: HttpClient) { }

  /** lista por programa_curso_id */
  getByProgramaCurso(
    programaCursoId: number
  ): Observable<{ items: ProgramaDocenteDTO[]; total: number }> {
    const params = new HttpParams().set(
      'programa_curso_id',
      String(programaCursoId)
    );
    return this.http.get<{ items: ProgramaDocenteDTO[]; total: number }>(
      this.base,
      { params }
    );
  }

  create(dto: CreateProgramaDocenteDTO): Observable<ProgramaDocenteDTO> {
    return this.http.post<ProgramaDocenteDTO>(this.base, dto);
  }

  update(
    id: number,
    dto: UpdateProgramaDocenteDTO
  ): Observable<ProgramaDocenteDTO> {
    return this.http.patch<ProgramaDocenteDTO>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
