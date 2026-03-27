import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ProgramaDocente } from "./ProgramaDocente";
import { CronogramaGrupoDocente } from "./CronogramaGrupoDocente";

@Entity({ name: "docentes" })
export class Docente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 20, default: "CC" })
  tipo_documento!: string;

  @Column({ type: "varchar", unique: true })
  documento!: string;

  @Column({ type: "varchar" })
  nombres!: string;

  @Column({ type: "varchar" })
  apellidos!: string;

  @Column({ type: "varchar" })
  vinculacion!: string;

  @Column({ type: "varchar" })
  dedicacion!: string;

  @Column({ type: "varchar" })
  departamento!: string;

  @Column({ type: "varchar" })
  unidad_academica!: string;

  @Column({ type: "boolean", default: true })
  activo!: boolean;

  @Column({ type: "varchar", nullable: true })
  correo_institucional?: string;

  @Column({ type: "varchar", nullable: true })
  correo_personal?: string;

  // Relaciones
  @OneToMany(() => ProgramaDocente, (pd) => pd.docente)
  programasAsignados!: ProgramaDocente[];

  @OneToMany(() => CronogramaGrupoDocente, (gd) => gd.docente)
  gruposCronograma!: CronogramaGrupoDocente[];
}
