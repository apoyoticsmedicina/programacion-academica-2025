import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { PlanDeEstudio } from "../entities/PlanDeEstudio";
import { PlanesService } from "../services/planEstudioService";

export class PlanEstudioController {
  private svc: PlanesService;

  constructor() {
    const repo = AppDataSource.getRepository(PlanDeEstudio);
    this.svc = new PlanesService(repo);
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { programa_id, id_cohorte, activo, niveles } = req.query as any;
      const data = await this.svc.getAll({ programa_id, id_cohorte, activo, niveles });
      res.json(data);
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.svc.getById(Number(req.params.id));
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
      const updated = await this.svc.update(Number(req.params.id), req.body);
      res.json(updated);
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.svc.remove(Number(req.params.id));
      res.sendStatus(204);
    } catch (err) { next(err); }
  };
}
