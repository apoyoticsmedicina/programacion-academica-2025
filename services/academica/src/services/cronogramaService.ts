import { Repository } from 'typeorm';
import { Cronograma } from '../entities/Cronograma';

export class CronogramaService {
  constructor(private repo: Repository<Cronograma>) {}

  async getAll(): Promise<Cronograma[]> {
    // Incluye la relación al curso si la necesitas
    return this.repo.find({ relations: ['curso'] });
  }

  async getById(id: number): Promise<Cronograma | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['curso'],
    });
  }

  async create(dto: Partial<Cronograma>): Promise<Cronograma> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: number, dto: Partial<Cronograma>): Promise<Cronograma | null> {
    await this.repo.update(id, dto);
    return this.getById(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}