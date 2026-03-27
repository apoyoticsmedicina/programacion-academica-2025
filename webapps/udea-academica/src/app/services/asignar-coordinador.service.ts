import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { UsuarioAdminDTO } from '../dto/usuario.dto';

export type CursoDisponibleDTO = {
    id: number;
    codigo: string;
    nombre: string;
    asignado: boolean;
};

@Injectable({ providedIn: 'root' })
export class AsignarCoordinadorService {
    private readonly base = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    getUsuarios(): Observable<UsuarioAdminDTO[]> {
        return this.http.get<UsuarioAdminDTO[]>(`${this.base}/auth/usuarios`);
    }

    getCursosDisponibles(usuarioId: number): Observable<CursoDisponibleDTO[]> {
        return this.http.get<CursoDisponibleDTO[]>(
            `${this.base}/usuarios/${usuarioId}/cursos/disponibles`
        );
    }

    setCursos(usuarioId: number, cursoIds: number[]): Observable<any> {
        return this.http.put(`${this.base}/usuarios/${usuarioId}/cursos`, { cursoIds });
    }
}