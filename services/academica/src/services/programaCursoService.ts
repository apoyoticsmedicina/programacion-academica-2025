// src/services/programaCursoService.ts
import { Repository, DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ProgramaCurso } from '../entities/ProgramaCurso';
import { ProgramaMetodologia } from '../entities/ProgramaMetodologia';
import { ProgramaEvaluacion } from '../entities/ProgramaEvaluacion';
import { ProgramaMetodologiaEstrategia } from '../entities/ProgramaMetodologiaEstrategia';
import { ProgramaBibliografia } from '../entities/ProgramaBibliografia';
import { env } from '../config/env';

export type ListProgramaCursoParams = {
  page?: number;
  pageSize?: number;
  q?: string; // busca en unidad_academica o nucleo_curso
  plan_estudio_id?: number; // filtra por plan
  curso_id?: number; // filtra por curso
  plan_estudio_curso_id?: number; // filtra por PEC (id de plan_estudio_cursos)
  id_caracteristicas?: number;
  id_clase_curso?: number;
  id_modalidad_curso?: number;
};

const toU = <T>(v: T | null | undefined): T | undefined =>
  v == null ? undefined : v;

export class ProgramaCursoService {
  constructor(
    private repo: Repository<ProgramaCurso>,
    private metodologiaRepo: Repository<ProgramaMetodologia>,
    private evaluacionRepo: Repository<ProgramaEvaluacion>,
    private metodologiaEstrategiaRepo: Repository<ProgramaMetodologiaEstrategia>,
    private bibliografiaRepo: Repository<ProgramaBibliografia>,
  ) {}

  private normalize(dto: Partial<ProgramaCurso>) {
    if ((dto as any).unidad_academica)
      (dto as any).unidad_academica = (dto as any).unidad_academica.trim();
    if ((dto as any).nucleo_curso)
      (dto as any).nucleo_curso = (dto as any).nucleo_curso.trim();
    if ((dto as any).vigencia)
      (dto as any).vigencia = (dto as any).vigencia.trim();
    return dto;
  }

  // ProgramaCursoService.getAll
  async getAll(params: ListProgramaCursoParams = {}) {
    const page = Math.max(1, Number(params.page || 1));

    // 🔧 paginación basada en variables de entorno
    const take = Math.min(
      env.pagination.maxPageSize,
      Math.max(
        1,
        Number(params.pageSize || env.pagination.defaultPageSize),
      ),
    );
    const skip = (page - 1) * take;

    const qb = this.repo
      .createQueryBuilder('pc')
      .leftJoinAndSelect('pc.planCurso', 'pec')
      .leftJoinAndSelect('pec.plan', 'plan')
      .leftJoinAndSelect('pec.curso', 'curso')
      .leftJoinAndSelect('pec.tipo', 'tipo')
      .leftJoinAndSelect('pc.caracteristicas', 'car')
      .leftJoinAndSelect('pc.clase', 'cl')
      .leftJoinAndSelect('pc.modalidad', 'mo')
      .loadRelationCountAndMap('pc.totalHoras', 'pc.horas')
      .loadRelationCountAndMap('pc.totalDocentes', 'pc.docentes')
      .orderBy('pc.id', 'DESC')
      .skip(skip)
      .take(take);

    const wantDetails =
      !!params.plan_estudio_curso_id ||
      !!params.curso_id ||
      !!params.plan_estudio_id;

    if (wantDetails) {
      qb.leftJoinAndSelect('pc.horas', 'horas')
        .leftJoinAndSelect('pc.docentes', 'pd')
        .leftJoinAndSelect('pd.docente', 'doc')
        .leftJoinAndSelect('pc.metodologia', 'met')
        .leftJoinAndSelect('pc.estrategiasMetodologicas', 'em')
        .leftJoinAndSelect('em.estrategia', 'estr')
        .leftJoinAndSelect('pc.evaluaciones', 'ev')
        .leftJoinAndSelect('pc.bibliografia', 'bibl');
    }

    if (params.q) {
      const q = `%${params.q.trim()}%`;
      qb.andWhere(
        '(pc.unidad_academica ILIKE :q OR pc.nucleo_curso ILIKE :q)',
        { q },
      );
    }
    if (params.plan_estudio_id)
      qb.andWhere('plan.id = :pid', { pid: params.plan_estudio_id });
    if (params.curso_id)
      qb.andWhere('curso.id = :cid', { cid: params.curso_id });
    if (params.plan_estudio_curso_id)
      qb.andWhere('pec.id = :pecid', {
        pecid: params.plan_estudio_curso_id,
      });
    if (params.id_caracteristicas)
      qb.andWhere('car.id = :carid', {
        carid: params.id_caracteristicas,
      });
    if (params.id_clase_curso)
      qb.andWhere('cl.id = :clid', {
        clid: params.id_clase_curso,
      });
    if (params.id_modalidad_curso)
      qb.andWhere('mo.id = :moid', {
        moid: params.id_modalidad_curso,
      });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize: take };
  }

  getById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: [
        'planCurso',
        'planCurso.plan',
        'planCurso.curso',
        'planCurso.tipo',
        'caracteristicas',
        'clase',
        'modalidad',
        'horas',
        'docentes',
        'docentes.docente',
        'metodologia',
        'estrategiasMetodologicas',
        'estrategiasMetodologicas.estrategia',
        'evaluaciones',
        'bibliografia',
      ],
    });
  }

  async create(dto: {
    id_plan_estudio_curso: number;
    unidad_academica: string;
    id_caracteristicas: number;
    id_clase_curso: number;
    id_modalidad_curso: number;
    nucleo_curso?: string | null;
    creditos?: number | null;
    vigencia?: string | null;
  }) {
    this.normalize(dto as any);

    const avoidDupByPEC = true;
    if (avoidDupByPEC) {
      const dup = await this.repo.findOne({
        where: { planCurso: { id: dto.id_plan_estudio_curso } as any },
        relations: ['planCurso'],
      });
      if (dup) {
        const err: any = new Error(
          'Ya existe un ProgramaCurso para ese PlanEstudioCurso',
        );
        err.status = 409;
        throw err;
      }
    }

    const payload: import('typeorm').DeepPartial<ProgramaCurso> = {
      planCurso: { id: dto.id_plan_estudio_curso } as any,
      unidad_academica: dto.unidad_academica,
      caracteristicas: { id: dto.id_caracteristicas } as any,
      clase: { id: dto.id_clase_curso } as any,
      modalidad: { id: dto.id_modalidad_curso } as any,
      nucleo_curso: toU(dto.nucleo_curso),
      creditos: toU(dto.creditos),
      vigencia: toU(dto.vigencia),
    };

    const ent = this.repo.create(payload);
    const saved = await this.repo.save(ent);
    return this.getById(saved.id);
  }

  async update(
    id: number,
    dto: Partial<{
      id_plan_estudio_curso: number;
      unidad_academica: string;
      id_caracteristicas: number;
      id_clase_curso: number;
      id_modalidad_curso: number;
      nucleo_curso?: string | null;
      creditos?: number | null;
      vigencia?: string | null;
    }>,
  ) {
    this.normalize(dto as any);

    const patch: QueryDeepPartialEntity<ProgramaCurso> = {};
    if (dto.id_plan_estudio_curso) {
      const dup = await this.repo.findOne({
        where: { planCurso: { id: dto.id_plan_estudio_curso } as any },
      });
      if (dup && (dup as any).id !== id) {
        const err: any = new Error(
          'Ya existe un ProgramaCurso para ese PlanEstudioCurso',
        );
        err.status = 409;
        throw err;
      }
      (patch as any).planCurso = {
        id: dto.id_plan_estudio_curso,
      } as any;
    }
    if (dto.unidad_academica !== undefined)
      (patch as any).unidad_academica = dto.unidad_academica;
    if ((dto as any).id_caracteristicas)
      (patch as any).caracteristicas = {
        id: (dto as any).id_caracteristicas,
      };
    if ((dto as any).id_clase_curso)
      (patch as any).clase = { id: (dto as any).id_clase_curso };
    if ((dto as any).id_modalidad_curso)
      (patch as any).modalidad = {
        id: (dto as any).id_modalidad_curso,
      };
    if (dto.nucleo_curso !== undefined)
      (patch as any).nucleo_curso = dto.nucleo_curso ?? null;
    if (dto.creditos !== undefined)
      (patch as any).creditos = dto.creditos as any;
    if (dto.vigencia !== undefined) {
      (patch as any).vigencia = dto.vigencia ?? null;
    }

    await this.repo.update({ id }, patch);
    const updated = await this.getById(id);
    if (!updated) {
      const err: any = new Error('ProgramaCurso no encontrado');
      err.status = 404;
      throw err;
    }
    return updated;
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }

  // ============ SEGUNDO ESTADO (Avanzado) ============
  async upsertAvanzado(
    programaId: number,
    payload: {
      perfil?: string | null;
      intencionalidades_formativas?: string | null;
      aportes_curso_formacion?: string | null;
      descripcion_conocimientos?: string | null;
      vigencia?: string | null;
      estrategias?: number[];
      medios_recursos?: string | null;
      formas_interaccion?: string | null;
      estrategias_internacionalizacion?: string | null;
      estrategias_enfoque?: string | null;
      evaluacion?: Array<{ momentos_evaluacion?: string; porcentaje?: number }>;
      bibliografia?: Array<{
        cultura?: string | null;
        referencia?: string;
        palabras_clave?: string | null;
      }>;
    },
  ) {
    const ent = await this.repo.findOne({ where: { id: programaId } });
    if (!ent) {
      const err: any = new Error('ProgramaCurso no encontrado');
      err.status = 404;
      throw err;
    }

    const PH = {
      perfil: 'Por definir.',
      intencionalidades: 'Por definir.',
      aportes: 'Por definir.',
      conocimientos: 'Por definir.',
      medios_recursos: 'Por definir.',
      formas_interaccion: 'Por definir.',
      estrategias_internacionalizacion: 'Por definir.',
      estrategias_enfoque: 'Por definir.',
    };

    const patch: QueryDeepPartialEntity<ProgramaCurso> = {
      perfil:
        payload.perfil === undefined ? PH.perfil : (payload.perfil as any),
      intencionalidadesFormativas:
        payload.intencionalidades_formativas === undefined
          ? PH.intencionalidades
          : (payload.intencionalidades_formativas as any),
      aportesCursoFormacion:
        payload.aportes_curso_formacion === undefined
          ? PH.aportes
          : (payload.aportes_curso_formacion as any),
      descripcionConocimientos:
        payload.descripcion_conocimientos === undefined
          ? PH.conocimientos
          : (payload.descripcion_conocimientos as any),
    };

    if (payload.vigencia !== undefined) {
      (patch as any).vigencia = payload.vigencia ?? null;
    }

    await this.repo.update({ id: programaId }, patch);

    await this.metodologiaRepo.delete({
      programaCurso: { id: programaId } as any,
    });

    const metodologiaRow: DeepPartial<ProgramaMetodologia> = {
      programaCurso: { id: programaId } as any,
      mediosYRecursos:
        payload.medios_recursos === undefined
          ? PH.medios_recursos
          : payload.medios_recursos ?? undefined,
      formasInteraccion:
        payload.formas_interaccion === undefined
          ? PH.formas_interaccion
          : payload.formas_interaccion ?? undefined,
      estrategiasInternacionalizacion:
        payload.estrategias_internacionalizacion === undefined
          ? PH.estrategias_internacionalizacion
          : payload.estrategias_internacionalizacion ?? undefined,
      estrategiasEnfoque:
        payload.estrategias_enfoque === undefined
          ? PH.estrategias_enfoque
          : payload.estrategias_enfoque ?? undefined,
    };

    const metodologiaEntity = this.metodologiaRepo.create(metodologiaRow);
    await this.metodologiaRepo.save(metodologiaEntity);

    await this.metodologiaEstrategiaRepo.delete({
      programaCurso: { id: programaId } as any,
    });

    const estrategiasIds = payload.estrategias ?? [];
    if (estrategiasIds.length) {
      const rowsPayload: DeepPartial<ProgramaMetodologiaEstrategia>[] =
        estrategiasIds.map((estrategiaId) => ({
          programaCurso: { id: programaId } as any,
          estrategia: { id: estrategiaId } as any,
        }));

      const rows = this.metodologiaEstrategiaRepo.create(rowsPayload);
      if (rows.length)
        await this.metodologiaEstrategiaRepo.save(rows);
    }

    await this.evaluacionRepo.delete({
      programaCurso: { id: programaId } as any,
    });

    const evalSrc = Array.isArray(payload.evaluacion)
      ? payload.evaluacion
      : [];

    const evalPayload: DeepPartial<ProgramaEvaluacion>[] = [];

    for (const r of evalSrc) {
      const raw =
        r && typeof r.momentos_evaluacion === 'string'
          ? r.momentos_evaluacion.trim()
          : '';

      if (!raw) continue;

      evalPayload.push({
        programaCurso: { id: programaId } as any,
        momentosEvaluacion: raw,
        porcentaje: Number(r.porcentaje) || 0,
      });
    }

    if (evalPayload.length) {
      const evalRows = this.evaluacionRepo.create(evalPayload);
      await this.evaluacionRepo.save(evalRows);
    }

    await this.bibliografiaRepo.delete({
      programaCurso: { id: programaId } as any,
    });

    const biblioSrc = Array.isArray(payload.bibliografia)
      ? payload.bibliografia
      : [];

    const biblioPayload: DeepPartial<ProgramaBibliografia>[] =
      biblioSrc
        .map((b) => {
          const referencia = (b.referencia ?? '').trim();
          if (!referencia) return null;

          return {
            programaCurso: { id: programaId } as any,
            cultura: b.cultura ?? null,
            referencia,
            palabrasClave: b.palabras_clave ?? null,
          } as DeepPartial<ProgramaBibliografia>;
        })
        .filter(
          (x): x is DeepPartial<ProgramaBibliografia> => x !== null,
        );

    if (biblioPayload.length) {
      const biblioRows = this.bibliografiaRepo.create(biblioPayload);
      await this.bibliografiaRepo.save(biblioRows);
    }

    return this.getById(programaId);
  }
}
