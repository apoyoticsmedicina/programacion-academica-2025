import { Repository } from 'typeorm';
import { CursoDocente } from '../entities/CursoDocente';

export class CursoDocenteService {
  constructor(private repo: Repository<CursoDocente>) {}

  getAll() {
    return this.repo.find({ relations: ['curso', 'docente'] });
  }

  getByIds(cursoId: number, docenteId: number) {
    return this.repo.findOne({
      where: { cursoId, docenteId },
      relations: ['curso', 'docente'],
    });
  }

  getByCurso(cursoId: number) {
    return this.repo.find({
      where: { cursoId },
      relations: ['curso', 'docente'],
    });
  }

  getByDocente(docenteId: number) {
    return this.repo.find({
      where: { docenteId },
      relations: ['curso', 'docente'],
    });
  }

  create(dto: Partial<CursoDocente>) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(cursoId: number, docenteId: number, dto: Partial<CursoDocente>) {
    await this.repo.update({ cursoId, docenteId }, dto);
    return this.getByIds(cursoId, docenteId);
  }

  remove(cursoId: number, docenteId: number) {
    return this.repo.delete({ cursoId, docenteId });
  }
}
