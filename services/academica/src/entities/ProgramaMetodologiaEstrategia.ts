// src/entities/ProgramaMetodologiaEstrategia.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ProgramaCurso } from "./ProgramaCurso";
import { EstrategiaDidactica } from "./EstrategiaDidactica";

@Entity({ name: "programas_metodologia_estrategias" })
export class ProgramaMetodologiaEstrategia {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(
    () => ProgramaCurso,
    (pc) => pc.estrategiasMetodologicas,
    { nullable: false, onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "id_programa_curso" })
  programaCurso!: ProgramaCurso;

  @ManyToOne(
    () => EstrategiaDidactica,
    (e) => e.programasMetodologia,
    { nullable: false, onDelete: "RESTRICT" }
  )
  @JoinColumn({ name: "id_estrategia_didactica" })
  estrategia!: EstrategiaDidactica;
}
