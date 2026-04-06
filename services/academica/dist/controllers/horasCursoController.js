"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HorasCursoController = void 0;
const data_source_1 = require("../config/data-source");
const HorasCurso_1 = require("../entities/HorasCurso");
const horasCursoService_1 = require("../services/horasCursoService");
class HorasCursoController {
    constructor() {
        // Anidados bajo ProgramaCurso
        this.listByProgramaCurso = async (req, res, next) => {
            try {
                const programaCursoId = +req.params.programaCursoId;
                const items = await this.svc.listByProgramaCurso(programaCursoId);
                res.json(items);
            }
            catch (err) {
                next(err);
            }
        };
        this.createForProgramaCurso = async (req, res, next) => {
            try {
                const programaCursoId = +req.params.programaCursoId;
                const created = await this.svc.createForProgramaCurso(programaCursoId, req.body);
                res.status(201).json(created);
            }
            catch (err) {
                next(err);
            }
        };
        // Directos por id
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
        this.svc = new horasCursoService_1.HorasCursoService(data_source_1.AppDataSource.getRepository(HorasCurso_1.HorasCurso));
    }
}
exports.HorasCursoController = HorasCursoController;
//# sourceMappingURL=horasCursoController.js.map