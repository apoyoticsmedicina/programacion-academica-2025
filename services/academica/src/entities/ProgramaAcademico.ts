import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, Check } from "typeorm";
import { PlanDeEstudio } from "./PlanDeEstudio";

@Entity({ name: "programas_academicos" })
@Check(`"codigo" > 0`)
export class ProgramaAcademico {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  @Index({ unique: true })
  codigo!: number;

  @Column({ type: "varchar" })
  nombre!: string;

  @Column({ type: "varchar" }) // "pregrado" | "posgrado"
  tipo!: string;

  // Relaciones
  @OneToMany(() => PlanDeEstudio, (p) => p.programa)
  planes!: PlanDeEstudio[];
}
