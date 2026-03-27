// src/app/services/curso.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Curso, CreateCursoDTO, UpdateCursoDTO } from '../dto/cursos.dto';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class CursoService {
  // 👇 base tomada del environment
  private readonly base = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Curso[] | any> {
    return this.http.get<Curso[] | any>(this.base);
  }

  getById(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.base}/${id}`);
  }

  getByPlan(planId: number): Observable<Curso[]> {
    // mantiene el contrato actual con ?planId=
    return this.http.get<Curso[]>(`${this.base}?planId=${planId}`);
  }

  create(dto: CreateCursoDTO): Observable<Curso> {
    return this.http.post<Curso>(this.base, dto);
  }

  update(id: number, dto: UpdateCursoDTO): Observable<Curso> {
    return this.http.patch<Curso>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
