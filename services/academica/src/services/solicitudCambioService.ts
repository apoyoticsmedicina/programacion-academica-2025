import { Repository } from 'typeorm';
import { SolicitudCambio } from '../entities/SolicitudCambio';

export class SolicitudCambioService {
  constructor(private repo: Repository<SolicitudCambio>) {}

  getAll() {
    return this.repo.find({ relations: ['curso'] });
  }

  getById(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['curso'] });
  }

  getByCurso(cursoId: number) {
    return this.repo.find({
      where: { curso: { id: cursoId } },
      relations: ['curso'],
    });
  }

  create(dto: Partial<SolicitudCambio>) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: number, dto: Partial<SolicitudCambio>) {
    await this.repo.update(id, dto);
    return this.getById(id);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
