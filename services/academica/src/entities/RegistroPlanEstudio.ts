import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PlanEstudio } from './PlanEstudio';

@Entity({ name: 'registro_plan_estudio' })
export class RegistroPlanEstudio {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PlanEstudio, (p) => p.registros, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_estudio_id' })
  planEstudio!: PlanEstudio;

  @Column({ name: 'año', type: 'int' })
  anio!: number;

  @Column({ type: 'varchar' })
  periodo!: string; // "I" | "II" | etc.
}
