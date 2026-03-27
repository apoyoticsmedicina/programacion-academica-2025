// src/services/planEstudioService.ts
import { Repository } from 'typeorm';
import { PlanDeEstudio } from '../entities/PlanDeEstudio';
import { env } from '../config/env';

export type ListPlanesParams = {
  page?: number;
  pageSize?: number;
  q?: string;              // busca por "version"
  programa_id?: number;
  id_cohorte?: number;
  activo?: 'true' | 'false';
  niveles?: string;
};

export class PlanesService {
  constructor(private repo: Repository<PlanDeEstudio>) { }

  private normalize(dto: Partial<PlanDeEstudio>) {
    if (dto.version) dto.version = dto.version.trim();

    if (dto.niveles !== undefined) {
      const raw = dto.niveles;
      const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
      dto.niveles = Number.isFinite(n) ? Math.trunc(n) : NaN;
    }

    return dto;
  }

  private validateNiveles(niveles: any) {
    if (niveles === undefined) return; // en update puede no venir
    if (!Number.isInteger(niveles) || niveles <= 0) {
      const err: any = new Error('niveles debe ser un entero positivo');
      err.status = 400;
      throw err;
    }
  }

  async getAll(params: ListPlanesParams = {}) {
    const page = Math.max(1, Number(params.page || 1));

    const take = Math.min(
      env.pagination.maxPageSize,
      Math.max(1, Number(params.pageSize || env.pagination.defaultPageSize)),
    );
    const skip = (page - 1) * take;

    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.programa', 'prog')
      .leftJoinAndSelect('p.cohorte', 'coh')
      .loadRelationCountAndMap('p.totalCursos', 'p.cursos')
      .orderBy('p.id', 'DESC')
      .skip(skip)
      .take(take);

    if (params.q) {
      qb.andWhere('p.version ILIKE :q', { q: `%${params.q.trim()}%` });
    }
    if (params.programa_id) {
      qb.andWhere('prog.id = :pid', { pid: Number(params.programa_id) });
    }
    if (params.id_cohorte) {
      qb.andWhere('coh.id = :cid', { cid: Number(params.id_cohorte) });
    }
    if (params.activo === 'true') qb.andWhere('p.activo = true');
    if (params.activo === 'false') qb.andWhere('p.activo = false');

    // ✅ filtro opcional por niveles
    if (params.niveles != null && String(params.niveles).trim() !== '') {
      const n = Number(String(params.niveles).trim());
      if (Number.isFinite(n)) qb.andWhere('p.niveles = :niv', { niv: Math.trunc(n) });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize: take };
  }

  getById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: [
        'programa',
        'cohorte',
        'cursos',
        'cursos.curso',
        'cursos.tipo',
      ],
    });
  }

  async create(dto: {
    programa_id: number;
    version: string;
    id_cohorte: number;
    activo?: boolean;
    niveles: number | string; // ✅ nuevo
  }) {
    this.normalize(dto as any);

    // ✅ requerido al crear
    if ((dto as any).niveles === undefined) {
      const err: any = new Error('niveles es obligatorio');
      err.status = 400;
      throw err;
    }
    this.validateNiveles((dto as any).niveles);

    const dup = await this.repo.findOne({
      where: {
        programa: { id: dto.programa_id } as any,
        version: dto.version,
        cohorte: { id: dto.id_cohorte } as any,
      },
      relations: ['programa', 'cohorte'],
    });
    if (dup) {
      const err: any = new Error('Ya existe un plan con ese Programa + Versión + Cohorte');
      err.status = 409;
      throw err;
    }

    const ent = this.repo.create({
      version: dto.version,
      activo: dto.activo ?? true,
      niveles: (dto as any).niveles, // ✅
      programa: { id: dto.programa_id } as any,
      cohorte: { id: dto.id_cohorte } as any,
    });

    await this.repo.save(ent);
    return this.getById(ent.id);
  }

  async update(id: number, dto: Partial<PlanDeEstudio>) {
    this.normalize(dto as any);

    // ✅ si viene niveles en update, validar
    if ((dto as any).niveles !== undefined) {
      this.validateNiveles((dto as any).niveles);
    }

    await this.repo.update({ id }, dto);
    const updated = await this.getById(id);
    if (!updated) {
      const err: any = new Error('Plan de estudio no encontrado');
      err.status = 404;
      throw err;
    }
    return updated;
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
