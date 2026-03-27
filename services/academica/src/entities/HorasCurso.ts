import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ProgramaCurso } from "./ProgramaCurso";

@Entity({ name: "horas_curso" })
export class HorasCurso {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "h_semanales_p_e", type: "int", default: 0 })
  h_semanales_p_e!: number;

  @Column({ name: "h_semanales_t_i", type: "int", default: 0 })
  h_semanales_t_i!: number;

  @Column({ name: "h_semanales_a_a_t", type: "int", default: 0 })
  h_semanales_a_a_t!: number;

  @Column({ name: "h_semanales_a_a_p", type: "int", default: 0 })
  h_semanales_a_a_p!: number;

  @Column({ name: "h_semanales_a_a_t_p", type: "int", default: 0 })
  h_semanales_a_a_t_p!: number;

  @Column({ name: "h_totales_curso", type: "int", default: 0 })
  h_totales_curso!: number;

  @ManyToOne(() => ProgramaCurso, (pc) => pc.horas, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "id_programa_curso" })
  programaCurso!: ProgramaCurso;
}
