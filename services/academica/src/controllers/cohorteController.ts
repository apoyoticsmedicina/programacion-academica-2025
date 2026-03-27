// src/controllers/cohorteController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Cohorte } from '../entities/Cohorte';
import { CohorteService } from '../services/cohorteService';

export class CohorteController {
  private svc: CohorteService;

  constructor() {
    const repo = AppDataSource.getRepository(Cohorte);
    this.svc = new CohorteService(repo);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, q, desde, hasta } = req.query as any;
      const data = await this.svc.getAll({ page, pageSize, q, desde, hasta });
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.svc.getById(+req.params.id);
      if (!item) return res.sendStatus(404);
      res.json(item);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await this.svc.create(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.svc.update(+req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.svc.remove(+req.params.id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  };
}
