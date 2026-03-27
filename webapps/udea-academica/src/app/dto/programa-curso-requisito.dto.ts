import { Curso } from './cursos.dto';

export type TipoRequisito = 'prerrequisito' | 'correquisito';

export interface ProgramaCursoRequisitoDTO {
  programaCursoId: number;
  cursoId: number;            // curso principal (catálogo)
  requisitoCursoId: number;   // curso requisito (catálogo)
  tipo: TipoRequisito;

  // opcional poblado
  curso?: Curso | null;
  requisito?: Curso | null;
}

export interface CreateProgramaCursoRequisitoDTO {
  curso_id: number;
  requisito_curso_id: number;
  tipo: TipoRequisito;
}

export type DeleteProgramaCursoRequisitoDTO = CreateProgramaCursoRequisitoDTO;
