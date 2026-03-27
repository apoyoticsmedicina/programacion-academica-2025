import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from "typeorm";
import { ProgramaCurso } from "./ProgramaCurso";

@Entity({ name: "modalidades_curso" })
@Unique(["modalidad"])
export class ModalidadCurso {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  modalidad!: string;

  // Relaciones
  @OneToMany(() => ProgramaCurso, (pc) => pc.modalidad)
  programas!: ProgramaCurso[];
}
