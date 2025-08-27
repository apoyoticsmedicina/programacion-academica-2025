import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { CursoDocente } from '../entities/CursoDocente';
import { CursoDocenteService } from '../services/cursoDocenteService';

export class CursoDocenteController {
  private svc: CursoDocenteService;

  constructor() {
    const repo = AppDataSource.getRepository(CursoDocente);
    this.svc = new CursoDocenteService(repo);
  }

  getAll = async (_: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.svc.getAll()); } catch (err) { next(err); }
  };

  getByIds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cursoId, docenteId } = req.params;
      const item = await this.svc.getByIds(+cursoId, +docenteId);
      if (!item) return res.sendStatus(404);
      res.json(item);
    } catch (err) { next(err); }
  };

  getByCurso = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.svc.getByCurso(+req.params.cursoId)); }
    catch (err) { next(err); }
  };

  getByDocente = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.svc.getByDocente(+req.params.docenteId)); }
    catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await this.svc.create(req.body);
      res.status(201).json(created);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cursoId, docenteId } = req.params;
      const updated = await this.svc.update(+cursoId, +docenteId, req.body);
      if (!updated) return res.sendStatus(404);
      res.json(updated);
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cursoId, docenteId } = req.params;
      await this.svc.remove(+cursoId, +docenteId);
      res.sendStatus(204);
    } catch (err) { next(err); }
  };
}
