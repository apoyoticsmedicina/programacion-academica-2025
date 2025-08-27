import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { PlanEstudioCurso } from '../entities/PlanEstudioCurso';
import { PlanEstudioCursoService } from '../services/planEstudioCursoService';

export class PlanEstudioCursoController {
  private svc: PlanEstudioCursoService;

  constructor() {
    const repo = AppDataSource.getRepository(PlanEstudioCurso);
    this.svc = new PlanEstudioCursoService(repo);
  }

  getAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await this.svc.getAll());
    } catch (err) { next(err); }
  };

  getByIds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId, cursoId } = req.params;
      const item = await this.svc.getByIds(+planId, +cursoId);
      if (!item) return res.sendStatus(404);
      res.json(item);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as Partial<PlanEstudioCurso>;
      const created = await this.svc.create(dto);
      res.status(201).json(created);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId, cursoId } = req.params;
      const updated = await this.svc.update(+planId, +cursoId, req.body);
      if (!updated) return res.sendStatus(404);
      res.json(updated);
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId, cursoId } = req.params;
      await this.svc.remove(+planId, +cursoId);
      res.sendStatus(204);
    } catch (err) { next(err); }
  };
}
