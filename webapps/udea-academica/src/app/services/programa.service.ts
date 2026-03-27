// src/app/services/programa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

import { ProgramaAcademico, CreateProgramaDTO, UpdateProgramaDTO } from '../dto/programas.dto';
import { PageResult } from '../dto/pagination.dto';

export type ListProgramasParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  tipo?: string;
  codigo?: string | number;
};

@Injectable({ providedIn: 'root' })
export class ProgramaService {
  private readonly base = `${environment.apiBaseUrl}/programas`;

  constructor(private http: HttpClient) { }

  getAll(params?: ListProgramasParams): Observable<PageResult<ProgramaAcademico>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page != null) httpParams = httpParams.set('page', String(params.page));
      if (params.pageSize != null) httpParams = httpParams.set('pageSize', String(params.pageSize));
      if (params.q) httpParams = httpParams.set('q', params.q);
      if (params.tipo) httpParams = httpParams.set('tipo', params.tipo);
      if (params.codigo != null && String(params.codigo).trim() !== '') {
        httpParams = httpParams.set('codigo', String(params.codigo));
      }
    }

    return this.http.get<PageResult<ProgramaAcademico>>(this.base, { params: httpParams });
  }

  getById(id: number): Observable<ProgramaAcademico> {
    return this.http.get<ProgramaAcademico>(`${this.base}/${id}`);
  }

  create(dto: CreateProgramaDTO): Observable<ProgramaAcademico> {
    return this.http.post<ProgramaAcademico>(this.base, dto);
  }

  update(id: number, dto: UpdateProgramaDTO): Observable<ProgramaAcademico> {
    return this.http.patch<ProgramaAcademico>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
