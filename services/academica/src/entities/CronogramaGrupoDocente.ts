import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { CronogramaGrupo } from "./CronogramaGrupo";
import { Docente } from "./Docente";

@Entity({ name: "cronograma_grupos_docentes" })
export class CronogramaGrupoDocente {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "grupo_id" })
    grupoId!: number;

    @ManyToOne(() => CronogramaGrupo, (g) => g.docentes, { onDelete: "CASCADE" })
    @JoinColumn({ name: "grupo_id" })
    grupo!: CronogramaGrupo;

    @Column({ name: "docente_id" })
    docenteId!: number;

    @ManyToOne(() => Docente, (d) => d.gruposCronograma, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "docente_id" })
    docente!: Docente;

    @Column({ type: "int", default: 0 })
    horas!: number; // horas asignadas a ese docente en ese grupo
}
