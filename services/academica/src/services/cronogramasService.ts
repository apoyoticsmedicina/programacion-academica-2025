// src/services/cronogramas.service.ts
import { In } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { CronogramaGrupo } from "../entities/CronogramaGrupo";
import { CronogramaGrupoDocente } from "../entities/CronogramaGrupoDocente";

export type CronogramaDocenteInput = {
    docenteId: number;
    horas: number;
};

export type CronogramaGrupoInput = {
    id?: number;
    nombre: string;
    docentes: CronogramaDocenteInput[];
};

export class CronogramasService {
    private grupoRepo = AppDataSource.getRepository(CronogramaGrupo);
    private grupoDocenteRepo = AppDataSource.getRepository(CronogramaGrupoDocente);

    async getByCurso(cursoId: number) {
        const grupos = await this.grupoRepo.find({
            where: { cursoId },
            relations: ["docentes"], // si quieres incluir datos de docente completo, agrega "docentes.docente"
            order: { id: "ASC" },
        });

        // Normalizamos a la misma estructura que usa el frontend
        return grupos.map((g) => ({
            id: g.id,
            nombre: g.nombre,
            docentes: (g.docentes || []).map((d) => ({
                id: d.id,
                docenteId: d.docenteId,
                horas: d.horas,
            })),
        }));
    }

    /**
     * Reemplaza completamente los grupos de un curso:
     * borra los existentes y crea los nuevos.
     */
    async replaceForCurso(
        cursoId: number,
        gruposInput: CronogramaGrupoInput[]
    ) {
        return AppDataSource.transaction(async (manager) => {
            const grupoRepoTx = manager.getRepository(CronogramaGrupo);
            const grupoDocenteRepoTx = manager.getRepository(CronogramaGrupoDocente);

            // 1) Borrar los grupos actuales de ese curso (y sus docentes)
            const gruposExistentes = await grupoRepoTx.find({
                where: { cursoId },
            });

            if (gruposExistentes.length) {
                const ids = gruposExistentes.map((g) => g.id);
                await grupoDocenteRepoTx.delete({ grupoId: In(ids as number[]) });
                await grupoRepoTx.delete({ cursoId });
            }

            // 2) Crear los nuevos grupos
            for (const g of gruposInput) {
                const grupo = grupoRepoTx.create({
                    cursoId,
                    nombre: g.nombre || "Grupo",
                });
                const savedGrupo = await grupoRepoTx.save(grupo);

                for (const d of g.docentes || []) {
                    if (!d.docenteId || d.horas == null || d.horas <= 0) continue;

                    const gd = grupoDocenteRepoTx.create({
                        grupoId: savedGrupo.id,
                        docenteId: d.docenteId,
                        horas: d.horas,
                    });
                    await grupoDocenteRepoTx.save(gd);
                }
            }

            // 3) Devolver el estado final
            return this.getByCurso(cursoId);
        });
    }
}

export const cronogramasService = new CronogramasService();
