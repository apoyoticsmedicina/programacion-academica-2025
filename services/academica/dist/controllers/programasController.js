"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramasController = void 0;
const data_source_1 = require("../config/data-source");
const ProgramaAcademico_1 = require("../entities/ProgramaAcademico");
const programaService_1 = require("../services/programaService");
class ProgramasController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const { page, pageSize, q, tipo, codigo } = req.query;
                const data = await this.svc.getAll({ page, pageSize, q, tipo, codigo });
                res.json(data);
            }
            catch (err) {
                next(err);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const id = Number(req.params.id);
                const item = await this.svc.getById(id);
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
                res.json(updated);
            }
            catch (err) {
                next(err);
            }
        };
        this.remove = async (req, res, next) => {
            try {
                const id = Number(req.params.id);
                await this.svc.remove(id);
                res.sendStatus(204);
            }
            catch (err) {
                next(err);
            }
        };
        const repo = data_source_1.AppDataSource.getRepository(ProgramaAcademico_1.ProgramaAcademico);
        this.svc = new programaService_1.ProgramasService(repo);
    }
}
exports.ProgramasController = ProgramasController;
//# sourceMappingURL=programasController.js.map