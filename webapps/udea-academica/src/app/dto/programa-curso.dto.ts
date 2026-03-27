import { PlanEstudioCursoDTO } from './plan-estudio-curso.dto';

export interface CaracteristicasCurso { id: number; caracteristicas: string; }
export interface ClaseCurso { id: number; clase: string; }
export interface ModalidadCurso { id: number; modalidad: string; }

// ---- Detalle (horas / metodología / evaluación / docentes) ----
export interface ProgramaHoraDTO {
  id: number;
  hSemanalesPE?: number;   h_semanales_p_e?: number;
  hSemanalesTI?: number;   h_semanales_t_i?: number;
  hSemanalesAAT?: number;  h_semanales_a_a_t?: number;
  hSemanalesAAP?: number;  h_semanales_a_a_p?: number;
  hSemanalesAATP?: number; h_semanales_a_a_t_p?: number;
  hTotalesCurso?: number;  h_totales_curso?: number;
  creditosCurso?: number;  creditos_curso?: number;
}

export interface ProgramaBibliografiaDTO {
  id: number;
  cultura?: string | null;
  referencia?: string | null;
  palabras_clave?: string | null;
}

export interface EstrategiaDidacticaLite {
  id: number;
  nombre?: string;
  descripcion?: string;
}

export interface ProgramaMetodologiaDTO {
  id: number;
  estrategia?: EstrategiaDidacticaLite | null;
  medios_recursos?: string | null;
  formas_interaccion?: string | null;
  estrategias_internacionalizacion?: string | null;
  estrategias_enfoque?: string | null;
}

export interface ProgramaEvaluacionDTO {
  id: number;
  momentosEvaluacion?: string;   // camel
  momentos_evaluacion?: string;  // snake
  porcentaje?: number | null;
}

export interface DocenteLite {
  id: number;
  documento?: string;
  nombres?: string;
  apellidos?: string;
  dependencia?: string;
  unidad_academica?: string;
}

export interface ProgramaDocenteRowDTO {
  id: number;
  porcentaje: string; // numeric en texto
  docente?: DocenteLite | null;
}

// ---- ProgramaCurso base + relaciones ----
export interface ProgramaCursoDTO {
  id: number;
  planEstudioCursoId: number;
  unidadAcademica: string;
  nucleoCurso?: string | null;
  creditos?: number | null;
  vigencia?: string | null;

  planCurso?: PlanEstudioCursoDTO | null;
  caracteristicas?: CaracteristicasCurso | null;
  clase?: ClaseCurso | null;
  modalidad?: ModalidadCurso | null;

  perfil?: string | null;
  intencionalidadesFormativas?: string | null;
  aportesCursoFormacion?: string | null;
  descripcionConocimientos?: string | null;

  horas?: ProgramaHoraDTO[];
  metodologias?: ProgramaMetodologiaDTO[];
  evaluaciones?: ProgramaEvaluacionDTO[];
  docentes?: ProgramaDocenteRowDTO[];
  bibliografia?: ProgramaBibliografiaDTO[];   // 🔹 NUEVO
}


export interface CreateProgramaCursoDTO {
  id_plan_estudio_curso: number;
  unidad_academica: string;
  id_caracteristicas: number;
  id_clase_curso: number;
  id_modalidad_curso: number;
  nucleo_curso?: string | null;
  creditos?: number | null;
  vigencia?: string | null;
}

export type UpdateProgramaCursoDTO = Partial<CreateProgramaCursoDTO>;
