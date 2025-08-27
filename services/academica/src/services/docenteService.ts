import { Repository } from 'typeorm';
import { Docente } from '../entities/Docente';

export class DocenteService {
  constructor(private repo: Repository<Docente>) {}

  getAll() {
    return this.repo.find();
  }

  getById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: Partial<Docente>) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: number, dto: Partial<Docente>) {
    await this.repo.update(id, dto);
    return this.getById(id);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
