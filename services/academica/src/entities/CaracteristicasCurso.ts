import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from "typeorm";
import { ProgramaCurso } from "./ProgramaCurso";

@Entity({ name: "caracteristicas_curso" })
@Unique(["caracteristicas"])
export class CaracteristicasCurso {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  caracteristicas!: string;

  // Relaciones
  @OneToMany(() => ProgramaCurso, (pc) => pc.caracteristicas)
  programas!: ProgramaCurso[];
}
