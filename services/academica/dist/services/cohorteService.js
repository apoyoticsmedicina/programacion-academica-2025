"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CohorteService = void 0;
const env_1 = require("../config/env");
class CohorteService {
    constructor(repo) {
        this.repo = repo;
    }
    normalize(dto) {
        if (dto.periodo)
            dto.periodo = dto.periodo.trim();
        return dto;
    }
    assertFechas(dto) {
        if (dto.fecha_inicio && dto.fecha_fin) {
            const fi = new Date(dto.fecha_inicio);
            const ff = new Date(dto.fecha_fin);
            if (isFinite(fi.getTime()) && isFinite(ff.getTime()) && ff < fi) {
                const err = new Error('fecha_fin no puede ser menor a fecha_inicio');
                err.status = 400;
                throw err;
            }
        }
    }
    async getAll(params = {}) {
        const page = Math.max(1, Number(params.page || 1));
        // 🔧 ahora usa los valores de env.pagination
        const take = Math.min(env_1.env.pagination.maxPageSize, Math.max(1, Number(params.pageSize || env_1.env.pagination.defaultPageSize)));
        const skip = (page - 1) * take;
        const qb = this.repo
            .createQueryBuilder('c')
            .orderBy('c.id', 'DESC')
            .skip(skip)
            .take(take);
        if (params.q) {
            qb.andWhere('c.periodo ILIKE :q', {
                q: `%${params.q.trim()}%`,
            });
        }
        if (params.desde)
            qb.andWhere('c.fecha_inicio >= :d', { d: params.desde });
        if (params.hasta)
            qb.andWhere('c.fecha_fin <= :h', { h: params.hasta });
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, pageSize: take };
    }
    getById(id) {
        return this.repo.findOne({
            where: { id },
            relations: ['planes'], // si no quieres cargar planes aquí, quítalo
        });
    }
    async create(dto) {
        this.normalize(dto);
        this.assertFechas(dto);
        // anti-duplicado por periodo (además del @Unique)
        if (dto.periodo) {
            const dup = await this.repo.findOne({
                where: { periodo: dto.periodo },
            });
            if (dup) {
                const err = new Error('Ya existe una cohorte con ese periodo');
                err.status = 409;
                throw err;
            }
        }
        const ent = this.repo.create(dto);
        await this.repo.save(ent);
        return this.getById(ent.id);
    }
    async update(id, dto) {
        this.normalize(dto);
        this.assertFechas(dto);
        if (dto.periodo) {
            const conflict = await this.repo
                .createQueryBuilder('c')
                .where('c.periodo = :p', { p: dto.periodo })
                .andWhere('c.id <> :id', { id })
                .getOne();
            if (conflict) {
                const err = new Error('Otra cohorte ya usa ese periodo');
                err.status = 409;
                throw err;
            }
        }
        await this.repo.update({ id }, dto);
        const updated = await this.getById(id);
        if (!updated) {
            const err = new Error('Cohorte no encontrada');
            err.status = 404;
            throw err;
        }
        return updated;
    }
    async remove(id) {
        await this.repo.delete(id);
    }
}
exports.CohorteService = CohorteService;
//# sourceMappingURL=cohorteService.js.map