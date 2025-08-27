import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PlanEstudio } from './PlanEstudio';

@Entity({ name: 'programas_academicos' })
export class ProgramaAcademico {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  nombre!: string;

  @Column({ type: 'varchar' })
  tipo!: string; // "pregrado" | "posgrado"

  @OneToMany(() => PlanEstudio, (p) => p.programa)
  planes!: PlanEstudio[];
}
