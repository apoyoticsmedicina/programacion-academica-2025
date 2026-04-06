"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanEstudioCursoService = void 0;
class PlanEstudioCursoService {
    constructor(repo) {
        this.repo = repo;
    }
    async getAll(params = {}) {
        const qb = this.repo
            .createQueryBuilder('pec')
            .leftJoinAndSelect('pec.plan', 'plan')
            .leftJoinAndSelect('pec.curso', 'curso')
            .leftJoinAndSelect('pec.tipo', 'tipo')
            // ✅ ahora ordenamos por nivel (puede haber nulls)
            .orderBy('pec.nivel', 'ASC', 'NULLS LAST')
            .addOrderBy('pec.id', 'DESC');
        if (params.plan_estudio_id) {
            qb.andWhere('plan.id = :pid', { pid: params.plan_estudio_id });
        }
        if (params.curso_id) {
            qb.andWhere('curso.id = :cid', { cid: params.curso_id });
        }
        if (params.tipo_curso_id) {
            qb.andWhere('tipo.id = :tid', { tid: params.tipo_curso_id });
        }
        return qb.getMany();
    }
    getById(id) {
        return this.repo.findOne({
            where: { id },
            relations: ['plan', 'curso', 'tipo'],
        });
    }
    async create(dto) {
        // anti-duplicado (además del @Unique)
        const dup = await this.repo.findOne({
            where: {
                plan: { id: dto.plan_estudio_id },
                curso: { id: dto.curso_id },
            },
            relations: ['plan', 'curso'],
        });
        if (dup) {
            const err = new Error('Ese curso ya existe en el plan de estudio');
            err.status = 409;
            throw err;
        }
        // ✅ toma nivel; si no viene, usa orden como fallback
        const nivel = dto.nivel !== undefined ? dto.nivel : dto.orden !== undefined ? dto.orden : undefined;
        // (opcional) validar nivel si quieres: entero >= 1
        if (nivel !== undefined) {
            if (!Number.isInteger(nivel) || nivel <= 0) {
                const err = new Error('nivel debe ser un entero positivo');
                err.status = 400;
                throw err;
            }
        }
        const ent = this.repo.create({
            plan: { id: dto.plan_estudio_id },
            curso: { id: dto.curso_id },
            tipo: { id: dto.tipo_curso_id },
            nivel,
        });
        await this.repo.save(ent);
        return this.getById(ent.id);
    }
    async update(id, dto) {
        const patch = {};
        if (dto.tipo_curso_id)
            patch.tipo = { id: dto.tipo_curso_id };
        // ✅ nivel (con fallback a orden)
        const nivel = dto.nivel !== undefined ? dto.nivel : dto.orden !== undefined ? dto.orden : undefined;
        if (nivel !== undefined) {
            if (!Number.isInteger(nivel) || nivel <= 0) {
                const err = new Error('nivel debe ser un entero positivo');
                err.status = 400;
                throw err;
            }
            patch.nivel = nivel;
        }
        await this.repo.update({ id }, patch);
        const updated = await this.getById(id);
        if (!updated) {
            const err = new Error('PlanEstudioCurso no encontrado');
            err.status = 404;
            throw err;
        }
        return updated;
    }
    async remove(id) {
        await this.repo.delete(id);
    }
}
exports.PlanEstudioCursoService = PlanEstudioCursoService;
//# sourceMappingURL=planEstudioCursoService.js.map