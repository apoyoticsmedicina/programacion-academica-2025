export interface Cohorte {
  id: number;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string;    // YYYY-MM-DD
  periodo: string;      // "2025-1"
}

export interface CreateCohorteDTO {
  fecha_inicio: string;
  fecha_fin: string;
  periodo: string;
}

export type UpdateCohorteDTO = Partial<CreateCohorteDTO>;
