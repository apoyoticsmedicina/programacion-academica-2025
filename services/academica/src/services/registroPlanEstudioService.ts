import { Repository } from 'typeorm';
import { RegistroPlanEstudio } from '../entities/RegistroPlanEstudio';

export class RegistroPlanEstudioService {
  constructor(private repo: Repository<RegistroPlanEstudio>) {}

  getAll() {
    return this.repo.find({ relations: ['planEstudio'] });
  }

  getById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['planEstudio']
    });
  }

  create(dto: Partial<RegistroPlanEstudio>) {
    return this.repo.save(dto);
  }

  async update(id: number, dto: Partial<RegistroPlanEstudio>) {
    await this.repo.update(id, dto);
    return this.getById(id);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
