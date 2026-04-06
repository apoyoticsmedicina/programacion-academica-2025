"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanEstudioController = void 0;
const data_source_1 = require("../config/data-source");
const PlanDeEstudio_1 = require("../entities/PlanDeEstudio");
const planEstudioService_1 = require("../services/planEstudioService");
class PlanEstudioController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const { programa_id, id_cohorte, activo, niveles } = req.query;
                const data = await this.svc.getAll({ programa_id, id_cohorte, activo, niveles });
                res.json(data);
            }
            catch (err) {
                next(err);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const item = await this.svc.getById(Number(req.params.id));
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
                const updated = await this.svc.update(Number(req.params.id), req.body);
                res.json(updated);
            }
            catch (err) {
                next(err);
            }
        };
        this.remove = async (req, res, next) => {
            try {
                await this.svc.remove(Number(req.params.id));
                res.sendStatus(204);
            }
            catch (err) {
                next(err);
            }
        };
        const repo = data_source_1.AppDataSource.getRepository(PlanDeEstudio_1.PlanDeEstudio);
        this.svc = new planEstudioService_1.PlanesService(repo);
    }
}
exports.PlanEstudioController = PlanEstudioController;
//# sourceMappingURL=planEstudioController.js.map