import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { PlanEstudioCurso } from "./PlanDeEstudioCurso";
import { CaracteristicasCurso } from "./CaracteristicasCurso";
import { ClaseCurso } from "./ClaseCurso";
import { ModalidadCurso } from "./ModalidadCurso";
import { ProgramaDocente } from "./ProgramaDocente";
import { HorasCurso } from "./HorasCurso";
import { ProgramaCursoRequisito } from "./ProgramaCursoRequisito";
import { ProgramaMetodologiaEstrategia } from "./ProgramaMetodologiaEstrategia";
import { ProgramaMetodologia } from "./ProgramaMetodologia";
import { ProgramaEvaluacion } from "./ProgramaEvaluacion";
import { ProgramaBibliografia } from "./ProgramaBibliografia";

@Entity({ name: "programas_curso" })
export class ProgramaCurso {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => PlanEstudioCurso, (pec) => pec.programasCurso, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "id_plan_estudio_curso" })
  planCurso!: PlanEstudioCurso;

  @Column({ type: "varchar" })
  unidad_academica!: string;

  @ManyToOne(() => CaracteristicasCurso, (car) => car.programas, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "id_caracteristicas" })
  caracteristicas!: CaracteristicasCurso;

  @ManyToOne(() => ClaseCurso, (cl) => cl.programas, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "id_clase_curso" })
  clase!: ClaseCurso;

  @ManyToOne(() => ModalidadCurso, (mo) => mo.programas, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "id_modalidad_curso" })
  modalidad!: ModalidadCurso;

  @Column({ type: "varchar", nullable: true })
  nucleo_curso?: string;

  @Column({ type: "varchar", nullable: true })
  vigencia?: string;

  /* ========= NUEVOS CAMPOS ========= */
  @Column({ type: "text", nullable: true })
  perfil?: string;

  @Column({
    name: "intencionalidades_formativas",
    type: "text",
    nullable: true,
  })
  intencionalidadesFormativas?: string;

  @Column({ name: "aportes_curso_formacion", type: "text", nullable: true })
  aportesCursoFormacion?: string;

  @Column({ name: "descripcion_conocimientos", type: "text", nullable: true })
  descripcionConocimientos?: string;

  // créditos numéricos (p.ej. 3, 3.5, etc.)
  @Column({
    name: "creditos",
    type: "numeric",
    precision: 5,
    scale: 2,
    nullable: true,
  })
  creditos?: number;
  /* ================================= */

  // Relaciones
  @OneToMany(() => ProgramaDocente, (pd) => pd.programaCurso)
  docentes!: ProgramaDocente[];

  @OneToMany(() => HorasCurso, (hc) => hc.programaCurso)
  horas!: HorasCurso[];

  @OneToMany(() => ProgramaCursoRequisito, (r) => r.programaCurso)
  requisitos!: ProgramaCursoRequisito[];

  // Metodología general (campos de texto) - conceptualmente 1:1
  @OneToMany(() => ProgramaMetodologia, (pm) => pm.programaCurso)
  metodologia!: ProgramaMetodologia[];

  // Estrategias didácticas (muchas por programa)
  @OneToMany(
    () => ProgramaMetodologiaEstrategia,
    (pme: ProgramaMetodologiaEstrategia) => pme.programaCurso
  )
  estrategiasMetodologicas!: ProgramaMetodologiaEstrategia[];

  @OneToMany(() => ProgramaEvaluacion, (pe) => pe.programaCurso)
  evaluaciones!: ProgramaEvaluacion[];

  @OneToMany(() => ProgramaBibliografia, (b) => b.programaCurso)
  bibliografia!: ProgramaBibliografia[];
}
