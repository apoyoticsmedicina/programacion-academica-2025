import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export type CursoAsignadoDTO = {
    id: number;
    creado_en: string;
    curso: { id: number; codigo: string; nombre: string };
};

@Injectable({ providedIn: 'root' })
export class MiContextoService {
    private readonly base = `${environment.apiBaseUrl}/mi`;

    constructor(private http: HttpClient) { }

    cursos(): Observable<CursoAsignadoDTO[]> {
        return this.http.get<CursoAsignadoDTO[]>(`${this.base}/cursos`);
    }
}