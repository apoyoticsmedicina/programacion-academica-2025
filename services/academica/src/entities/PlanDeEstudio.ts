import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique } from "typeorm";
import { ProgramaAcademico } from "./ProgramaAcademico";
import { Cohorte } from "./Cohorte";
import { PlanEstudioCurso } from "./PlanDeEstudioCurso";

@Entity({ name: "planes_estudio" })
@Unique(["programa", "version", "cohorte"]) // evita duplicados de una versión por cohorte
export class PlanDeEstudio {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ProgramaAcademico, (p) => p.planes, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "programa_id" })
  programa!: ProgramaAcademico;

  @Column({ type: "varchar" })
  version!: string;

  @ManyToOne(() => Cohorte, (c) => c.planes, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "id_cohorte" })
  cohorte!: Cohorte;

  @Column({ type: "boolean", default: true })
  activo!: boolean;

  @Column({ type: "int" })
  niveles!: number;

  // Relaciones
  @OneToMany(() => PlanEstudioCurso, (pec) => pec.plan)
  cursos!: PlanEstudioCurso[];
}
