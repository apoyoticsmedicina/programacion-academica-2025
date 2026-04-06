"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramaCursoService = void 0;
const env_1 = require("../config/env");
const toU = (v) => v == null ? undefined : v;
class ProgramaCursoService {
    constructor(repo, metodologiaRepo, evaluacionRepo, metodologiaEstrategiaRepo, bibliografiaRepo) {
        this.repo = repo;
        this.metodologiaRepo = metodologiaRepo;
        this.evaluacionRepo = evaluacionRepo;
        this.metodologiaEstrategiaRepo = metodologiaEstrategiaRepo;
        this.bibliografiaRepo = bibliografiaRepo;
    }
    normalize(dto) {
        if (dto.unidad_academica)
            dto.unidad_academica = dto.unidad_academica.trim();
        if (dto.nucleo_curso)
            dto.nucleo_curso = dto.nucleo_curso.trim();
        if (dto.vigencia)
            dto.vigencia = dto.vigencia.trim();
        return dto;
    }
    // ProgramaCursoService.getAll
    async getAll(params = {}) {
        const page = Math.max(1, Number(params.page || 1));
        // 🔧 paginación basada en variables de entorno
        const take = Math.min(env_1.env.pagination.maxPageSize, Math.max(1, Number(params.pageSize || env_1.env.pagination.defaultPageSize)));
        const skip = (page - 1) * take;
        const qb = this.repo
            .createQueryBuilder('pc')
            .leftJoinAndSelect('pc.planCurso', 'pec')
            .leftJoinAndSelect('pec.plan', 'plan')
            .leftJoinAndSelect('pec.curso', 'curso')
            .leftJoinAndSelect('pec.tipo', 'tipo')
            .leftJoinAndSelect('pc.caracteristicas', 'car')
            .leftJoinAndSelect('pc.clase', 'cl')
            .leftJoinAndSelect('pc.modalidad', 'mo')
            .loadRelationCountAndMap('pc.totalHoras', 'pc.horas')
            .loadRelationCountAndMap('pc.totalDocentes', 'pc.docentes')
            .orderBy('pc.id', 'DESC')
            .skip(skip)
            .take(take);
        const wantDetails = !!params.plan_estudio_curso_id ||
            !!params.curso_id ||
            !!params.plan_estudio_id;
        if (wantDetails) {
            qb.leftJoinAndSelect('pc.horas', 'horas')
                .leftJoinAndSelect('pc.docentes', 'pd')
                .leftJoinAndSelect('pd.docente', 'doc')
                .leftJoinAndSelect('pc.metodologia', 'met')
                .leftJoinAndSelect('pc.estrategiasMetodologicas', 'em')
                .leftJoinAndSelect('em.estrategia', 'estr')
                .leftJoinAndSelect('pc.evaluaciones', 'ev')
                .leftJoinAndSelect('pc.bibliografia', 'bibl');
        }
        if (params.q) {
            const q = `%${params.q.trim()}%`;
            qb.andWhere('(pc.unidad_academica ILIKE :q OR pc.nucleo_curso ILIKE :q)', { q });
        }
        if (params.plan_estudio_id)
            qb.andWhere('plan.id = :pid', { pid: params.plan_estudio_id });
        if (params.curso_id)
            qb.andWhere('curso.id = :cid', { cid: params.curso_id });
        if (params.plan_estudio_curso_id)
            qb.andWhere('pec.id = :pecid', {
                pecid: params.plan_estudio_curso_id,
            });
        if (params.id_caracteristicas)
            qb.andWhere('car.id = :carid', {
                carid: params.id_caracteristicas,
            });
        if (params.id_clase_curso)
            qb.andWhere('cl.id = :clid', {
                clid: params.id_clase_curso,
            });
        if (params.id_modalidad_curso)
            qb.andWhere('mo.id = :moid', {
                moid: params.id_modalidad_curso,
            });
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, pageSize: take };
    }
    getById(id) {
        return this.repo.findOne({
            where: { id },
            relations: [
                'planCurso',
                'planCurso.plan',
                'planCurso.curso',
                'planCurso.tipo',
                'caracteristicas',
                'clase',
                'modalidad',
                'horas',
                'docentes',
                'docentes.docente',
                'metodologia',
                'estrategiasMetodologicas',
                'estrategiasMetodologicas.estrategia',
                'evaluaciones',
                'bibliografia',
            ],
        });
    }
    async create(dto) {
        this.normalize(dto);
        const avoidDupByPEC = true;
        if (avoidDupByPEC) {
            const dup = await this.repo.findOne({
                where: { planCurso: { id: dto.id_plan_estudio_curso } },
                relations: ['planCurso'],
            });
            if (dup) {
                const err = new Error('Ya existe un ProgramaCurso para ese PlanEstudioCurso');
                err.status = 409;
                throw err;
            }
        }
        const payload = {
            planCurso: { id: dto.id_plan_estudio_curso },
            unidad_academica: dto.unidad_academica,
            caracteristicas: { id: dto.id_caracteristicas },
            clase: { id: dto.id_clase_curso },
            modalidad: { id: dto.id_modalidad_curso },
            nucleo_curso: toU(dto.nucleo_curso),
            creditos: toU(dto.creditos),
            vigencia: toU(dto.vigencia),
        };
        const ent = this.repo.create(payload);
        const saved = await this.repo.save(ent);
        return this.getById(saved.id);
    }
    async update(id, dto) {
        this.normalize(dto);
        const patch = {};
        if (dto.id_plan_estudio_curso) {
            const dup = await this.repo.findOne({
                where: { planCurso: { id: dto.id_plan_estudio_curso } },
            });
            if (dup && dup.id !== id) {
                const err = new Error('Ya existe un ProgramaCurso para ese PlanEstudioCurso');
                err.status = 409;
                throw err;
            }
            patch.planCurso = {
                id: dto.id_plan_estudio_curso,
            };
        }
        if (dto.unidad_academica !== undefined)
            patch.unidad_academica = dto.unidad_academica;
        if (dto.id_caracteristicas)
            patch.caracteristicas = {
                id: dto.id_caracteristicas,
            };
        if (dto.id_clase_curso)
            patch.clase = { id: dto.id_clase_curso };
        if (dto.id_modalidad_curso)
            patch.modalidad = {
                id: dto.id_modalidad_curso,
            };
        if (dto.nucleo_curso !== undefined)
            patch.nucleo_curso = dto.nucleo_curso ?? null;
        if (dto.creditos !== undefined)
            patch.creditos = dto.creditos;
        if (dto.vigencia !== undefined) {
            patch.vigencia = dto.vigencia ?? null;
        }
        await this.repo.update({ id }, patch);
        const updated = await this.getById(id);
        if (!updated) {
            const err = new Error('ProgramaCurso no encontrado');
            err.status = 404;
            throw err;
        }
        return updated;
    }
    async remove(id) {
        await this.repo.delete(id);
    }
    // ============ SEGUNDO ESTADO (Avanzado) ============
    async upsertAvanzado(programaId, payload) {
        const ent = await this.repo.findOne({ where: { id: programaId } });
        if (!ent) {
            const err = new Error('ProgramaCurso no encontrado');
            err.status = 404;
            throw err;
        }
        const PH = {
            perfil: 'Por definir.',
            intencionalidades: 'Por definir.',
            aportes: 'Por definir.',
            conocimientos: 'Por definir.',
            medios_recursos: 'Por definir.',
            formas_interaccion: 'Por definir.',
            estrategias_internacionalizacion: 'Por definir.',
            estrategias_enfoque: 'Por definir.',
        };
        const patch = {
            perfil: payload.perfil === undefined ? PH.perfil : payload.perfil,
            intencionalidadesFormativas: payload.intencionalidades_formativas === undefined
                ? PH.intencionalidades
                : payload.intencionalidades_formativas,
            aportesCursoFormacion: payload.aportes_curso_formacion === undefined
                ? PH.aportes
                : payload.aportes_curso_formacion,
            descripcionConocimientos: payload.descripcion_conocimientos === undefined
                ? PH.conocimientos
                : payload.descripcion_conocimientos,
        };
        if (payload.vigencia !== undefined) {
            patch.vigencia = payload.vigencia ?? null;
        }
        await this.repo.update({ id: programaId }, patch);
        await this.metodologiaRepo.delete({
            programaCurso: { id: programaId },
        });
        const metodologiaRow = {
            programaCurso: { id: programaId },
            mediosYRecursos: payload.medios_recursos === undefined
                ? PH.medios_recursos
                : payload.medios_recursos ?? undefined,
            formasInteraccion: payload.formas_interaccion === undefined
                ? PH.formas_interaccion
                : payload.formas_interaccion ?? undefined,
            estrategiasInternacionalizacion: payload.estrategias_internacionalizacion === undefined
                ? PH.estrategias_internacionalizacion
                : payload.estrategias_internacionalizacion ?? undefined,
            estrategiasEnfoque: payload.estrategias_enfoque === undefined
                ? PH.estrategias_enfoque
                : payload.estrategias_enfoque ?? undefined,
        };
        const metodologiaEntity = this.metodologiaRepo.create(metodologiaRow);
        await this.metodologiaRepo.save(metodologiaEntity);
        await this.metodologiaEstrategiaRepo.delete({
            programaCurso: { id: programaId },
        });
        const estrategiasIds = payload.estrategias ?? [];
        if (estrategiasIds.length) {
            const rowsPayload = estrategiasIds.map((estrategiaId) => ({
                programaCurso: { id: programaId },
                estrategia: { id: estrategiaId },
            }));
            const rows = this.metodologiaEstrategiaRepo.create(rowsPayload);
            if (rows.length)
                await this.metodologiaEstrategiaRepo.save(rows);
        }
        await this.evaluacionRepo.delete({
            programaCurso: { id: programaId },
        });
        const evalSrc = Array.isArray(payload.evaluacion)
            ? payload.evaluacion
            : [];
        const evalPayload = [];
        for (const r of evalSrc) {
            const raw = r && typeof r.momentos_evaluacion === 'string'
                ? r.momentos_evaluacion.trim()
                : '';
            if (!raw)
                continue;
            evalPayload.push({
                programaCurso: { id: programaId },
                momentosEvaluacion: raw,
                porcentaje: Number(r.porcentaje) || 0,
            });
        }
        if (evalPayload.length) {
            const evalRows = this.evaluacionRepo.create(evalPayload);
            await this.evaluacionRepo.save(evalRows);
        }
        await this.bibliografiaRepo.delete({
            programaCurso: { id: programaId },
        });
        const biblioSrc = Array.isArray(payload.bibliografia)
            ? payload.bibliografia
            : [];
        const biblioPayload = biblioSrc
            .map((b) => {
            const referencia = (b.referencia ?? '').trim();
            if (!referencia)
                return null;
            return {
                programaCurso: { id: programaId },
                cultura: b.cultura ?? null,
                referencia,
                palabrasClave: b.palabras_clave ?? null,
            };
        })
            .filter((x) => x !== null);
        if (biblioPayload.length) {
            const biblioRows = this.bibliografiaRepo.create(biblioPayload);
            await this.bibliografiaRepo.save(biblioRows);
        }
        return this.getById(programaId);
    }
}
exports.ProgramaCursoService = ProgramaCursoService;
//# sourceMappingURL=programaCursoService.js.map