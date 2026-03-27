import { ProgramaAcademico } from './programas.dto';
import { Cohorte } from './cohortes.dto';

export interface PlanEstudio {
  id: number;
  version: string;
  activo: boolean;
  niveles?: number;
  programa?: ProgramaAcademico;
  programaId?: number;
  cohorte?: Cohorte;
  cohorteId?: number;
}

export interface CreatePlanEstudioDTO {
  programaId: number;
  version: string;
  cohorteId: number;      // 👈 requerido por backend
  niveles: number;
}

export interface UpdatePlanEstudioDTO {
  activo?: boolean;
  niveles?: number;
}
