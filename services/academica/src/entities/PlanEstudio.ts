import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { ProgramaAcademico } from './ProgramaAcademico';
import { RegistroPlanEstudio } from './RegistroPlanEstudio';
import { PlanEstudioCurso } from './PlanEstudioCurso';

@Entity({ name: 'planes_estudio' })
export class PlanEstudio {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ProgramaAcademico, (p) => p.planes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'programa_id' })
  programa!: ProgramaAcademico;

  @Column({ type: 'varchar' })
  version!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @OneToMany(() => RegistroPlanEstudio, (r) => r.planEstudio)
  registros!: RegistroPlanEstudio[];

  @OneToMany(() => PlanEstudioCurso, (pec) => pec.planEstudio)
  cursos!: PlanEstudioCurso[];
}
