import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { CursoRequisito } from '../entities/RequisitosCurso';
import { CursoRequisitoService } from '../services/cursoRequisitoService';

export class CursoRequisitoController {
  private svc: CursoRequisitoService;

  constructor() {
    const repo = AppDataSource.getRepository(CursoRequisito);
    this.svc = new CursoRequisitoService(repo);
  }

  /** GET /curso-requisitos */
  getAll = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const list = await this.svc.getAll();
      res.json(list);
    } catch (err) {
      next(err);
    }
  };

  /** GET /curso-requisitos/:cursoId/:requisitoId */
  getByIds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cursoId = Number(req.params.cursoId);
      const requisitoId = Number(req.params.requisitoId);
      const item = await this.svc.getByIds(cursoId, requisitoId);
      if (!item) return res.sendStatus(404);
      res.json(item);
    } catch (err) {
      next(err);
    }
  };

  /** POST /curso-requisitos */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as Partial<CursoRequisito>;
      const created = await this.svc.create(dto);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /curso-requisitos/:cursoId/:requisitoId */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cursoId = Number(req.params.cursoId);
      const requisitoId = Number(req.params.requisitoId);
      const updated = await this.svc.update(cursoId, requisitoId, req.body);
      if (!updated) return res.sendStatus(404);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /curso-requisitos/:cursoId/:requisitoId */
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cursoId = Number(req.params.cursoId);
      const requisitoId = Number(req.params.requisitoId);
      await this.svc.remove(cursoId, requisitoId);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  };
}
