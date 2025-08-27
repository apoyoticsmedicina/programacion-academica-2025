import {
  Entity, PrimaryColumn, ManyToOne, JoinColumn, Column,
} from 'typeorm';
import { Curso } from './Curso';

@Entity({ name: 'cursos_requisitos' })
export class CursoRequisito {
  @PrimaryColumn({ name: 'curso_id', type: 'int' })
  cursoId!: number;

  @PrimaryColumn({ name: 'requisito_id', type: 'int' })
  requisitoId!: number;

  @PrimaryColumn({ name: 'tipo', type: 'varchar' })
  tipo!: string; // "prerrequisito" | "correquisito"

  @ManyToOne(() => Curso, (c) => c.requisitosComoDestino, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'curso_id' })
  curso!: Curso;

  @ManyToOne(() => Curso, (c) => c.requisitosComoOrigen, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requisito_id' })
  requisito!: Curso;
}
