// src/services/cohorteService.ts
import { Repository } from 'typeorm';
import { Cohorte } from '../entities/Cohorte';
import { env } from '../config/env';

export type ListCohortesParams = {
  page?: number;
  pageSize?: number;
  q?: string;     // busca por periodo (ILIKE)
  desde?: string; // fecha_inicio >= desde
  hasta?: string; // fecha_fin   <= hasta
};

export class CohorteService {
  constructor(private repo: Repository<Cohorte>) {}

  private normalize(dto: Partial<Cohorte>) {
    if (dto.periodo) dto.periodo = dto.periodo.trim();
    return dto;
  }

  private assertFechas(dto: Partial<Cohorte>) {
    if (dto.fecha_inicio && dto.fecha_fin) {
      const fi = new Date(dto.fecha_inicio as string);
      const ff = new Date(dto.fecha_fin as string);
      if (isFinite(fi.getTime()) && isFinite(ff.getTime()) && ff < fi) {
        const err: any = new Error(
          'fecha_fin no puede ser menor a fecha_inicio',
        );
        err.status = 400;
        throw err;
      }
    }
  }

  async getAll(params: ListCohortesParams = {}) {
    const page = Math.max(1, Number(params.page || 1));

    // 🔧 ahora usa los valores de env.pagination
    const take = Math.min(
      env.pagination.maxPageSize,
      Math.max(
        1,
        Number(params.pageSize || env.pagination.defaultPageSize),
      ),
    );
    const skip = (page - 1) * take;

    const qb = this.repo
      .createQueryBuilder('c')
      .orderBy('c.id', 'DESC')
      .skip(skip)
      .take(take);

    if (params.q) {
      qb.andWhere('c.periodo ILIKE :q', {
        q: `%${params.q.trim()}%`,
      });
    }
    if (params.desde) qb.andWhere('c.fecha_inicio >= :d', { d: params.desde });
    if (params.hasta) qb.andWhere('c.fecha_fin <= :h', { h: params.hasta });

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize: take };
  }

  getById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['planes'], // si no quieres cargar planes aquí, quítalo
    });
  }

  async create(dto: Partial<Cohorte>) {
    this.normalize(dto);
    this.assertFechas(dto);

    // anti-duplicado por periodo (además del @Unique)
    if (dto.periodo) {
      const dup = await this.repo.findOne({
        where: { periodo: dto.periodo },
      });
      if (dup) {
        const err: any = new Error(
          'Ya existe una cohorte con ese periodo',
        );
        err.status = 409;
        throw err;
      }
    }

    const ent = this.repo.create(dto);
    await this.repo.save(ent);
    return this.getById(ent.id);
  }

  async update(id: number, dto: Partial<Cohorte>) {
    this.normalize(dto);
    this.assertFechas(dto);

    if (dto.periodo) {
      const conflict = await this.repo
        .createQueryBuilder('c')
        .where('c.periodo = :p', { p: dto.periodo })
        .andWhere('c.id <> :id', { id })
        .getOne();
      if (conflict) {
        const err: any = new Error(
          'Otra cohorte ya usa ese periodo',
        );
        err.status = 409;
        throw err;
      }
    }

    await this.repo.update({ id }, dto);
    const updated = await this.getById(id);
    if (!updated) {
      const err: any = new Error('Cohorte no encontrada');
      err.status = 404;
      throw err;
    }
    return updated;
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
