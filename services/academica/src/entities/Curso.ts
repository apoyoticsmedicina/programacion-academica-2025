import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from "typeorm";
import { PlanEstudioCurso } from "./PlanEstudioCurso";
import { CursoDetalle } from "./CursoDetalle";
import { CursoRequisito } from "./RequisitosCurso";
import { CursoDocente } from "./CursoDocente";
import { SolicitudCambio } from "./SolicitudCambio";

@Entity({ name: "cursos" })
export class Curso {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 50, unique: true })
  codigo!: string;

  @Column({ type: "varchar", length: 255 })
  nombre!: string;

  @Column({ type: "varchar", length: 50 })
  nivel!: string;

  @Column({ type: "boolean", default: true })
  habilitado!: boolean;

  @Column({ type: "int", default: 0 })
  HTI!: number;

  @Column({ type: "int", default: 0 })
  HTC!: number;

  @Column({ type: "int", default: 0 })
  HTE!: number;

  @OneToMany(() => PlanEstudioCurso, (pec) => pec.curso)
  planesEstudio!: PlanEstudioCurso[];

  @OneToOne(() => CursoDetalle, (det) => det.curso)
  detalle?: CursoDetalle;

  @OneToMany(() => CursoRequisito, (cr) => cr.curso)
  requisitosComoDestino!: CursoRequisito[];

  @OneToMany(() => CursoRequisito, (cr) => cr.requisito)
  requisitosComoOrigen!: CursoRequisito[];

  @OneToMany(() => CursoDocente, (cd) => cd.curso)
  docentes!: CursoDocente[];

  @OneToMany(() => SolicitudCambio, (sc) => sc.curso)
  solicitudes!: SolicitudCambio[];
}
