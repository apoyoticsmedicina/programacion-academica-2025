// src/app/services/horas-curso.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  HorasCursoDTO,
  CreateHorasCursoDTO,
  UpdateHorasCursoDTO,
} from '../dto/horas-curso.dto';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class HorasCursoService {
  private readonly baseProg = `${environment.apiBaseUrl}/programas-curso`;
  private readonly baseHoras = `${environment.apiBaseUrl}/horas-curso`;

  constructor(private http: HttpClient) {}

  /** Horas anidadas bajo un ProgramaCurso */
  list(programaCursoId: number): Observable<HorasCursoDTO[]> {
    return this.http.get<HorasCursoDTO[]>(
      `${this.baseProg}/${programaCursoId}/horas`,
    );
  }

  create(
    programaCursoId: number,
    dto: CreateHorasCursoDTO,
  ): Observable<HorasCursoDTO> {
    return this.http.post<HorasCursoDTO>(
      `${this.baseProg}/${programaCursoId}/horas`,
      dto,
    );
  }

  /** Recurso individual de horas */
  getById(id: number): Observable<HorasCursoDTO> {
    return this.http.get<HorasCursoDTO>(`${this.baseHoras}/${id}`);
  }

  update(id: number, dto: UpdateHorasCursoDTO): Observable<HorasCursoDTO> {
    return this.http.patch<HorasCursoDTO>(`${this.baseHoras}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseHoras}/${id}`);
  }
}
