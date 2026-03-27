import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Curso } from "./Curso";
import { CronogramaGrupoDocente } from "./CronogramaGrupoDocente";

@Entity({ name: "cronograma_grupos" })
export class CronogramaGrupo {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "curso_id" })
    cursoId!: number;

    @ManyToOne(() => Curso, (c) => c.gruposCronograma, { onDelete: "CASCADE" })
    @JoinColumn({ name: "curso_id" })
    curso!: Curso;

    @Column({ type: "varchar", length: 100 })
    nombre!: string; // "Grupo 1", "Grupo A", etc.

    @OneToMany(() => CronogramaGrupoDocente, (gd) => gd.grupo)
    docentes!: CronogramaGrupoDocente[];
}
