// planEstudioService.ts

import { Repository } from 'typeorm';
import { PlanEstudio } from '../entities/PlanEstudio';
import { ProgramaAcademico } from '../entities/ProgramaAcademico';

export class PlanEstudioService {
  constructor(private repo: Repository<PlanEstudio>) {}

  getAll() {
    return this.repo.find({
      relations: ['programa', 'registros', 'cursos']
    });
  }
  
  
  getByPrograma(programaId: number) {
    return this.repo.find({
      where: { programa: { id: programaId } },
      relations: ['programa', 'registros', 'cursos']
    });
  }

  getById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ['programa', 'registros', 'cursos']
    });
  }

  create(dto: Partial<PlanEstudio>) {
    return this.repo.save(dto);
  }

  async update(
    id: number,
    dto: { programaId?: number; version?: string }
  ): Promise<PlanEstudio | null> {
    // 1) Buscamos el plan original (con el programa relacionado)
    const actual = await this.repo.findOne({
      where: { id },
      relations: ['programa'],
    });
    if (!actual) return null;

    // 2) Desactivamos la fila existente
    actual.activo = false;
    await this.repo.save(actual);

    // 3) Si no vino nueva versión, devolvemos el “actual” desactivado
    if (!dto.version || dto.version === actual.version) {
      return actual;
    }

    // 4) Cargamos el programa (si viniera otro, o reusamos el mismo)
    const programaRepo = this.repo.manager.getRepository(ProgramaAcademico);
    const programa = dto.programaId
      ? await programaRepo.findOneBy({ id: dto.programaId })
      : actual.programa!;
    if (!programa) throw new Error('Programa no encontrado');

    // 5) Creamos y guardamos el nuevo plan con la nueva versión
    const nuevo = this.repo.create({
      version: dto.version,
      activo: true,
      programa,
    });
    return this.repo.save(nuevo);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}