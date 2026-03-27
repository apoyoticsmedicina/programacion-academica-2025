// src/app/dto/cronogramas.dto.ts

import { Docente } from './docentes.dto';

export interface CronogramaGrupoDocenteDTO {
    id?: number;
    grupoId?: number;
    docenteId: number;
    horas: number;
    // opcional: backend puede devolver el docente embebido
    docente?: Docente;
}

export interface CronogramaGrupoDTO {
    id?: number;
    cursoId?: number;
    nombre: string;
    docentes: CronogramaGrupoDocenteDTO[];
}
