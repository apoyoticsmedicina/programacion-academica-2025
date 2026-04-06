"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramaDocenteService = void 0;
const env_1 = require("../config/env");
class ProgramaDocenteService {
    constructor(repo) {
        this.repo = repo;
    }
    normPorcentaje(val) {
        if (val === undefined || val === null)
            return undefined;
        const n = typeof val === 'number' ? val : Number(String(val).replace(',', '.'));
        if (Number.isNaN(n))
            return undefined;
        // guardamos como ENTERO en string
        return Math.round(n).toString();
    }
    async getAll(params = {}) {
        const page = Math.max(1, Number(params.page || 1));
        // 🔧 paginación basada en variables de entorno
        const take = Math.min(env_1.env.pagination.maxPageSize, Math.max(1, Number(params.pageSize || env_1.env.pagination.defaultPageSize)));
        const skip = (page - 1) * take;
        const qb = this.repo
            .createQueryBuilder('pd')
            .leftJoinAndSelect('pd.docente', 'd')
            .leftJoinAndSelect('pd.programaCurso', 'pc')
            .leftJoinAndSelect('pc.planCurso', 'pec')
            .leftJoinAndSelect('pec.plan', 'plan')
            .leftJoinAndSelect('pec.curso', 'curso')
            .orderBy('pd.id', 'DESC')
            .skip(skip)
            .take(take);
        if (params.programa_curso_id)
            qb.andWhere('pc.id = :pcid', { pcid: params.programa_curso_id });
        if (params.docente_id)
            qb.andWhere('d.id = :did', { did: params.docente_id });
        if (params.q) {
            const q = `%${params.q.trim()}%`;
            qb.andWhere('(d.documento ILIKE :q OR d.nombres ILIKE :q OR d.apellidos ILIKE :q)', { q });
        }
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, pageSize: take };
    }
    getById(id) {
        return this.repo.findOne({
            where: { id },
            relations: [
                'docente',
                'programaCurso',
                'programaCurso.planCurso',
                'programaCurso.planCurso.plan',
                'programaCurso.planCurso.curso',
            ],
        });
    }
    /** Crea la asignación docente↔programaCurso. Evita duplicados por (id_docente, id_programa). */
    async create(dto) {
        const dup = await this.repo.findOne({
            where: {
                docente: { id: dto.id_docente },
                programaCurso: { id: dto.id_programa },
            },
            relations: ['docente', 'programaCurso'],
        });
        if (dup) {
            const err = new Error('El docente ya está asignado a este programa de curso');
            err.status = 409;
            throw err;
        }
        const ent = this.repo.create({
            docente: { id: dto.id_docente },
            programaCurso: { id: dto.id_programa },
            porcentaje: this.normPorcentaje(dto.porcentaje) ?? '0',
        });
        await this.repo.save(ent);
        return this.getById(ent.id);
    }
    /** Actualiza porcentaje o (si lo permites) cambia docente/programa con chequeo de conflicto. */
    async update(id, dto) {
        const patch = {};
        if (dto.id_docente || dto.id_programa) {
            const current = await this.getById(id);
            if (!current) {
                const err = new Error('ProgramaDocente no encontrado');
                err.status = 404;
                throw err;
            }
            const newDocenteId = dto.id_docente ?? current.docente.id;
            const newProgId = dto.id_programa ?? current.programaCurso.id;
            // si cambió la pareja, validar duplicado
            if (newDocenteId !== current.docente.id ||
                newProgId !== current.programaCurso.id) {
                const conflict = await this.repo.findOne({
                    where: {
                        docente: { id: newDocenteId },
                        programaCurso: { id: newProgId },
                    },
                });
                if (conflict) {
                    const err = new Error('Ya existe esa asignación docente↔programaCurso');
                    err.status = 409;
                    throw err;
                }
                patch.docente = { id: newDocenteId };
                patch.programaCurso = { id: newProgId };
            }
        }
        if (dto.porcentaje !== undefined)
            patch.porcentaje = this.normPorcentaje(dto.porcentaje);
        await this.repo.update({ id }, patch);
        return this.getById(id);
    }
    async remove(id) {
        await this.repo.delete(id);
    }
}
exports.ProgramaDocenteService = ProgramaDocenteService;
//# sourceMappingURL=programaDocenteService.js.map