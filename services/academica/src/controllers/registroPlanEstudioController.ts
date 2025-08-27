import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { RegistroPlanEstudio } from '../entities/RegistroPlanEstudio';
import { RegistroPlanEstudioService } from '../services/registroPlanEstudioService';

export class RegistroPlanEstudioController {
  private svc: RegistroPlanEstudioService;

  constructor() {
    const repo = AppDataSource.getRepository(RegistroPlanEstudio);
    this.svc = new RegistroPlanEstudioService(repo);
  }

  getAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const list = await this.svc.getAll();
      res.json(list);
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
      const dto = req.body as Partial<RegistroPlanEstudio>;
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
