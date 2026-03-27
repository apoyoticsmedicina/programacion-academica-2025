// src/services/cursoService.ts
import { Repository, ILike } from 'typeorm';
import { Curso } from '../entities/Curso';
import { env } from '../config/env';

export type ListCursosParams = {
  page?: number;
  pageSize?: number;
  q?: string;      // busca por nombre o código
  planId?: number; // lista los cursos de un plan específico
};

export class CursoService {
  constructor(private repo: Repository<Curso>) { }

  private normalize(dto: Partial<Curso>) {
    if (dto.codigo) dto.codigo = dto.codigo.trim();
    if (dto.nombre) dto.nombre = dto.nombre.trim();
    return dto;
  }

  async getAll(params: ListCursosParams = {}): Promise<Curso[]> {
    if (params.planId) return this.findByPlan(params.planId);

    const where: any[] = [];
    if (params.q) {
      const q = params.q.trim();
      where.push({ nombre: ILike(`%${q}%`) });
      where.push({ codigo: ILike(`%${q}%`) });
    }

    return this.repo.find({
      where: where.length ? where : undefined,
      order: { id: 'DESC' },
    });
  }





  findOne(id: number): Promise<Curso | null> {
    return this.repo.findOneBy({ id });
  }

  async create(data: Partial<Curso>): Promise<Curso> {
    this.normalize(data);

    if (!data.codigo || !data.nombre) {
      const err: any = new Error('codigo y nombre son obligatorios');
      err.status = 400;
      throw err;
    }

    const dup = await this.repo.findOne({
      where: { codigo: data.codigo },
    });
    if (dup) {
      const err: any = new Error('Ya existe un curso con ese código');
      err.status = 409;
      throw err;
    }

    const curso = this.repo.create(data);
    return this.repo.save(curso);
  }

  async update(id: number, data: Partial<Curso>): Promise<Curso | null> {
    this.normalize(data);

    if (data.codigo) {
      const conflict = await this.repo
        .createQueryBuilder('c')
        .where('c.codigo = :codigo', { codigo: data.codigo })
        .andWhere('c.id <> :id', { id })
        .getOne();
      if (conflict) {
        const err: any = new Error('Otro curso ya usa ese código');
        err.status = 409;
        throw err;
      }
    }

    const curso = await this.repo.findOneBy({ id });
    if (!curso) return null;

    this.repo.merge(curso, data);
    return this.repo.save(curso);
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.repo.delete(id);
    return (res.affected ?? 0) > 0;
  }

  /** usa la relación curso.planes -> pec.plan.id */
  findByPlan(planId: number): Promise<Curso[]> {
    return this.repo
      .createQueryBuilder('curso')
      .innerJoin('curso.planes', 'pec')
      .innerJoin('pec.plan', 'plan')
      .where('plan.id = :planId', { planId })
      .orderBy('curso.nombre', 'ASC')
      .getMany();
  }
}
