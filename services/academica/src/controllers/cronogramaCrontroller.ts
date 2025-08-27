import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Cronograma } from '../entities/Cronograma';
import { CronogramaService } from '../services/cronogramaService';

export class CronogramaController {
  private svc: CronogramaService;

  constructor() {
    const repo = AppDataSource.getRepository(Cronograma);
    this.svc = new CronogramaService(repo);
  }

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await this.svc.getAll();
      res.json(list);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const item = await this.svc.getById(id);
      if (!item) {
        return res.sendStatus(404);
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Aquí recibes un objeto parcial de Cronograma, p.ej. { curso: { id: 1 }, fechaInicio: "...", ... }
      const dto = req.body as Partial<Cronograma>;
      const created = await this.svc.create(dto);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const dto = req.body as Partial<Cronograma>;
      const updated = await this.svc.update(id, dto);
      if (!updated) {
        return res.sendStatus(404);
      }
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await this.svc.remove(id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  };
}
