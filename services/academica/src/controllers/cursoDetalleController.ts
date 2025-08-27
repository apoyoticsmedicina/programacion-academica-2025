import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { CursoDetalle } from '../entities/CursoDetalle';
import { CursoDetalleService } from '../services/cursoDetalleService';

export class CursoDetalleController {
  private svc: CursoDetalleService;

  constructor() {
    const repo = AppDataSource.getRepository(CursoDetalle);
    this.svc = new CursoDetalleService(repo);
  }

  getAll = async (_: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.svc.getAll()); } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.svc.getById(+req.params.id);
      if (!item) return res.sendStatus(404);
      res.json(item);
    } catch (err) { next(err); }
  };

  getByCurso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.svc.getByCurso(+req.params.cursoId);
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
      if (!updated) return res.sendStatus(404);
      res.json(updated);
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { await this.svc.remove(+req.params.id); res.sendStatus(204); }
    catch (err) { next(err); }
  };
}
