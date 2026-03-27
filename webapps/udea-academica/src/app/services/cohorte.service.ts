// src/app/services/cohorte.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cohorte, CreateCohorteDTO, UpdateCohorteDTO } from '../dto/cohortes.dto';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class CohorteService {
  // 👇 Ahora la URL base sale del environment
  private readonly base = `${environment.apiBaseUrl}/cohortes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cohorte[]> {
    return this.http.get<Cohorte[]>(this.base);
  }

  getById(id: number): Observable<Cohorte> {
    return this.http.get<Cohorte>(`${this.base}/${id}`);
  }

  create(dto: CreateCohorteDTO): Observable<Cohorte> {
    return this.http.post<Cohorte>(this.base, dto);
  }

  update(id: number, dto: UpdateCohorteDTO): Observable<Cohorte> {
    return this.http.patch<Cohorte>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
