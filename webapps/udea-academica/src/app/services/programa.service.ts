import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProgramaAcademico, CreateProgramaDTO, UpdateProgramaDTO } from '../dto/programas.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgramaService {
  private base = 'http://localhost:3000/programas';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProgramaAcademico[]> {
    return this.http.get<ProgramaAcademico[]>(this.base);
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