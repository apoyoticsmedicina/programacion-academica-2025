import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from "typeorm";
import { Usuario } from "./Usuario";
import { Curso } from "./Curso";
import { ProgramaCurso } from "./ProgramaCurso";

export type EstadoSolicitudCambio = "pendiente" | "aprobada" | "rechazada";

/**
 * Misma forma que payload de upsertAvanzado()
 */
export type PropuestaAvanzadoPayload = {
    perfil?: string | null;
    intencionalidades_formativas?: string | null;
    aportes_curso_formacion?: string | null;
    descripcion_conocimientos?: string | null;
    vigencia?: string | null;

    estrategias?: number[];
    medios_recursos?: string | null;
    formas_interaccion?: string | null;
    estrategias_internacionalizacion?: string | null;
    estrategias_enfoque?: string | null;

    evaluacion?: Array<{ momentos_evaluacion?: string; porcentaje?: number }>;
    bibliografia?: Array<{
        cultura?: string | null;
        referencia?: string;
        palabras_clave?: string | null;
    }>;
    comunidad?: Array<{
        docente_id: number;
        nombre?: string | null;
        unidad_academica?: string | null;
        porcentaje?: number;
    }>;
};

@Entity({ name: "solicitudes_cambio" })
export class SolicitudCambio {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Curso, { nullable: false, onDelete: "RESTRICT" })
    @JoinColumn({ name: "curso_id" })
    @Index("IDX_sc_curso")
    curso!: Curso;

    @ManyToOne(() => ProgramaCurso, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "programa_curso_id" })
    @Index("IDX_sc_programa_curso")
    programaCurso!: ProgramaCurso;

    @ManyToOne(() => Usuario, { nullable: false, onDelete: "RESTRICT" })
    @JoinColumn({ name: "solicitante_id" })
    @Index("IDX_sc_solicitante")
    solicitante!: Usuario;

    @Column({ type: "varchar", default: "pendiente" })
    @Index("IDX_sc_estado")
    estado!: EstadoSolicitudCambio;

    @Column({ type: "text", nullable: true })
    motivo?: string | null;

    // propuesta guardada tal cual (payload de upsertAvanzado)
    @Column({ type: "jsonb", default: () => "'{}'::jsonb" })
    propuesta!: PropuestaAvanzadoPayload;

    // opcional: snapshot del estado actual para auditoría / comparación en UI admin
    @Column({ type: "jsonb", nullable: true })
    snapshot?: PropuestaAvanzadoPayload | null;

    @Column({ type: "text", nullable: true })
    comentario_admin?: string | null;

    @ManyToOne(() => Usuario, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "resuelto_por" })
    resueltoPor?: Usuario | null;

    @Column({ type: "timestamptz", nullable: true })
    resuelto_en?: Date | null;

    @Column({ type: "timestamptz", default: () => "now()" })
    creado_en!: Date;

    @Column({ type: "timestamptz", default: () => "now()" })
    actualizado_en!: Date;
}