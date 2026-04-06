"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramaCursoController = void 0;
const data_source_1 = require("../config/data-source");
const ProgramaCurso_1 = require("../entities/ProgramaCurso");
const ProgramaMetodologia_1 = require("../entities/ProgramaMetodologia");
const ProgramaEvaluacion_1 = require("../entities/ProgramaEvaluacion");
const ProgramaMetodologiaEstrategia_1 = require("../entities/ProgramaMetodologiaEstrategia");
const ProgramaBibliografia_1 = require("../entities/ProgramaBibliografia");
const programaCursoService_1 = require("../services/programaCursoService");
class ProgramaCursoController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const { page, pageSize, q, plan_estudio_id, curso_id, plan_estudio_curso_id, id_caracteristicas, id_clase_curso, id_modalidad_curso, } = req.query;
                const data = await this.svc.getAll({
                    page,
                    pageSize,
                    q,
                    plan_estudio_id: plan_estudio_id ? +plan_estudio_id : undefined,
                    curso_id: curso_id ? +curso_id : undefined,
                    plan_estudio_curso_id: plan_estudio_curso_id
                        ? +plan_estudio_curso_id
                        : undefined,
                    id_caracteristicas: id_caracteristicas
                        ? +id_caracteristicas
                        : undefined,
                    id_clase_curso: id_clase_curso ? +id_clase_curso : undefined,
                    id_modalidad_curso: id_modalidad_curso
                        ? +id_modalidad_curso
                        : undefined,
                });
                res.json(data);
            }
            catch (err) {
                next(err);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const item = await this.svc.getById(+req.params.id);
                if (!item)
                    return res.sendStatus(404);
                res.json(item);
            }
            catch (err) {
                next(err);
            }
        };
        this.create = async (req, res, next) => {
            try {
                // body puede incluir creditos y vigencia (opcionales)
                const created = await this.svc.create(req.body);
                res.status(201).json(created);
            }
            catch (err) {
                next(err);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const updated = await this.svc.update(+req.params.id, req.body);
                res.json(updated);
            }
            catch (err) {
                next(err);
            }
        };
        this.remove = async (req, res, next) => {
            try {
                await this.svc.remove(+req.params.id);
                res.sendStatus(204);
            }
            catch (err) {
                next(err);
            }
        };
        // ======== NUEVO: segundo estado (avanzado) ========
        /**
         * POST /programas-curso/:id/avanzado
         * Body:
         * {
         *   perfil?: string;
         *   intencionalidades_formativas?: string;
         *   aportes_curso_formacion?: string;
         *   descripcion_conocimientos?: string;
         *   vigencia?: string;
         *   estrategias?: number[];
         *   medios_recursos?: string;
         *   formas_interaccion?: string;
         *   estrategias_internacionalizacion?: string;
         *   estrategias_enfoque?: string;
         *   evaluacion?: [{ momentos_evaluacion?: string; porcentaje?: number }];
         *   bibliografia?: [{ cultura?: string; referencia: string; palabras_clave?: string }];
         * }
         */
        this.upsertAvanzado = async (req, res, next) => {
            try {
                const id = +req.params.id;
                const result = await this.svc.upsertAvanzado(id, req.body);
                res.json(result);
            }
            catch (err) {
                next(err);
            }
        };
        this.svc = new programaCursoService_1.ProgramaCursoService(data_source_1.AppDataSource.getRepository(ProgramaCurso_1.ProgramaCurso), data_source_1.AppDataSource.getRepository(ProgramaMetodologia_1.ProgramaMetodologia), data_source_1.AppDataSource.getRepository(ProgramaEvaluacion_1.ProgramaEvaluacion), data_source_1.AppDataSource.getRepository(ProgramaMetodologiaEstrategia_1.ProgramaMetodologiaEstrategia), data_source_1.AppDataSource.getRepository(ProgramaBibliografia_1.ProgramaBibliografia));
    }
}
exports.ProgramaCursoController = ProgramaCursoController;
//# sourceMappingURL=programaCursoController.js.map