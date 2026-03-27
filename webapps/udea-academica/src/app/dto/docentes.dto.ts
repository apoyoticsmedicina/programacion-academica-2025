export interface Docente {
  id: number;
  tipo_documento?: string | null;
  documento: string;
  nombres: string;
  apellidos: string;
  vinculacion?: string | null;
  dedicacion?: string | null;
  departamento?: string | null;

  // 👇 nuevos (camelCase)
  unidad_academica?: string | null;
  correo_institucional?: string | null;
  correo_personal?: string | null;

  activo: boolean;
}

export type CreateDocenteDTO = Omit<Docente, 'id'>;
export type UpdateDocenteDTO = Partial<CreateDocenteDTO>;

export function nombreCortoDocente(d: Pick<Docente, 'nombres' | 'apellidos'>) {
  const n1 = (d.nombres || '').split(/\s+/)[0] || '';
  const a1 = (d.apellidos || '').split(/\s+/)[0] || '';
  return `${n1} ${a1}`.trim();
}
