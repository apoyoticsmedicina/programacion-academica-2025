import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { CursoDocente } from './CursoDocente';

@Entity({ name: 'cronogramas' })
export class Cronograma {
  @PrimaryGeneratedColumn()
  id!: number;

  // columnas que participan en el FK compuesto hacia cursos_docentes
  @Column({ name: 'curso_id', type: 'int' })
  cursoId!: number;

  @Column({ name: 'docente_id', type: 'int' })
  docenteId!: number;

  @ManyToOne(() => CursoDocente, (cd) => cd.cronogramas, { onDelete: 'RESTRICT' })
  @JoinColumn([
    { name: 'curso_id', referencedColumnName: 'cursoId' },
    { name: 'docente_id', referencedColumnName: 'docenteId' },
  ])
  cursoDocente!: CursoDocente;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin!: string;

  @Column({ name: 'hora_inicio', type: 'time' })
  horaInicio!: string;

  @Column({ name: 'hora_fin', type: 'time' })
  horaFin!: string;

  @Column({ type: 'text', nullable: true })
  contenido?: string;

  @Column({ type: 'text', nullable: true })
  metodologia?: string;

  @Column({ name: 'tipo_actividad', type: 'varchar', nullable: true })
  tipoActividad?: string;

  @Column({ type: 'varchar', nullable: true })
  subgrupo?: string;
}
