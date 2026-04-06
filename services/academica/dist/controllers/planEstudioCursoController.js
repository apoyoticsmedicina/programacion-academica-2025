"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanEstudioCursoController = void 0;
const data_source_1 = require("../config/data-source");
const PlanDeEstudioCurso_1 = require("../entities/PlanDeEstudioCurso");
const planEstudioCursoService_1 = require("../services/planEstudioCursoService");
class PlanEstudioCursoController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const { page, pageSize, plan_estudio_id, curso_id, tipo_curso_id } = req.query;
                const data = await this.svc.getAll({
                    page, pageSize,
                    plan_estudio_id: plan_estudio_id ? +plan_estudio_id : undefined,
                    curso_id: curso_id ? +curso_id : undefined,
                    tipo_curso_id: tipo_curso_id ? +tipo_curso_id : undefined,
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
        this.svc = new planEstudioCursoService_1.PlanEstudioCursoService(data_source_1.AppDataSource.getRepository(PlanDeEstudioCurso_1.PlanEstudioCurso));
    }
}
exports.PlanEstudioCursoController = PlanEstudioCursoController;
//# sourceMappingURL=planEstudioCursoController.js.map