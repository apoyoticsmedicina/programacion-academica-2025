"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramaDocenteController = void 0;
const data_source_1 = require("../config/data-source");
const ProgramaDocente_1 = require("../entities/ProgramaDocente");
const programaDocenteService_1 = require("../services/programaDocenteService");
class ProgramaDocenteController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const { page, pageSize, programa_curso_id, docente_id, q } = req.query;
                const data = await this.svc.getAll({
                    page,
                    pageSize,
                    programa_curso_id: programa_curso_id ? +programa_curso_id : undefined,
                    docente_id: docente_id ? +docente_id : undefined,
                    q,
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
                const created = await this.svc.create({
                    id_docente: req.body.id_docente,
                    id_programa: req.body.id_programa,
                    porcentaje: req.body.porcentaje,
                });
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
        this.svc = new programaDocenteService_1.ProgramaDocenteService(data_source_1.AppDataSource.getRepository(ProgramaDocente_1.ProgramaDocente));
    }
}
exports.ProgramaDocenteController = ProgramaDocenteController;
//# sourceMappingURL=programaDocenteController.js.map