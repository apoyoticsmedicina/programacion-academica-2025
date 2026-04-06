"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanesService = void 0;
const env_1 = require("../config/env");
class PlanesService {
    constructor(repo) {
        this.repo = repo;
    }
    normalize(dto) {
        if (dto.version)
            dto.version = dto.version.trim();
        if (dto.niveles !== undefined) {
            const raw = dto.niveles;
            const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
            dto.niveles = Number.isFinite(n) ? Math.trunc(n) : NaN;
        }
        return dto;
    }
    validateNiveles(niveles) {
        if (niveles === undefined)
            return; // en update puede no venir
        if (!Number.isInteger(niveles) || niveles <= 0) {
            const err = new Error('niveles debe ser un entero positivo');
            err.status = 400;
            throw err;
        }
    }
    async getAll(params = {}) {
        const page = Math.max(1, Number(params.page || 1));
        const take = Math.min(env_1.env.pagination.maxPageSize, Math.max(1, Number(params.pageSize || env_1.env.pagination.defaultPageSize)));
        const skip = (page - 1) * take;
        const qb = this.repo
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.programa', 'prog')
            .leftJoinAndSelect('p.cohorte', 'coh')
            .loadRelationCountAndMap('p.totalCursos', 'p.cursos')
            .orderBy('p.id', 'DESC')
            .skip(skip)
            .take(take);
        if (params.q) {
            qb.andWhere('p.version ILIKE :q', { q: `%${params.q.trim()}%` });
        }
        if (params.programa_id) {
            qb.andWhere('prog.id = :pid', { pid: Number(params.programa_id) });
        }
        if (params.id_cohorte) {
            qb.andWhere('coh.id = :cid', { cid: Number(params.id_cohorte) });
        }
        if (params.activo === 'true')
            qb.andWhere('p.activo = true');
        if (params.activo === 'false')
            qb.andWhere('p.activo = false');
        // ✅ filtro opcional por niveles
        if (params.niveles != null && String(params.niveles).trim() !== '') {
            const n = Number(String(params.niveles).trim());
            if (Number.isFinite(n))
                qb.andWhere('p.niveles = :niv', { niv: Math.trunc(n) });
        }
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, pageSize: take };
    }
    getById(id) {
        return this.repo.findOne({
            where: { id },
            relations: [
                'programa',
                'cohorte',
                'cursos',
                'cursos.curso',
                'cursos.tipo',
            ],
        });
    }
    async create(dto) {
        this.normalize(dto);
        // ✅ requerido al crear
        if (dto.niveles === undefined) {
            const err = new Error('niveles es obligatorio');
            err.status = 400;
            throw err;
        }
        this.validateNiveles(dto.niveles);
        const dup = await this.repo.findOne({
            where: {
                programa: { id: dto.programa_id },
                version: dto.version,
                cohorte: { id: dto.id_cohorte },
            },
            relations: ['programa', 'cohorte'],
        });
        if (dup) {
            const err = new Error('Ya existe un plan con ese Programa + Versión + Cohorte');
            err.status = 409;
            throw err;
        }
        const ent = this.repo.create({
            version: dto.version,
            activo: dto.activo ?? true,
            niveles: dto.niveles,
            programa: { id: dto.programa_id },
            cohorte: { id: dto.id_cohorte },
        });
        await this.repo.save(ent);
        return this.getById(ent.id);
    }
    async update(id, dto) {
        this.normalize(dto);
        // ✅ si viene niveles en update, validar
        if (dto.niveles !== undefined) {
            this.validateNiveles(dto.niveles);
        }
        await this.repo.update({ id }, dto);
        const updated = await this.getById(id);
        if (!updated) {
            const err = new Error('Plan de estudio no encontrado');
            err.status = 404;
            throw err;
        }
        return updated;
    }
    async remove(id) {
        await this.repo.delete(id);
    }
}
exports.PlanesService = PlanesService;
//# sourceMappingURL=planEstudioService.js.map