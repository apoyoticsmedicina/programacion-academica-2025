import { Curso } from './cursos.dto';

/** Representa la asociación Curso ↔ Plan de Estudio */
export interface PlanEstudioCurso {
  planEstudioId: number;
  cursoId: number;
  obligatorio: boolean;
  esElectiva: boolean;
  orden: number;
  curso: Curso;
}

/** Payload para crear una nueva asociación */
export interface CreatePlanEstudioCursoDTO {
  planEstudioId: number;
  cursoId: number;
  obligatorio?: boolean;
  esElectiva?: boolean;
  orden?: number;
}

export type UpdatePlanEstudioCursoDTO = Partial<CreatePlanEstudioCursoDTO>;
