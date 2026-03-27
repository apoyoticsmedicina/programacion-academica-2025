import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from "typeorm";
import { ProgramaCurso } from "./ProgramaCurso";

@Entity({ name: "clases_curso" })
@Unique(["clase"])
export class ClaseCurso {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  clase!: string;

  // Relaciones
  @OneToMany(() => ProgramaCurso, (pc) => pc.clase)
  programas!: ProgramaCurso[];
}
