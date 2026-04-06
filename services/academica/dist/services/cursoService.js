"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursoService = void 0;
// src/services/cursoService.ts
const typeorm_1 = require("typeorm");
class CursoService {
    constructor(repo) {
        this.repo = repo;
    }
    normalize(dto) {
        if (dto.codigo)
            dto.codigo = dto.codigo.trim();
        if (dto.nombre)
            dto.nombre = dto.nombre.trim();
        return dto;
    }
    async getAll(params = {}) {
        if (params.planId)
            return this.findByPlan(params.planId);
        const where = [];
        if (params.q) {
            const q = params.q.trim();
            where.push({ nombre: (0, typeorm_1.ILike)(`%${q}%`) });
            where.push({ codigo: (0, typeorm_1.ILike)(`%${q}%`) });
        }
        return this.repo.find({
            where: where.length ? where : undefined,
            order: { id: 'DESC' },
        });
    }
    findOne(id) {
        return this.repo.findOneBy({ id });
    }
    async create(data) {
        this.normalize(data);
        if (!data.codigo || !data.nombre) {
            const err = new Error('codigo y nombre son obligatorios');
            err.status = 400;
            throw err;
        }
        const dup = await this.repo.findOne({
            where: { codigo: data.codigo },
        });
        if (dup) {
            const err = new Error('Ya existe un curso con ese código');
            err.status = 409;
            throw err;
        }
        const curso = this.repo.create(data);
        return this.repo.save(curso);
    }
    async update(id, data) {
        this.normalize(data);
        if (data.codigo) {
            const conflict = await this.repo
                .createQueryBuilder('c')
                .where('c.codigo = :codigo', { codigo: data.codigo })
                .andWhere('c.id <> :id', { id })
                .getOne();
            if (conflict) {
                const err = new Error('Otro curso ya usa ese código');
                err.status = 409;
                throw err;
            }
        }
        const curso = await this.repo.findOneBy({ id });
        if (!curso)
            return null;
        this.repo.merge(curso, data);
        return this.repo.save(curso);
    }
    async delete(id) {
        const res = await this.repo.delete(id);
        return (res.affected ?? 0) > 0;
    }
    /** usa la relación curso.planes -> pec.plan.id */
    findByPlan(planId) {
        return this.repo
            .createQueryBuilder('curso')
            .innerJoin('curso.planes', 'pec')
            .innerJoin('pec.plan', 'plan')
            .where('plan.id = :planId', { planId })
            .orderBy('curso.nombre', 'ASC')
            .getMany();
    }
}
exports.CursoService = CursoService;
//# sourceMappingURL=cursoService.js.map