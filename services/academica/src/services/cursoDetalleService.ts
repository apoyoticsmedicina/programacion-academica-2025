import { Repository } from 'typeorm';
import { CursoDetalle } from '../entities/CursoDetalle';

export class CursoDetalleService {
  constructor(private repo: Repository<CursoDetalle>) {}

  getAll() {
    return this.repo.find({ relations: ['curso'] });
  }

  getById(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['curso'] });
  }

  getByCurso(cursoId: number) {
    return this.repo.findOne({
      where: { curso: { id: cursoId } },
      relations: ['curso'],
    });
  }

  create(dto: Partial<CursoDetalle>) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: number, dto: Partial<CursoDetalle>) {
    // Como update no maneja relaciones, preferimos merge + save
    const found = await this.getById(id);
    if (!found) return null;
    const merged = this.repo.merge(found, dto);
    return this.repo.save(merged);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
