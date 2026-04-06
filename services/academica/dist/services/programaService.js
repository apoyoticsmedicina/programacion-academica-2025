"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramasService = void 0;
// src/services/programaService.ts
const typeorm_1 = require("typeorm");
const env_1 = require("../config/env");
class ProgramasService {
    constructor(repo) {
        this.repo = repo;
    }
    normalize(data) {
        if (data.nombre)
            data.nombre = data.nombre.trim();
        if (data.tipo)
            data.tipo = data.tipo.trim().toLowerCase();
        if (data.codigo !== undefined) {
            const raw = data.codigo;
            const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
            data.codigo = Number.isFinite(n) ? n : NaN;
        }
        return data;
    }
    validateCodigo(codigo) {
        if (codigo === undefined)
            return; // en update puede no venir
        if (!Number.isInteger(codigo) || codigo <= 0) {
            const err = new Error('codigo debe ser un entero positivo');
            err.status = 400;
            throw err;
        }
    }
    async getAll(params = {}) {
        const page = Math.max(1, Number(params.page || 1));
        // 🔧 paginación basada en variables de entorno
        const take = Math.min(env_1.env.pagination.maxPageSize, Math.max(1, Number(params.pageSize || env_1.env.pagination.defaultPageSize)));
        const skip = (page - 1) * take;
        const where = {};
        if (params.q)
            where.nombre = (0, typeorm_1.ILike)(`%${params.q.trim()}%`);
        if (params.tipo)
            where.tipo = params.tipo.trim().toLowerCase();
        if (params.codigo != null && String(params.codigo).trim() !== '') {
            const codigo = Number(String(params.codigo).trim());
            if (Number.isFinite(codigo))
                where.codigo = codigo;
        }
        const [items, total] = await this.repo.findAndCount({
            where,
            order: { id: 'DESC' },
            skip,
            take,
        });
        return { items, total, page, pageSize: take };
    }
    async getById(id) {
        return this.repo.findOneBy({ id });
    }
    async create(data) {
        this.normalize(data);
        // ✅ requerido para crear
        if (data.codigo === undefined) {
            const err = new Error('codigo es obligatorio');
            err.status = 400;
            throw err;
        }
        this.validateCodigo(data.codigo);
        // 1) Unicidad por código
        const existsByCodigo = await this.repo.findOne({
            where: { codigo: data.codigo },
            withDeleted: false,
        });
        if (existsByCodigo) {
            const err = new Error('Ya existe un programa con ese código');
            err.status = 409;
            throw err;
        }
        // 2) (Opcional) Mantener tu regla actual: nombre+tipo únicos
        const existsByNombreTipo = await this.repo.findOne({
            where: { nombre: data.nombre, tipo: data.tipo },
            withDeleted: false,
        });
        if (existsByNombreTipo) {
            const err = new Error('Ya existe un programa con ese nombre y tipo');
            err.status = 409;
            throw err;
        }
        const ent = this.repo.create(data);
        return this.repo.save(ent);
    }
    async update(id, data) {
        this.normalize(data);
        // ✅ si viene codigo en update, validar y chequear conflicto
        if (data.codigo !== undefined) {
            this.validateCodigo(data.codigo);
            const conflictCodigo = await this.repo
                .createQueryBuilder('p')
                .where('p.codigo = :codigo', { codigo: data.codigo })
                .andWhere('p.id <> :id', { id })
                .getOne();
            if (conflictCodigo) {
                const err = new Error('Otro programa con ese código ya existe');
                err.status = 409;
                throw err;
            }
        }
        // ✅ tu regla de conflicto por nombre+tipo (solo si ambos vienen o si cambian)
        if (data.nombre || data.tipo) {
            const nombre = (data.nombre ?? '').trim();
            const tipo = (data.tipo ?? '').trim().toLowerCase();
            if (nombre && tipo) {
                const conflict = await this.repo
                    .createQueryBuilder('p')
                    .where('LOWER(TRIM(p.nombre)) = LOWER(TRIM(:nombre))', { nombre })
                    .andWhere('p.tipo = :tipo', { tipo })
                    .andWhere('p.id <> :id', { id })
                    .getOne();
                if (conflict) {
                    const err = new Error('Otro programa con ese nombre y tipo ya existe');
                    err.status = 409;
                    throw err;
                }
            }
        }
        await this.repo.update({ id }, data);
        const updated = await this.getById(id);
        if (!updated) {
            const err = new Error('Programa no encontrado');
            err.status = 404;
            throw err;
        }
        return updated;
    }
    async remove(id) {
        await this.repo.delete(id);
    }
}
exports.ProgramasService = ProgramasService;
//# sourceMappingURL=programaService.js.map