"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronogramasService = exports.CronogramasService = void 0;
// src/services/cronogramas.service.ts
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const CronogramaGrupo_1 = require("../entities/CronogramaGrupo");
const CronogramaGrupoDocente_1 = require("../entities/CronogramaGrupoDocente");
class CronogramasService {
    constructor() {
        this.grupoRepo = data_source_1.AppDataSource.getRepository(CronogramaGrupo_1.CronogramaGrupo);
        this.grupoDocenteRepo = data_source_1.AppDataSource.getRepository(CronogramaGrupoDocente_1.CronogramaGrupoDocente);
    }
    async getByCurso(cursoId) {
        const grupos = await this.grupoRepo.find({
            where: { cursoId },
            relations: ["docentes"],
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
    async replaceForCurso(cursoId, gruposInput) {
        return data_source_1.AppDataSource.transaction(async (manager) => {
            const grupoRepoTx = manager.getRepository(CronogramaGrupo_1.CronogramaGrupo);
            const grupoDocenteRepoTx = manager.getRepository(CronogramaGrupoDocente_1.CronogramaGrupoDocente);
            // 1) Borrar los grupos actuales de ese curso (y sus docentes)
            const gruposExistentes = await grupoRepoTx.find({
                where: { cursoId },
            });
            if (gruposExistentes.length) {
                const ids = gruposExistentes.map((g) => g.id);
                await grupoDocenteRepoTx.delete({ grupoId: (0, typeorm_1.In)(ids) });
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
                    if (!d.docenteId || d.horas == null || d.horas <= 0)
                        continue;
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
exports.CronogramasService = CronogramasService;
exports.cronogramasService = new CronogramasService();
//# sourceMappingURL=cronogramasService.js.map