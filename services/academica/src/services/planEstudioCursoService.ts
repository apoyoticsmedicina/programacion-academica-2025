// src/services/planEstudioCursoService.ts
import { Repository } from 'typeorm';
import { PlanEstudioCurso } from '../entities/PlanDeEstudioCurso';

export type ListPECParams = {
  page?: number;
  pageSize?: number;
  plan_estudio_id?: number;
  curso_id?: number;
  tipo_curso_id?: number;
};

export class PlanEstudioCursoService {
  constructor(private repo: Repository<PlanEstudioCurso>) { }

  async getAll(params: ListPECParams = {}) {
    const qb = this.repo
      .createQueryBuilder('pec')
      .leftJoinAndSelect('pec.plan', 'plan')
      .leftJoinAndSelect('pec.curso', 'curso')
      .leftJoinAndSelect('pec.tipo', 'tipo')
      // ✅ ahora ordenamos por nivel (puede haber nulls)
      .orderBy('pec.nivel', 'ASC', 'NULLS LAST')
      .addOrderBy('pec.id', 'DESC');

    if (params.plan_estudio_id) {
      qb.andWhere('plan.id = :pid', { pid: params.plan_estudio_id });
    }
    if (params.curso_id) {
      qb.andWhere('curso.id = :cid', { cid: params.curso_id });
    }
    if (params.tipo_curso_id) {
      qb.andWhere('tipo.id = :tid', { tid: params.tipo_curso_id });
    }

    return qb.getMany();
  }

  getById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['plan', 'curso', 'tipo'],
    });
  }

  async create(dto: {
    plan_estudio_id: number;
    curso_id: number;
    tipo_curso_id: number;
    nivel?: number;

    // 🔁 compat opcional (para no romper front viejo):
    orden?: number;
  }) {
    // anti-duplicado (además del @Unique)
    const dup = await this.repo.findOne({
      where: {
        plan: { id: dto.plan_estudio_id } as any,
        curso: { id: dto.curso_id } as any,
      },
      relations: ['plan', 'curso'],
    });
    if (dup) {
      const err: any = new Error('Ese curso ya existe en el plan de estudio');
      err.status = 409;
      throw err;
    }

    // ✅ toma nivel; si no viene, usa orden como fallback
    const nivel =
      dto.nivel !== undefined ? dto.nivel : dto.orden !== undefined ? dto.orden : undefined;

    // (opcional) validar nivel si quieres: entero >= 1
    if (nivel !== undefined) {
      if (!Number.isInteger(nivel) || nivel <= 0) {
        const err: any = new Error('nivel debe ser un entero positivo');
        err.status = 400;
        throw err;
      }
    }

    const ent = this.repo.create({
      plan: { id: dto.plan_estudio_id } as any,
      curso: { id: dto.curso_id } as any,
      tipo: { id: dto.tipo_curso_id } as any,
      nivel,
    });

    await this.repo.save(ent);
    return this.getById(ent.id);
  }

  async update(
    id: number,
    dto: Partial<{
      tipo_curso_id: number;
      nivel: number;

      // 🔁 compat opcional:
      orden: number;
    }>,
  ) {
    const patch: any = {};

    if (dto.tipo_curso_id) patch.tipo = { id: dto.tipo_curso_id };

    // ✅ nivel (con fallback a orden)
    const nivel =
      dto.nivel !== undefined ? dto.nivel : dto.orden !== undefined ? dto.orden : undefined;

    if (nivel !== undefined) {
      if (!Number.isInteger(nivel) || nivel <= 0) {
        const err: any = new Error('nivel debe ser un entero positivo');
        err.status = 400;
        throw err;
      }
      patch.nivel = nivel;
    }

    await this.repo.update({ id }, patch);

    const updated = await this.getById(id);
    if (!updated) {
      const err: any = new Error('PlanEstudioCurso no encontrado');
      err.status = 404;
      throw err;
    }
    return updated;
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
