"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramaCursoRequisitoController = void 0;
const data_source_1 = require("../config/data-source");
const ProgramaCursoRequisito_1 = require("../entities/ProgramaCursoRequisito");
const programaCursoRequisitoService_1 = require("../services/programaCursoRequisitoService");
class ProgramaCursoRequisitoController {
    constructor() {
        this.listByProgramaCurso = async (req, res, next) => {
            try {
                const programa_curso_id = +req.params.programaCursoId;
                const tipo = req.query.tipo || undefined;
                const list = await this.svc.listByProgramaCurso({ programa_curso_id, tipo });
                res.json(list);
            }
            catch (err) {
                next(err);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const programa_curso_id = +req.params.programaCursoId;
                const created = await this.svc.create({
                    programa_curso_id,
                    curso_id: req.body.curso_id,
                    requisito_curso_id: req.body.requisito_curso_id,
                    tipo: req.body.tipo,
                });
                res.status(201).json(created);
            }
            catch (err) {
                next(err);
            }
        };
        this.remove = async (req, res, next) => {
            try {
                const programa_curso_id = +req.params.programaCursoId;
                await this.svc.remove({
                    programa_curso_id,
                    curso_id: req.body.curso_id,
                    requisito_curso_id: req.body.requisito_curso_id,
                    tipo: req.body.tipo,
                });
                res.sendStatus(204);
            }
            catch (err) {
                next(err);
            }
        };
        // Opcional: Bulk
        this.bulkCreate = async (req, res, next) => {
            try {
                const programa_curso_id = +req.params.programaCursoId;
                const rows = req.body?.rows ?? [];
                const created = await this.svc.bulkCreate(programa_curso_id, rows);
                res.status(201).json({ inserted: created.length, items: created });
            }
            catch (err) {
                next(err);
            }
        };
        this.svc = new programaCursoRequisitoService_1.ProgramaCursoRequisitoService(data_source_1.AppDataSource.getRepository(ProgramaCursoRequisito_1.ProgramaCursoRequisito));
    }
}
exports.ProgramaCursoRequisitoController = ProgramaCursoRequisitoController;
//# sourceMappingURL=programaCursoRequisitoController.js.map