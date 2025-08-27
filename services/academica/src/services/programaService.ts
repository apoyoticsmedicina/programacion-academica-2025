import { Repository } from 'typeorm';
import { ProgramaAcademico } from '../entities/ProgramaAcademico';

export class ProgramasService {
  constructor(private repo: Repository<ProgramaAcademico>) {}

  async getAll(): Promise<ProgramaAcademico[]> {
    return this.repo.find();
  }

  async getById(id: number): Promise<ProgramaAcademico | null> {
    return this.repo.findOneBy({ id });
  }

  async create(data: Partial<ProgramaAcademico>): Promise<ProgramaAcademico> {
    const ent = this.repo.create(data);
    return this.repo.save(ent);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}