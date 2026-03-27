export interface Curso {
  id: number;
  codigo: string;
  nombre: string;
}

export interface CreateCursoDTO {
  codigo: string;
  nombre: string;
}

export type UpdateCursoDTO = Partial<CreateCursoDTO>;
