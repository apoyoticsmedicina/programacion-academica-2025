// src/app/dto/programas.dto.ts

export interface ProgramaAcademico {
  id: number;
  codigo: number
  nombre: string;
  tipo: 'pregrado' | 'posgrado';
}

export interface CreateProgramaDTO {
  codigo: string;
  nombre: string;
  tipo: ProgramaAcademico['tipo'];
}

export type UpdateProgramaDTO = Partial<CreateProgramaDTO>;