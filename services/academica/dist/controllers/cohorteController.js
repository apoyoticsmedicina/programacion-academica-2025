"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CohorteController = void 0;
const data_source_1 = require("../config/data-source");
const Cohorte_1 = require("../entities/Cohorte");
const cohorteService_1 = require("../services/cohorteService");
class CohorteController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const { page, pageSize, q, desde, hasta } = req.query;
                const data = await this.svc.getAll({ page, pageSize, q, desde, hasta });
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
        const repo = data_source_1.AppDataSource.getRepository(Cohorte_1.Cohorte);
        this.svc = new cohorteService_1.CohorteService(repo);
    }
}
exports.CohorteController = CohorteController;
//# sourceMappingURL=cohorteController.js.map