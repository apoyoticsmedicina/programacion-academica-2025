// src/app/services/cronogramas.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
    CronogramaGrupoDTO,
} from '../dto/cronogramas.dto';

@Injectable({ providedIn: 'root' })
export class CronogramasService {
    private readonly base = `${environment.apiBaseUrl}/cronogramas`;

    constructor(private http: HttpClient) { }

    /**
     * Obtiene los grupos de cronograma para un curso.
     * GET /cronogramas/curso/:cursoId
     */
    getByCurso(cursoId: number): Observable<CronogramaGrupoDTO[]> {
        return this.http.get<CronogramaGrupoDTO[]>(`${this.base}/curso/${cursoId}`);
    }

    /**
     * Reemplaza completamente los grupos de un curso por los que se envíen.
     * PUT /cronogramas/curso/:cursoId
     *
     * Payload: { grupos: CronogramaGrupoDTO[] }
     */
    replaceForCurso(
        cursoId: number,
        grupos: CronogramaGrupoDTO[]
    ): Observable<CronogramaGrupoDTO[]> {
        return this.http.put<CronogramaGrupoDTO[]>(
            `${this.base}/curso/${cursoId}`,
            { grupos }
        );
    }

    /**
     * Descarga el Excel con todos los cronogramas.
     * GET /cronogramas/excel
     */
    downloadExcel(): Observable<Blob> {
        return this.http.get(`${this.base}/excel`, {
            responseType: 'blob' as 'blob',
        });
    }
}
