import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Curso } from './Curso';

@Entity({ name: 'solicitudes_cambio' })
export class SolicitudCambio {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Curso, (c) => c.solicitudes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_id' })
  curso!: Curso;

  @Column({ name: 'tipo_solicitud', type: 'varchar' })
  tipoSolicitud!: string;

  @Column({ type: 'varchar' })
  estado!: string;

  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo?: string;

  @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion!: Date;

  @Column({
    name: 'fecha_actualizacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  fechaActualizacion!: Date;
}
