// src/controllers/programasController.ts
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

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, q, tipo, codigo } = req.query as any;
      const data = await this.svc.getAll({ page, pageSize, q, tipo, codigo });
      res.json(data);
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

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const dto = req.body as Partial<ProgramaAcademico>;
      const updated = await this.svc.update(id, dto);
      res.json(updated);
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
