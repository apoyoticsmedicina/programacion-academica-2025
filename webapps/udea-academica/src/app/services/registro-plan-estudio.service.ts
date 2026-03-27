// src/app/services/registro-plan-estudio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface RegistroPlan {
  id: number;
  plan_estudio_id: number;
  anio: number; // ✅ unificado
  periodo: string;
}

@Injectable({ providedIn: 'root' })
export class RegistroPlanEstudioService {
  private readonly baseUrl = `${environment.apiBaseUrl}/registro-plan`;

  constructor(private http: HttpClient) { }

  // ✅ ahora espera 'anio'
  create(payload: {
    plan_estudio_id: number;
    anio: number;
    periodo: string;
  }): Observable<RegistroPlan> {
    return this.http.post<RegistroPlan>(this.baseUrl, payload);
  }

  getAll(): Observable<RegistroPlan[]> {
    return this.http.get<RegistroPlan[]>(this.baseUrl);
  }

  getById(id: number): Observable<RegistroPlan> {
    return this.http.get<RegistroPlan>(`${this.baseUrl}/${id}`);
  }

  exists(
    plan_estudio_id: number,
    anio: number,
    periodo: string
  ): Observable<{ exists: boolean; data: RegistroPlan | null }> {
    const params = new HttpParams()
      .set('plan_estudio_id', String(plan_estudio_id))
      .set('anio', String(anio))
      .set('periodo', periodo);

    return this.http.get<{ exists: boolean; data: RegistroPlan | null }>(
      `${this.baseUrl}/exists`,
      { params }
    );
  }
}
