import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { PlanEstudio } from './PlanEstudio';
import { Curso } from './Curso';

@Entity({ name: 'plan_estudio_cursos' })
export class PlanEstudioCurso {
  @PrimaryColumn({ name: 'plan_estudio_id', type: 'int' })
  planEstudioId!: number;

  @PrimaryColumn({ name: 'curso_id', type: 'int' })
  cursoId!: number;

  @Column({ name: 'obligatorio', type: 'boolean', default: true })
  obligatorio!: boolean;

  @Column({ name: 'es_electiva', type: 'boolean', default: false })
  esElectiva!: boolean;

  @Column({ name: 'orden', type: 'int', nullable: true })
  orden!: number | null;

  @ManyToOne(() => PlanEstudio, (pe) => pe.cursos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_estudio_id', referencedColumnName: 'id' })
  planEstudio!: PlanEstudio;

  @ManyToOne(() => Curso, (c) => c.planesEstudio, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_id', referencedColumnName: 'id' })
  curso!: Curso;
}
