// PlanEstudioUrsoService.ts

import { Repository } from 'typeorm';
import { PlanEstudioCurso } from '../entities/PlanEstudioCurso';

export class PlanEstudioCursoService {
  constructor(private repo: Repository<PlanEstudioCurso>) {}

  getAll() {
    return this.repo.find({ relations: ['planEstudio', 'curso'] });
  }

  getByIds(planId: number, cursoId: number) {
    return this.repo.findOne({
      where: { planEstudioId: planId, cursoId },
      relations: ['planEstudio', 'curso']
    });
  }

  create(dto: Partial<PlanEstudioCurso>) {
    return this.repo.save(dto);
  }

  async update(planId: number, cursoId: number, dto: Partial<PlanEstudioCurso>) {
    await this.repo.update({ planEstudioId: planId, cursoId }, dto);
    return this.getByIds(planId, cursoId);
  }

  remove(planId: number, cursoId: number) {
    return this.repo.delete({ planEstudioId: planId, cursoId });
  }
}
