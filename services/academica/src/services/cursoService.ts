import { Repository } from 'typeorm';
import { Curso } from '../entities/Curso';

export class CursoService {
  constructor(private repo: Repository<Curso>) {}

  getAll(): Promise<Curso[]> {
    return this.repo.find();
  }

  findOne(id: number): Promise<Curso | null> {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<Curso>): Promise<Curso> {
    const curso = this.repo.create(data);
    return this.repo.save(curso);
  }

  async update(id: number, data: Partial<Curso>): Promise<Curso | null> {
    const curso = await this.repo.findOneBy({ id });
    if (!curso) return null;
    this.repo.merge(curso, data);
    return this.repo.save(curso);
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.repo.delete(id);
    return (res.affected ?? 0) > 0;
  }

    findByPlan(planId: number): Promise<Curso[]> {
    return this.repo.createQueryBuilder('curso')
      .innerJoin('curso.planesEstudio', 'pec', 'pec.planEstudioId = :planId', { planId })
      .getMany();
  }

}
