// src/entities/ProgramaCursoRequisito.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { ProgramaCurso } from "./ProgramaCurso";
import { Curso } from "./Curso";

@Entity({ name: "programa_curso_requisitos" })
export class ProgramaCursoRequisito {
  @PrimaryColumn({ name: "programa_curso_id", type: "int" })
  programaCursoId!: number;

  @PrimaryColumn({ name: "curso_id", type: "int" })
  cursoId!: number; // curso “principal” (catálogo)

  @PrimaryColumn({ name: "requisito_curso_id", type: "int" })
  requisitoCursoId!: number; // curso “requisito” (catálogo)

  @PrimaryColumn({ name: "tipo", type: "varchar" })
  tipo!: string; // "prerrequisito" | "correquisito"

  // Contexto (programa de curso del plan/cohorte)
  @ManyToOne(() => ProgramaCurso, (pc) => pc.requisitos, { onDelete: "CASCADE" })
  @JoinColumn({ name: "programa_curso_id" })
  programaCurso!: ProgramaCurso;

  // Curso principal (catálogo)
  @ManyToOne(() => Curso, (c) => c.requisitosComoPrincipal, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "curso_id" })
  curso!: Curso;

  // Curso requisito (catálogo)
  @ManyToOne(() => Curso, (c) => c.requisitosComoRequisito, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "requisito_curso_id" })
  requisito!: Curso;
}
