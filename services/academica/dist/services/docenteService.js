"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocenteService = void 0;
const env_1 = require("../config/env");
class DocenteService {
    constructor(repo) {
        this.repo = repo;
    }
    normalize(dto) {
        if (dto.tipo_documento)
            dto.tipo_documento = dto.tipo_documento.trim(); // 👈 NUEVO
        if (dto.documento)
            dto.documento = dto.documento.replace(/\s+/g, '').trim();
        if (dto.nombres)
            dto.nombres = dto.nombres.trim();
        if (dto.apellidos)
            dto.apellidos = dto.apellidos.trim();
        if (dto.vinculacion)
            dto.vinculacion = dto.vinculacion.trim();
        if (dto.dedicacion)
            dto.dedicacion = dto.dedicacion.trim();
        if (dto.departamento)
            dto.departamento = dto.departamento.trim();
        if (dto.unidad_academica)
            dto.unidad_academica = dto.unidad_academica.trim();
        if (dto.correo_institucional)
            dto.correo_institucional = dto.correo_institucional.trim().toLowerCase();
        if (dto.correo_personal)
            dto.correo_personal = dto.correo_personal.trim().toLowerCase();
        return dto;
    }
    async getAll(params = {}) {
        const page = Math.max(1, Number(params.page || 1));
        const take = Math.min(env_1.env.pagination.maxPageSize, Math.max(1, Number(params.pageSize || env_1.env.pagination.defaultPageSize)));
        const skip = (page - 1) * take;
        const qb = this.repo
            .createQueryBuilder('d')
            .orderBy('d.id', 'DESC')
            .skip(skip)
            .take(take);
        if (params.q) {
            const q = `%${params.q.trim()}%`;
            qb.andWhere('(d.documento ILIKE :q OR d.nombres ILIKE :q OR d.apellidos ILIKE :q OR d.correo_institucional ILIKE :q)', { q });
        }
        if (params.activo === 'true')
            qb.andWhere('d.activo = true');
        if (params.activo === 'false')
            qb.andWhere('d.activo = false');
        if (params.unidad_academica)
            qb.andWhere('d.unidad_academica = :ua', {
                ua: params.unidad_academica,
            });
        if (params.departamento)
            qb.andWhere('d.departamento = :dep', { dep: params.departamento });
        if (params.vinculacion)
            qb.andWhere('d.vinculacion = :vin', { vin: params.vinculacion });
        if (params.dedicacion)
            qb.andWhere('d.dedicacion = :ded', { ded: params.dedicacion });
        if (params.tipo_documento) { // 👈 NUEVO
            qb.andWhere('d.tipo_documento = :td', {
                td: params.tipo_documento,
            });
        }
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, pageSize: take };
    }
    getById(id) {
        return this.repo.findOne({ where: { id } });
    }
    async create(dto) {
        this.normalize(dto);
        if (dto.documento) {
            const existsDoc = await this.repo.findOne({
                where: { documento: dto.documento },
            });
            if (existsDoc) {
                const err = new Error('Ya existe un docente con ese documento');
                err.status = 409;
                throw err;
            }
        }
        if (dto.correo_institucional) {
            const existsMail = await this.repo.findOne({
                where: { correo_institucional: dto.correo_institucional },
            });
            if (existsMail) {
                const err = new Error('Correo institucional ya está en uso');
                err.status = 409;
                throw err;
            }
        }
        const entity = this.repo.create(dto);
        return this.repo.save(entity);
    }
    async update(id, dto) {
        this.normalize(dto);
        if (dto.documento) {
            const conflict = await this.repo
                .createQueryBuilder('d')
                .where('d.documento = :doc', { doc: dto.documento })
                .andWhere('d.id <> :id', { id })
                .getOne();
            if (conflict) {
                const err = new Error('Otro docente ya tiene ese documento');
                err.status = 409;
                throw err;
            }
        }
        if (dto.correo_institucional) {
            const conflictMail = await this.repo
                .createQueryBuilder('d')
                .where('LOWER(d.correo_institucional) = LOWER(:mail)', {
                mail: dto.correo_institucional,
            })
                .andWhere('d.id <> :id', { id })
                .getOne();
            if (conflictMail) {
                const err = new Error('Correo institucional ya está en uso por otro docente');
                err.status = 409;
                throw err;
            }
        }
        await this.repo.update(id, dto);
        return this.getById(id);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
}
exports.DocenteService = DocenteService;
//# sourceMappingURL=docenteService.js.map