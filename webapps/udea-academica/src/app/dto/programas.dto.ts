// src/app/dto/programas.dto.ts

export interface ProgramaAcademico {
  id: number;
  nombre: string;
  tipo: 'pregrado' | 'posgrado';
}

export interface CreateProgramaDTO {
  nombre: string;
  tipo: ProgramaAcademico['tipo'];
}

export type UpdateProgramaDTO = Partial<CreateProgramaDTO>;