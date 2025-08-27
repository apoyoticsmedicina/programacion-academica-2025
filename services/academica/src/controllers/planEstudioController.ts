import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { PlanEstudio } from '../entities/PlanEstudio';
import { PlanEstudioService } from '../services/planEstudioService';

export class PlanEstudioController {
  private svc: PlanEstudioService;

  constructor() {
    const repo = AppDataSource.getRepository(PlanEstudio);
    this.svc = new PlanEstudioService(repo);
  }

getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const programaId = req.query.programaId ? Number(req.query.programaId) : undefined;
    let list: PlanEstudio[];
    if (programaId) {
      list = await this.svc.getByPrograma(programaId);
    } else {
      list = await this.svc.getAll();
    }
    res.json(list);
  } catch (err) { next(err); }
};

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await this.svc.getById(+req.params.id);
      if (!plan) return res.sendStatus(404);
      res.json(plan);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as Partial<PlanEstudio>;
      const created = await this.svc.create(dto);
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
