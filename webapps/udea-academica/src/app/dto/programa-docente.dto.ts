export interface ProgramaDocenteDTO {
  id: number;
  docenteId: number;
  programaCursoId: number;
  porcentaje: string;
}


export interface CreateProgramaDocenteDTO {
  id_docente: number;
  id_programa: number;   // = programaCursoId
  porcentaje: string;    // "0".."100"
}

export type UpdateProgramaDocenteDTO = Partial<CreateProgramaDocenteDTO>;
