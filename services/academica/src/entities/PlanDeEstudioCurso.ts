import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, OneToMany, Unique } from "typeorm";
import { PlanDeEstudio } from "./PlanDeEstudio";
import { Curso } from "./Curso";
import { TipoCurso } from "./TipoCurso";
import { ProgramaCurso } from "./ProgramaCurso";

@Entity({ name: "plan_estudio_cursos" })
@Unique(["plan", "curso"]) // evita repetir el mismo curso en un plan
export class PlanEstudioCurso {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PlanDeEstudio, (p) => p.cursos, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "plan_estudio_id" })
  plan!: PlanDeEstudio;

  @ManyToOne(() => Curso, (c) => c.planes, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "curso_id" })
  curso!: Curso;

  @ManyToOne(() => TipoCurso, (t) => t.cursosEnPlanes, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "tipo_curso_id" })
  tipo!: TipoCurso;

  @Column({ type: "int", nullable: true })
  nivel?: number;

  // Relaciones
  @OneToMany(() => ProgramaCurso, (pc) => pc.planCurso)
  programasCurso!: ProgramaCurso[];
}
