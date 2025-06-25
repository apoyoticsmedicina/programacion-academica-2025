// src/app/services/curso.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Curso, CreateCursoDTO, UpdateCursoDTO } from '../dto/cursos.dto';

@Injectable({ providedIn: 'root' })
export class CursoService {
  private base = '/api/cursos';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Curso[]> {
    // return this.http.get<Curso[]>(`${this.base}`);
    return this.http.get<Curso[]>(`${this.base}`); // descomentar en prod
  }

  create(dto: CreateCursoDTO): Observable<Curso> {
    // return this.http.post<Curso>(`${this.base}`, dto);
    return this.http.post<Curso>(`${this.base}`, dto);
  }

  update(id: number, dto: UpdateCursoDTO): Observable<void> {
    // return this.http.patch<void>(`${this.base}/${id}`, dto);
    return this.http.patch<void>(`${this.base}/${id}`, dto);
  }

  // si necesitas buscar por plan:
  getByPlan(planId: number): Observable<Curso[]> {
    // return this.http.get<Curso[]>(`${this.base}?planId=${planId}`);
    return this.http.get<Curso[]>(`${this.base}?planId=${planId}`);
  }
}
