// src/app/services/catalogos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, catchError } from 'rxjs';
import { environment } from '@env/environment';

export type TipoCursoItem = { id: number; tipo: string };
export type CaracteristicaItem = { id: number; caracteristicas: string };
export type ClaseCursoItem = { id: number; clase: string };
export type ModalidadCursoItem = { id: number; modalidad: string };

/** NUEVO: catálogo de estrategias didácticas */
export type EstrategiaDidacticaItem = {
  id: number;
  nombre: string;
  descripcion?: string | null;
};

function unwrapList<T>(res: any): T[] {
  return Array.isArray(res)
    ? res
    : (res?.items ?? res?.data ?? res?.results ?? res?.rows ?? res?.list ?? []);
}

/** Normalizador sencillo por si el backend cambia claves (nombre/estrategia/titulo). */
function normalizeEstrategia(raw: any): EstrategiaDidacticaItem | null {
  if (!raw) return null;
  const id = Number(raw.id ?? raw.id_estrategia ?? raw.ID ?? raw.Id);
  if (!Number.isFinite(id)) return null;

  const nombre = String(
    raw.nombre ?? raw.estrategia ?? raw.titulo ?? raw.descripcion ?? ''
  ).trim();

  const descripcion =
    raw.descripcion != null ? String(raw.descripcion).trim() : undefined;

  return { id, nombre, descripcion };
}

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  // 👇 base de API tomada del environment
  private readonly API = `${environment.apiBaseUrl}/catalogos`;

  constructor(private http: HttpClient) {}

  // ======= Catálogos “globales” =======
  getTiposCurso(): Observable<TipoCursoItem[]> {
    return this.http.get(`${this.API}/tipos-curso`).pipe(
      map((res: any) => unwrapList<TipoCursoItem>(res) ?? [])
    );
  }

  getCaracteristicas(): Observable<CaracteristicaItem[]> {
    return this.http.get(`${this.API}/caracteristicas-curso`).pipe(
      map((res: any) => unwrapList<CaracteristicaItem>(res) ?? [])
    );
  }

  getModalidadesCurso(): Observable<ModalidadCursoItem[]> {
    return this.http.get(`${this.API}/modalidades-curso`).pipe(
      map((res: any) => unwrapList<ModalidadCursoItem>(res) ?? [])
    );
  }

  /** Preferido: trae clases filtradas por planId */
  getClasesByPlan(planId: number): Observable<ClaseCursoItem[]> {
    return this.http
      .get(`${this.API}/clases-curso`, { params: { planId } as any })
      .pipe(
        map((res: any) => unwrapList<ClaseCursoItem>(res) ?? []),
        // Fallback: si el endpoint no acepta planId aún, caemos al global
        catchError(() => this.getClasesCurso())
      );
  }

  /** Fallback / compatibilidad: todas las clases */
  getClasesCurso(): Observable<ClaseCursoItem[]> {
    return this.http.get(`${this.API}/clases-curso`).pipe(
      map((res: any) => unwrapList<ClaseCursoItem>(res) ?? [])
    );
  }

  // ======= NUEVO: Estrategias Didácticas =======
  /** GET /catalogos/estrategias-didacticas */
  getEstrategiasDidacticas(): Observable<EstrategiaDidacticaItem[]> {
    return this.http.get(`${this.API}/estrategias-didacticas`).pipe(
      map((res: any) =>
        unwrapList<any>(res)
          .map(normalizeEstrategia)
          .filter((x): x is EstrategiaDidacticaItem => !!x)
      )
    );
  }
}
