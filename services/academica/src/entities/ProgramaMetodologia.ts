// src/entities/ProgramaMetodologia.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { ProgramaCurso } from "./ProgramaCurso";

@Entity({ name: "programas_metodologia" })
export class ProgramaMetodologia {
  @PrimaryGeneratedColumn()
  id!: number;

  // Un programa tiene UNA metodología (esperado 1:1 a nivel de negocio)
  // Técnicamente es ManyToOne, pero puedes hacer el índice único en DB.
  @ManyToOne(() => ProgramaCurso, (pc) => pc.metodologia, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "id_programa_curso" })
  programaCurso!: ProgramaCurso;

  @Column({ name: "medios_y_recursos", type: "text", nullable: true })
  mediosYRecursos?: string;

  @Column({ name: "formas_interaccion", type: "text", nullable: true })
  formasInteraccion?: string;

  @Column({
    name: "estrategias_internacionalizacion",
    type: "text",
    nullable: true,
  })
  estrategiasInternacionalizacion?: string;

  @Column({ name: "estrategias_enfoque", type: "text", nullable: true })
  estrategiasEnfoque?: string;
}
