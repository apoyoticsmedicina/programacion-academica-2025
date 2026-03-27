// src/entities/ProgramaBibliografia.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ProgramaCurso } from "./ProgramaCurso";

@Entity({ name: "programas_bibliografia" })
export class ProgramaBibliografia {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ProgramaCurso, (pc) => pc.bibliografia, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "id_programa_curso" })
  programaCurso!: ProgramaCurso;

  // p.ej. "Cultura escrita", "Cultura digital", etc.
  @Column({ type: "varchar", length: 100, nullable: true })
  cultura?: string;

  // Referencia bibliográfica completa
  @Column({ type: "text" })
  referencia!: string;

  // Palabras clave asociadas (separadas por coma, punto y coma, etc.)
  @Column({ name: "palabras_clave", type: "text", nullable: true })
  palabrasClave?: string;
}
