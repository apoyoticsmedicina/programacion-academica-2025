import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export type PropuestaEvaluacionDTO = {
    momentos_evaluacion: string;
    porcentaje: number;
};

export type PropuestaBibliografiaDTO = {
    cultura?: string | null;
    referencia: string;
    palabras_clave?: string | null;
};

export type PropuestaComunidadDTO = {
    docente_id: number;                 // backend usa number
    nombre?: string | null;             // puede venir o no
    unidad_academica?: string | null;
    porcentaje: number;
};

export type PropuestaAvanzadoPayload = {
    // textos
    perfil?: string | null;
    intencionalidades_formativas?: string | null;
    aportes_curso_formacion?: string | null;
    descripcion_conocimientos?: string | null;
    vigencia?: string | null;

    // metodología
    medios_recursos?: string | null;
    formas_interaccion?: string | null;
    estrategias_internacionalizacion?: string | null;
    estrategias_enfoque?: string | null;

    // listas
    estrategias?: number[];
    evaluacion?: PropuestaEvaluacionDTO[];
    bibliografia?: PropuestaBibliografiaDTO[];

    // ✅ comunidad (nuevo)
    comunidad?: PropuestaComunidadDTO[];
};

export type UsuarioMinDTO = {
    id: number;
    email: string;
    rol: string;
    nombre?: string | null;
    foto?: string | null;
};

export type CursoMinDTO = {
    id: number;
    codigo: string;
    nombre: string;
};

export type ProgramaCursoMinDTO = {
    id: number;
    unidad_academica?: string | null;
    nucleo_curso?: string | null;
    vigencia?: string | null;
    perfil?: string | null;
    intencionalidadesFormativas?: string | null;
    aportesCursoFormacion?: string | null;
    descripcionConocimientos?: string | null;
    creditos?: string | null;
};

export type SolicitudCambioDTO = {
    id: number;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
    motivo?: string | null;

    // ✅ importante: snapshot/propuesta pueden venir como objeto (ideal)
    // si en tu API a veces llegan string, lo normalizas en TS con parseMaybeJson
    propuesta: PropuestaAvanzadoPayload;
    snapshot: PropuestaAvanzadoPayload;

    comentario_admin?: string | null;
    resuelto_en?: string | null;
    creado_en: string;
    actualizado_en: string;

    curso?: CursoMinDTO;
    programaCurso?: ProgramaCursoMinDTO;
    solicitante?: UsuarioMinDTO;
    resueltoPor?: UsuarioMinDTO;
};

@Injectable({ providedIn: 'root' })
export class SolicitudesCambioService {
    private readonly base = `${environment.apiBaseUrl}/solicitudes-cambio`;

    constructor(private http: HttpClient) { }

    // Coord
    mias(): Observable<SolicitudCambioDTO[]> {
        return this.http.get<SolicitudCambioDTO[]>(`${this.base}/mias`);
    }

    crear(payload: { programaCursoId: number; motivo?: string | null; propuesta: PropuestaAvanzadoPayload }): Observable<SolicitudCambioDTO> {
        return this.http.post<SolicitudCambioDTO>(`${this.base}`, payload);
    }

    getById(id: number): Observable<SolicitudCambioDTO> {
        return this.http.get<SolicitudCambioDTO>(`${this.base}/${id}`);
    }

    // Admin
    pendientes(): Observable<SolicitudCambioDTO[]> {
        return this.http.get<SolicitudCambioDTO[]>(`${this.base}/pendientes`);
    }

    aprobar(id: number, body: { comentario?: string | null } = {}): Observable<any> {
        return this.http.post<any>(`${this.base}/${id}/aprobar`, body);
    }

    rechazar(id: number, body: { comentario?: string | null } = {}): Observable<any> {
        return this.http.post<any>(`${this.base}/${id}/rechazar`, body);
    }
}