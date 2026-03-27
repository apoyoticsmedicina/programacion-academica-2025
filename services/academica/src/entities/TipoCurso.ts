import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from "typeorm";
import { PlanEstudioCurso } from "./PlanDeEstudioCurso";

@Entity({ name: "tipos_curso" })
@Unique(["tipo"])
export class TipoCurso {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  tipo!: string;

  // Relaciones
  @OneToMany(() => PlanEstudioCurso, (pec) => pec.tipo)
  cursosEnPlanes!: PlanEstudioCurso[];
}
