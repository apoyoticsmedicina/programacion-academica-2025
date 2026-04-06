"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocenteController = void 0;
const data_source_1 = require("../config/data-source");
const Docente_1 = require("../entities/Docente");
const docenteService_1 = require("../services/docenteService");
class DocenteController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const { page, pageSize, q, activo, unidad_academica, departamento, vinculacion, dedicacion, tipo_documento, // 👈 NUEVO
                 } = req.query;
                const data = await this.svc.getAll({
                    page,
                    pageSize,
                    q,
                    activo,
                    unidad_academica,
                    departamento,
                    vinculacion,
                    dedicacion,
                    tipo_documento, // 👈 NUEVO
                });
                res.json(data);
            }
            catch (err) {
                next(err);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const d = await this.svc.getById(+req.params.id);
                if (!d)
                    return res.sendStatus(404);
                res.json(d);
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
                if (!updated)
                    return res.sendStatus(404);
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
        const repo = data_source_1.AppDataSource.getRepository(Docente_1.Docente);
        this.svc = new docenteService_1.DocenteService(repo);
    }
}
exports.DocenteController = DocenteController;
//# sourceMappingURL=docenteController.js.map