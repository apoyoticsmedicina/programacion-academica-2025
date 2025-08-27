export interface Curso {
  id: number;
  codigo: string;
  nombre: string;
  nivel: string;
  habilitado: boolean;
  HTI: number;
  HTC: number;
  HTE: number;
}

/** Payload para crear/editar */
export interface CreateCursoDTO {
  codigo: string;
  nombre: string;
  nivel: string;
  habilitado: boolean;
  HTI: number;
  HTC: number;
  HTE: number;
}

export type UpdateCursoDTO = Partial<CreateCursoDTO>;