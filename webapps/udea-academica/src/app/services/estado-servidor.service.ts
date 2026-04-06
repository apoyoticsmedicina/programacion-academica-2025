import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export type EstadoServidorDTO = {
    id: number;
    estado: string;
    activo: boolean;
    activo_desde: string | null;
    activo_hasta: string | null;
    createdAt: string;
    updatedAt: string;
};

export type TimeWindowDTO = { desde: string; hasta: string };

export type ActivarFlujoFullDTO = {
    solicitudes: TimeWindowDTO;
    revisiones: TimeWindowDTO;
    aprobacion: TimeWindowDTO;
    cronogramas: TimeWindowDTO;
};

export type ActivarCronogramasOnlyDTO = {
    cronogramas: TimeWindowDTO;
};

@Injectable({
    providedIn: 'root',
})
export class EstadoServidorService {
    private readonly base = `${environment.apiBaseUrl}/estados-servidor`;

    constructor(private http: HttpClient) { }

    list(): Observable<EstadoServidorDTO[]> {
        return this.http.get<EstadoServidorDTO[]>(`${this.base}`);
    }

    active(): Observable<EstadoServidorDTO | null> {
        return this.http.get<EstadoServidorDTO | null>(`${this.base}/active`);
    }

    effective(): Observable<EstadoServidorDTO | null> {
        return this.http.get<EstadoServidorDTO | null>(`${this.base}/effective`);
    }

    recalc(): Observable<EstadoServidorDTO | null> {
        return this.http.post<EstadoServidorDTO | null>(`${this.base}/recalc`, {});
    }

    activarFlujoFull(payload: ActivarFlujoFullDTO): Observable<EstadoServidorDTO> {
        return this.http.post<EstadoServidorDTO>(`${this.base}/flows/full`, payload);
    }

    activarCronogramasOnly(payload: ActivarCronogramasOnlyDTO): Observable<EstadoServidorDTO> {
        return this.http.post<EstadoServidorDTO>(`${this.base}/flows/cronogramas-only`, payload);
    }
}