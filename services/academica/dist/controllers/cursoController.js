"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursoController = void 0;
const data_source_1 = require("../config/data-source");
const Curso_1 = require("../entities/Curso");
const cursoService_1 = require("../services/cursoService");
class CursoController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const planId = req.query.planId ? Number(req.query.planId) : undefined;
                const q = req.query.q || undefined;
                // Ahora el service ya maneja planId internamente.
                const cursos = await this.svc.getAll({ planId, q });
                return res.json(cursos);
            }
            catch (err) {
                next(err);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const id = Number(req.params.id);
                const item = await this.svc.findOne(id);
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
                const dto = req.body;
                const created = await this.svc.create(dto);
                res.status(201).json(created);
            }
            catch (err) {
                next(err);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const id = Number(req.params.id);
                const dto = req.body;
                const updated = await this.svc.update(id, dto);
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
                const id = Number(req.params.id);
                await this.svc.delete(id);
                res.sendStatus(204);
            }
            catch (err) {
                next(err);
            }
        };
        const repo = data_source_1.AppDataSource.getRepository(Curso_1.Curso);
        this.svc = new cursoService_1.CursoService(repo);
    }
}
exports.CursoController = CursoController;
//# sourceMappingURL=cursoController.js.map