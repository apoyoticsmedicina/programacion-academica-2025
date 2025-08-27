import { Repository } from 'typeorm';
import { CursoRequisito } from '../entities/RequisitosCurso';

export class CursoRequisitoService {
  constructor(private repo: Repository<CursoRequisito>) {}

  /** Devuelve todos los requisitos, con sus cursos relacionados */
  getAll() {
    return this.repo.find({ relations: ['curso', 'requisito'] });
  }

  /** Busca un requisito por su clave compuesta (cursoId + requisitoId) */
  getByIds(cursoId: number, requisitoId: number) {
    return this.repo.findOne({
      where: { cursoId, requisitoId },
      relations: ['curso', 'requisito']
    });
  }

  /** Crea un nuevo par (curso, requisito) */
  create(dto: Partial<CursoRequisito>) {
    return this.repo.save(dto);
  }

  /** Actualiza el tipo (prerrequisito/correquisito) */
  async update(
    cursoId: number,
    requisitoId: number,
    dto: Partial<CursoRequisito>
  ) {
    await this.repo.update({ cursoId, requisitoId }, dto);
    return this.getByIds(cursoId, requisitoId);
  }

  /** Elimina la asociación */
  remove(cursoId: number, requisitoId: number) {
    return this.repo.delete({ cursoId, requisitoId });
  }
}
