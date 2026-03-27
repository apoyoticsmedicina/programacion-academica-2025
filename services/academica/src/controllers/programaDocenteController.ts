import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { ProgramaDocente } from "../entities/ProgramaDocente";
import { ProgramaDocenteService } from "../services/programaDocenteService";

export class ProgramaDocenteController {
  private svc: ProgramaDocenteService;

  constructor() {
    this.svc = new ProgramaDocenteService(AppDataSource.getRepository(ProgramaDocente));
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, programa_curso_id, docente_id, q } = req.query as any;
      const data = await this.svc.getAll({
        page,
        pageSize,
        programa_curso_id: programa_curso_id ? +programa_curso_id : undefined,
        docente_id: docente_id ? +docente_id : undefined,
        q,
      });
      res.json(data);
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.svc.getById(+req.params.id);
      if (!item) return res.sendStatus(404);
      res.json(item);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await this.svc.create({
        id_docente: req.body.id_docente,
        id_programa: req.body.id_programa,
        porcentaje: req.body.porcentaje,
      });
      res.status(201).json(created);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.svc.update(+req.params.id, req.body);
      if (!updated) return res.sendStatus(404);
      res.json(updated);
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.svc.remove(+req.params.id);
      res.sendStatus(204);
    } catch (err) { next(err); }
  };
}
