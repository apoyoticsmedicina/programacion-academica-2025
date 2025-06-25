// src/app/dto/plan-estudio.dto.ts

/** Representa un plan de estudio existente */
export interface PlanEstudio {
  id: number;
  programaId: number;
  version: string;
  activo: boolean;
}

/** Payload para crear un nuevo plan de estudio */
export interface CreatePlanEstudioDTO {
  programaId: number;
  version: string;
}

/** Payload para actualizar un plan (p.ej. desactivar el antiguo) */
export interface UpdatePlanEstudioDTO {
  activo?: boolean;
}
