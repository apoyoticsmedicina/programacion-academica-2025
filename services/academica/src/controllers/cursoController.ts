import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { Curso } from "../entities/Curso";
import { CursoService } from "../services/cursoService";

export class CursoController {
  private svc: CursoService;

  constructor() {
    const repo = AppDataSource.getRepository(Curso);
    this.svc = new CursoService(repo);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const planId = req.query.planId ? Number(req.query.planId) : undefined;
      const q = (req.query.q as string) || undefined;

      // Ahora el service ya maneja planId internamente.
      const cursos = await this.svc.getAll({ planId, q });

      return res.json(cursos);
    } catch (err) {
      next(err);
    }
  };


  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const item = await this.svc.findOne(id);
      if (!item) return res.sendStatus(404);
      res.json(item);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as Partial<Curso>;
      const created = await this.svc.create(dto);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const dto = req.body as Partial<Curso>;
      const updated = await this.svc.update(id, dto);
      if (!updated) return res.sendStatus(404);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await this.svc.delete(id);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  };
}
