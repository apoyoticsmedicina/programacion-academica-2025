import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { ProgramaCurso } from "../entities/ProgramaCurso";
import { ProgramaMetodologia } from "../entities/ProgramaMetodologia";
import { ProgramaEvaluacion } from "../entities/ProgramaEvaluacion";
import { ProgramaMetodologiaEstrategia } from "../entities/ProgramaMetodologiaEstrategia";
import { ProgramaBibliografia } from "../entities/ProgramaBibliografia";
import { ProgramaCursoService } from "../services/programaCursoService";

export class ProgramaCursoController {
  private svc: ProgramaCursoService;

  constructor() {
    this.svc = new ProgramaCursoService(
      AppDataSource.getRepository(ProgramaCurso),
      AppDataSource.getRepository(ProgramaMetodologia),
      AppDataSource.getRepository(ProgramaEvaluacion),
      AppDataSource.getRepository(ProgramaMetodologiaEstrategia),
      AppDataSource.getRepository(ProgramaBibliografia)
    );
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page,
        pageSize,
        q,
        plan_estudio_id,
        curso_id,
        plan_estudio_curso_id,
        id_caracteristicas,
        id_clase_curso,
        id_modalidad_curso,
      } = req.query as any;

      const data = await this.svc.getAll({
        page,
        pageSize,
        q,
        plan_estudio_id: plan_estudio_id ? +plan_estudio_id : undefined,
        curso_id: curso_id ? +curso_id : undefined,
        plan_estudio_curso_id: plan_estudio_curso_id
          ? +plan_estudio_curso_id
          : undefined,
        id_caracteristicas: id_caracteristicas
          ? +id_caracteristicas
          : undefined,
        id_clase_curso: id_clase_curso ? +id_clase_curso : undefined,
        id_modalidad_curso: id_modalidad_curso
          ? +id_modalidad_curso
          : undefined,
      });
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
      // body puede incluir creditos y vigencia (opcionales)
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

  // ======== NUEVO: segundo estado (avanzado) ========
  /**
   * POST /programas-curso/:id/avanzado
   * Body:
   * {
   *   perfil?: string;
   *   intencionalidades_formativas?: string;
   *   aportes_curso_formacion?: string;
   *   descripcion_conocimientos?: string;
   *   vigencia?: string;
   *   estrategias?: number[];
   *   medios_recursos?: string;
   *   formas_interaccion?: string;
   *   estrategias_internacionalizacion?: string;
   *   estrategias_enfoque?: string;
   *   evaluacion?: [{ momentos_evaluacion?: string; porcentaje?: number }];
   *   bibliografia?: [{ cultura?: string; referencia: string; palabras_clave?: string }];
   * }
   */
  upsertAvanzado = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const result = await this.svc.upsertAvanzado(id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
