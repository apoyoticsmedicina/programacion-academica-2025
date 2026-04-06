"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorasCursoService = void 0;
class HorasCursoService {
    constructor(repo) {
        this.repo = repo;
    }
    toInt(v, def = 0) {
        const n = Number(v);
        return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : def;
    }
    /** Calcula totales si no vienen; valida que no haya negativos. */
    normalize(dto) {
        const p_e = this.toInt(dto.h_semanales_p_e, dto.h_semanales_p_e ?? 0);
        const t_i = this.toInt(dto.h_semanales_t_i, dto.h_semanales_t_i ?? 0);
        const aat = this.toInt(dto.h_semanales_a_a_t, dto.h_semanales_a_a_t ?? 0);
        const aap = this.toInt(dto.h_semanales_a_a_p, dto.h_semanales_a_a_p ?? 0);
        const aatp = this.toInt(dto.h_semanales_a_a_t_p, dto.h_semanales_a_a_t_p ?? 0);
        const patch = {
            h_semanales_p_e: p_e,
            h_semanales_t_i: t_i,
            h_semanales_a_a_t: aat,
            h_semanales_a_a_p: aap,
            h_semanales_a_a_t_p: aatp,
        };
        if (dto.h_totales_curso === undefined || dto.h_totales_curso === null) {
            patch.h_totales_curso = p_e + t_i + aat + aap + aatp;
        }
        else {
            patch.h_totales_curso = this.toInt(dto.h_totales_curso, 0);
        }
        return patch;
    }
    listByProgramaCurso(programaCursoId) {
        return this.repo.find({
            where: { programaCurso: { id: programaCursoId } },
            order: { id: "ASC" },
        });
    }
    getById(id) {
        return this.repo.findOne({
            where: { id },
            relations: ["programaCurso", "programaCurso.planCurso", "programaCurso.planCurso.curso"],
        });
    }
    async createForProgramaCurso(programaCursoId, dto) {
        const data = this.normalize(dto);
        const ent = this.repo.create({
            ...data,
            programaCurso: { id: programaCursoId },
        });
        await this.repo.save(ent);
        return this.getById(ent.id);
    }
    async update(id, dto) {
        const data = this.normalize(dto);
        await this.repo.update({ id }, data);
        const updated = await this.getById(id);
        if (!updated) {
            const err = new Error("HorasCurso no encontrado");
            err.status = 404;
            throw err;
        }
        return updated;
    }
    async remove(id) {
        await this.repo.delete(id);
    }
}
exports.HorasCursoService = HorasCursoService;
//# sourceMappingURL=horasCursoService.js.map