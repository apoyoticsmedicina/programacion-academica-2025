import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { ProgramaCursoRequisito } from "../entities/ProgramaCursoRequisito";
import { ProgramaCursoRequisitoService } from "../services/programaCursoRequisitoService";

export class ProgramaCursoRequisitoController {
  private svc: ProgramaCursoRequisitoService;

  constructor() {
    this.svc = new ProgramaCursoRequisitoService(
      AppDataSource.getRepository(ProgramaCursoRequisito)
    );
  }

  listByProgramaCurso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const programa_curso_id = +req.params.programaCursoId;
      const tipo = (req.query.tipo as any) || undefined;
      const list = await this.svc.listByProgramaCurso({ programa_curso_id, tipo });
      res.json(list);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const programa_curso_id = +req.params.programaCursoId;
      const created = await this.svc.create({
        programa_curso_id,
        curso_id: req.body.curso_id,
        requisito_curso_id: req.body.requisito_curso_id,
        tipo: req.body.tipo,
      });
      res.status(201).json(created);
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const programa_curso_id = +req.params.programaCursoId;
      await this.svc.remove({
        programa_curso_id,
        curso_id: req.body.curso_id,
        requisito_curso_id: req.body.requisito_curso_id,
        tipo: req.body.tipo,
      });
      res.sendStatus(204);
    } catch (err) { next(err); }
  };

  // Opcional: Bulk
  bulkCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const programa_curso_id = +req.params.programaCursoId;
      const rows = req.body?.rows ?? [];
      const created = await this.svc.bulkCreate(programa_curso_id, rows);
      res.status(201).json({ inserted: created.length, items: created });
    } catch (err) { next(err); }
  };
}
