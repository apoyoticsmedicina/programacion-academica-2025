// src/app/dto/cursos.dto.ts
export interface Curso {
  id: number;
  codigo: string;
  nombre: string;
  fechaInicio: string;   // ISO date
  fechaFin: string;      // ISO date
  habilitado: boolean;
  esElectiva: boolean;
  HTI: number;           // Horas totales de interacción
  HTC: number;           // Horas totales de clase
  HTE: number;           // Horas totales de estudio
}

export interface CreateCursoDTO {
  codigo: string;
  nombre: string;
  esElectiva?: boolean;
}

export type UpdateCursoDTO = Partial<
  CreateCursoDTO & {
    fechaInicio: string;
    fechaFin: string;
    habilitado: boolean;
    HTI: number;
    HTC: number;
    HTE: number;
  }
>;
