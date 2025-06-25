// src/app/services/programa.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProgramaAcademico, CreateProgramaDTO } from '../dto/programas.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgramaService {
  private readonly baseUrl = '/api/programas';  // ajusta según tu endpoint real

  constructor(private http: HttpClient) {}

  /** Trae todos los programas académicos */
  getAll(): Observable<ProgramaAcademico[]> {
    return this.http.get<ProgramaAcademico[]>(this.baseUrl);
  }

  /** Crea un nuevo programa */
  create(dto: CreateProgramaDTO): Observable<ProgramaAcademico> {
    return this.http.post<ProgramaAcademico>(this.baseUrl, dto);
  }
}
