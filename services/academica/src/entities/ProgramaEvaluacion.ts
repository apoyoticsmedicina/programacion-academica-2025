import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { ProgramaCurso } from "./ProgramaCurso";

@Entity({ name: "programas_evaluacion" })
export class ProgramaEvaluacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ProgramaCurso, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "id_programa_curso" })
  programaCurso!: ProgramaCurso;

  @Column({ name: "momentos_evaluacion", type: "text", nullable: false })
  momentosEvaluacion!: string;

  @Column({ name: "porcentaje", type: "numeric", precision: 5, scale: 2, nullable: false })
  porcentaje!: number;
}
