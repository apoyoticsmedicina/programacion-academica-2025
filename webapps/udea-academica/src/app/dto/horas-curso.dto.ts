export interface HorasCursoDTO {
  id: number;
  h_semanales_p_e: number;
  h_semanales_t_i: number;
  h_semanales_a_a_t: number;
  h_semanales_a_a_p: number;
  h_semanales_a_a_t_p: number;
  h_totales_curso: number;
}

export type CreateHorasCursoDTO = Omit<HorasCursoDTO, 'id'>;
export type UpdateHorasCursoDTO = Partial<CreateHorasCursoDTO>;
