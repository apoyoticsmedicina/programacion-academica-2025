import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Curso } from './Curso';

@Entity({ name: 'curso_detalle' })
export class CursoDetalle {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Curso, (c) => c.detalle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_id' })
  curso!: Curso;

  @Column({ name: 'descripcion_general', type: 'text', nullable: true })
  descripcionGeneral?: string;

  @Column({ name: 'informacion_especifica', type: 'text', nullable: true })
  informacionEspecifica?: string;

  @Column({ type: 'text', nullable: true })
  metodologia?: string;

  @Column({ name: 'profesores_autores', type: 'text', nullable: true })
  profesoresAutores?: string;

  @Column({ name: 'acta_aprobacion', type: 'text', nullable: true })
  actaAprobacion?: string;
}
