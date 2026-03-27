import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { HorasCurso } from "../entities/HorasCurso";
import { HorasCursoService } from "../services/horasCursoService";

export class HorasCursoController {
  private svc: HorasCursoService;

  constructor() {
    this.svc = new HorasCursoService(AppDataSource.getRepository(HorasCurso));
  }

  // Anidados bajo ProgramaCurso
  listByProgramaCurso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const programaCursoId = +req.params.programaCursoId;
      const items = await this.svc.listByProgramaCurso(programaCursoId);
      res.json(items);
    } catch (err) { next(err); }
  };

  createForProgramaCurso = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const programaCursoId = +req.params.programaCursoId;
      const created = await this.svc.createForProgramaCurso(programaCursoId, req.body);
      res.status(201).json(created);
    } catch (err) { next(err); }
  };

  // Directos por id
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.svc.getById(+req.params.id);
      if (!item) return res.sendStatus(404);
      res.json(item);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await this.svc.update(+req.params.id, req.body);
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
