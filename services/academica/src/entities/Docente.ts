import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CursoDocente } from './CursoDocente';

@Entity({ name: 'docentes' })
export class Docente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  documento!: string;

  @Column({ type: 'varchar' })
  nombres!: string;

  @Column({ type: 'varchar' })
  apellidos!: string;

  @Column({ type: 'varchar' })
  vinculacion!: string;

  @Column({ type: 'varchar' })
  dedicacion!: string;

  @Column({ type: 'varchar' })
  departamento!: string;

  @Column({ type: 'varchar' })
  seccion!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @OneToMany(() => CursoDocente, (cd) => cd.docente)
  cursos!: CursoDocente[];
}
