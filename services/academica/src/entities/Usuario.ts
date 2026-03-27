import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { OneToMany } from "typeorm";
import { UsuarioCurso } from "./UsuarioCurso";

export type RolUsuario = 'superadmin' | 'admin' | 'coordinador de programa' | 'coordinador de curso' | 'docente';

@Entity({ name: "usuarios" })
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", unique: true })
  email!: string;

  @Column({ type: "varchar", default: "docente" })
  rol!: RolUsuario;

  @Column({ type: "varchar", nullable: true })
  nombre?: string;

  @Column({ type: "varchar", nullable: true })
  foto?: string;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  creado_en!: Date;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  actualizado_en!: Date;

  @Column({ type: "timestamptz", nullable: true })
  ultimo_login?: Date;

  @OneToMany(() => UsuarioCurso, (uc) => uc.usuario)
  cursosAsignados!: UsuarioCurso[];
}
