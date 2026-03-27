// src/controllers/docenteController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Docente } from '../entities/Docente';
import { DocenteService } from '../services/docenteService';

export class DocenteController {
  private svc: DocenteService;

  constructor() {
    const repo = AppDataSource.getRepository(Docente);
    this.svc = new DocenteService(repo);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page,
        pageSize,
        q,
        activo,
        unidad_academica,
        departamento,
        vinculacion,
        dedicacion,
        tipo_documento,          // 👈 NUEVO
      } = req.query as any;

      const data = await this.svc.getAll({
        page,
        pageSize,
        q,
        activo,
        unidad_academica,
        departamento,
        vinculacion,
        dedicacion,
        tipo_documento,          // 👈 NUEVO
      });

      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const d = await this.svc.getById(+req.params.id);
      if (!d) return res.sendStatus(404);
      res.json(d);
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
    try {
      await this.svc.remove(+req.params.id);
      res.sendStatus(204);
    } catch (err) { next(err); }
  };
}
