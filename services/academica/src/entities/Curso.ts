import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
} from "typeorm";
import { PlanEstudioCurso } from "./PlanDeEstudioCurso";
import { ProgramaCursoRequisito } from "./ProgramaCursoRequisito";
import { CronogramaGrupo } from "./CronogramaGrupo";
import { UsuarioCurso } from "./UsuarioCurso";


@Entity({ name: "cursos" })
export class Curso {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: "varchar" })
  codigo!: string;

  @Column({ type: "varchar" })
  nombre!: string;

  // Relaciones
  @OneToMany(() => PlanEstudioCurso, (pec) => pec.curso)
  planes!: PlanEstudioCurso[];

  @OneToMany(() => ProgramaCursoRequisito, (r) => r.curso)
  requisitosComoPrincipal!: ProgramaCursoRequisito[];

  @OneToMany(() => ProgramaCursoRequisito, (r) => r.requisito)
  requisitosComoRequisito!: ProgramaCursoRequisito[];

  @OneToMany(() => CronogramaGrupo, (g) => g.curso)
  gruposCronograma!: CronogramaGrupo[];

  @OneToMany(() => UsuarioCurso, (uc) => uc.curso)
  coordinadores!: UsuarioCurso[];
}
