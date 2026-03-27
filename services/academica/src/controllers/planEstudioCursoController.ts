import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { PlanEstudioCurso } from "../entities/PlanDeEstudioCurso";
import { PlanEstudioCursoService } from "../services/planEstudioCursoService";

export class PlanEstudioCursoController {
  private svc: PlanEstudioCursoService;

  constructor() {
    this.svc = new PlanEstudioCursoService(AppDataSource.getRepository(PlanEstudioCurso));
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, plan_estudio_id, curso_id, tipo_curso_id } = req.query as any;
      const data = await this.svc.getAll({
        page, pageSize,
        plan_estudio_id: plan_estudio_id ? +plan_estudio_id : undefined,
        curso_id: curso_id ? +curso_id : undefined,
        tipo_curso_id: tipo_curso_id ? +tipo_curso_id : undefined,
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
      const created = await this.svc.create(req.body);
      res.status(201).json(created);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.svc.update(+req.params.id, req.body);
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
