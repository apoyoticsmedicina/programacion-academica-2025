import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
    Unique,
} from "typeorm";
import { Usuario } from "./Usuario";
import { Curso } from "./Curso";

@Entity({ name: "usuarios_cursos" })
@Unique("UQ_uc_usuario_curso", ["usuario", "curso"])
export class UsuarioCurso {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Usuario, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "usuario_id" })
    @Index("IDX_uc_usuario")
    usuario!: Usuario;

    @ManyToOne(() => Curso, { nullable: false, onDelete: "RESTRICT" })
    @JoinColumn({ name: "curso_id" })
    @Index("IDX_uc_curso")
    curso!: Curso;

    @CreateDateColumn({ type: "timestamptz", name: "creado_en" })
    creado_en!: Date;
}