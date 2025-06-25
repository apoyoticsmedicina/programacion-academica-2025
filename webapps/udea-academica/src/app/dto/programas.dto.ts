// src/app/dto/programas.dto.ts

export interface ProgramaAcademico {
  id: number;
  nombre: string;
  tipo: 'pregrado'|'posgrado';
  expanded?: boolean;
  planes?: { version: string; activo: boolean }[];
}

export interface CreateProgramaDTO {
  nombre: string;
  tipo: ProgramaAcademico['tipo'];
}
