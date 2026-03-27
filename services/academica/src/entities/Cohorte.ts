import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from "typeorm";
import { PlanDeEstudio } from "./PlanDeEstudio";

@Entity({ name: "cohortes" })
@Unique(["periodo"]) // opcional; quítalo si el periodo puede repetirse
export class Cohorte {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "date" })
  fecha_inicio!: string;

  @Column({ type: "date" })
  fecha_fin!: string;

  @Column({ type: "varchar" }) // p.ej. "2025-1"
  periodo!: string;

  // Relaciones
  @OneToMany(() => PlanDeEstudio, (p) => p.cohorte)
  planes!: PlanDeEstudio[];
}
