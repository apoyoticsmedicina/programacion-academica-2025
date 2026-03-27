// src/entities/EstrategiaDidactica.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { ProgramaMetodologiaEstrategia } from "./ProgramaMetodologiaEstrategia";

@Entity({ name: "estrategias_didacticas" })
export class EstrategiaDidactica {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text", unique: true })
  estrategia!: string;

  // Antes: OneToMany -> ProgramaMetodologia (pm.estrategia)
  // Ahora: OneToMany -> ProgramaMetodologiaEstrategia (pme.estrategia)
  @OneToMany(
    () => ProgramaMetodologiaEstrategia,
    (pme) => pme.estrategia
  )
  programasMetodologia!: ProgramaMetodologiaEstrategia[];
}
