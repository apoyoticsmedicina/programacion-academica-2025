import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({ name: "estados_servidor" })
export class EstadoServidor {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100, unique: true })
    estado!: string;

    /**
     * Solo puede existir 1 registro con activo=true al tiempo (enforced por índice parcial).
     */
    @Column({ type: "boolean", default: false })
    activo!: boolean;

    /**
     * Ventana de tiempo opcional (solo para estados temporales).
     * Para 'idle (lectura)' normalmente queda NULL/NULL.
     */
    @Column({ type: "timestamptz", nullable: true })
    activo_desde?: Date | null;

    @Column({ type: "timestamptz", nullable: true })
    activo_hasta?: Date | null;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt!: Date;
}