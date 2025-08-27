
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { ProgramaAcademico } from '../entities/ProgramaAcademico';
import { ProgramasService } from '../services/programaService';

export class ProgramasController {
  private svc: ProgramasService;

  constructor() {
    const repo = AppDataSource.getRepository(ProgramaAcademico);
    this.svc = new ProgramasService(repo);
  }

  getAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const list = await this.svc.getAll();
      res.json(list);
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const item = await this.svc.getById(id);
      if (!item) return res.sendStatus(404);
      res.json(item);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as Partial<ProgramaAcademico>;
      const created = await this.svc.create(dto);
      res.status(201).json(created);
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await this.svc.remove(id);
      res.sendStatus(204);
    } catch (err) { next(err); }
  };
}
