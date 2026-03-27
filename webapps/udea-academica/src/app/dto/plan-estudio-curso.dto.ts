import { Curso } from './cursos.dto';
import { TipoCurso } from './tipo-curso.dto';

export interface PlanEstudioCursoDTO {
  id: number;          // PK del PEC
  planId: number;      // plan_estudio_id (devuelto por el backend o mapeado)
  cursoId: number;     // curso_id
  orden?: number | null;
  nivel?: number | null;
  // poblados opcionales
  curso?: Curso | null;
  tipo?: TipoCurso | null; // relación al catálogo
}

/**
 * IMPORTANTE:
 * Para CREATE usamos snake_case porque el backend
 * consume directamente el body con estos nombres.
 */
export interface CreatePlanEstudioCursoDTO {
  plan_estudio_id: number;
  curso_id: number;
  tipo_curso_id: number; // FK al catálogo (obligatorio)
  nivel?: number | null;
}

export type UpdatePlanEstudioCursoDTO = Partial<CreatePlanEstudioCursoDTO>;
