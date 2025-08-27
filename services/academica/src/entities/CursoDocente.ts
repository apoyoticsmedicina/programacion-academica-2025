import {
  Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Curso } from './Curso';
import { Docente } from './Docente';
import { Cronograma } from './Cronograma';

@Entity({ name: 'cursos_docentes' })
export class CursoDocente {
  @PrimaryColumn({ name: 'curso_id', type: 'int' })
  cursoId!: number;

  @PrimaryColumn({ name: 'docente_id', type: 'int' })
  docenteId!: number;

  @ManyToOne(() => Curso, (c) => c.docentes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_id' })
  curso!: Curso;

  @ManyToOne(() => Docente, (d) => d.cursos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'docente_id' })
  docente!: Docente;

  @Column({ type: 'numeric', nullable: true })
  porcentaje?: string;

  @Column({ type: 'varchar', nullable: true })
  frecuencia?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @OneToMany(() => Cronograma, (cr) => cr.cursoDocente)
  cronogramas!: Cronograma[];
}
