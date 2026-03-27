import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from "typeorm";
import { Docente } from "./Docente";
import { ProgramaCurso } from "./ProgramaCurso";

@Entity({ name: "programas_docente" })
export class ProgramaDocente {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Docente, (d) => d.programasAsignados, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "id_docente" })
  docente!: Docente;

  // NOTA: "id_programa" se interpreta como referencia a ProgramaCurso,
  // no a ProgramaAcademico. Si fuera lo contrario, te lo cambio.
  @ManyToOne(() => ProgramaCurso, (pc) => pc.docentes, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "id_programa" })
  programaCurso!: ProgramaCurso;

  @Column({ type: "numeric", precision: 5, scale: 2, default: 0 })
  porcentaje!: string;
}
