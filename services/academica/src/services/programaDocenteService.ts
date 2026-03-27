// src/services/programaDocenteService.ts
import { Repository } from 'typeorm';
import { ProgramaDocente } from '../entities/ProgramaDocente';
import { env } from '../config/env';

export type ListProgramaDocenteParams = {
  page?: number;
  pageSize?: number;
  programa_curso_id?: number; // filtra por ProgramaCurso
  docente_id?: number;        // filtra por Docente
  q?: string;                 // busca por doc/nombre/apellido del docente
};

export class ProgramaDocenteService {
  constructor(private repo: Repository<ProgramaDocente>) {}

  private normPorcentaje(val?: string | number | null) {
    if (val === undefined || val === null) return undefined;
    const n =
      typeof val === 'number' ? val : Number(String(val).replace(',', '.'));
    if (Number.isNaN(n)) return undefined;
    // guardamos como ENTERO en string
    return Math.round(n).toString();
  }

  async getAll(params: ListProgramaDocenteParams = {}) {
    const page = Math.max(1, Number(params.page || 1));

    // 🔧 paginación basada en variables de entorno
    const take = Math.min(
      env.pagination.maxPageSize,
      Math.max(
        1,
        Number(params.pageSize || env.pagination.defaultPageSize),
      ),
    );
    const skip = (page - 1) * take;

    const qb = this.repo
      .createQueryBuilder('pd')
      .leftJoinAndSelect('pd.docente', 'd')
      .leftJoinAndSelect('pd.programaCurso', 'pc')
      .leftJoinAndSelect('pc.planCurso', 'pec')
      .leftJoinAndSelect('pec.plan', 'plan')
      .leftJoinAndSelect('pec.curso', 'curso')
      .orderBy('pd.id', 'DESC')
      .skip(skip)
      .take(take);

    if (params.programa_curso_id)
      qb.andWhere('pc.id = :pcid', { pcid: params.programa_curso_id });
    if (params.docente_id)
      qb.andWhere('d.id = :did', { did: params.docente_id });
    if (params.q) {
      const q = `%${params.q.trim()}%`;
      qb.andWhere(
        '(d.documento ILIKE :q OR d.nombres ILIKE :q OR d.apellidos ILIKE :q)',
        { q },
      );
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize: take };
  }

  getById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: [
        'docente',
        'programaCurso',
        'programaCurso.planCurso',
        'programaCurso.planCurso.plan',
        'programaCurso.planCurso.curso',
      ],
    });
  }

  /** Crea la asignación docente↔programaCurso. Evita duplicados por (id_docente, id_programa). */
  async create(dto: {
    id_docente: number;
    id_programa: number;
    porcentaje?: number | string;
  }) {
    const dup = await this.repo.findOne({
      where: {
        docente: { id: dto.id_docente } as any,
        programaCurso: { id: dto.id_programa } as any,
      },
      relations: ['docente', 'programaCurso'],
    });
    if (dup) {
      const err: any = new Error(
        'El docente ya está asignado a este programa de curso',
      );
      err.status = 409;
      throw err;
    }

    const ent = this.repo.create({
      docente: { id: dto.id_docente } as any,
      programaCurso: { id: dto.id_programa } as any,
      porcentaje: this.normPorcentaje(dto.porcentaje) ?? '0',
    });
    await this.repo.save(ent);
    return this.getById(ent.id);
  }

  /** Actualiza porcentaje o (si lo permites) cambia docente/programa con chequeo de conflicto. */
  async update(
    id: number,
    dto: Partial<{
      id_docente: number;
      id_programa: number;
      porcentaje: number | string;
    }>,
  ) {
    const patch: any = {};
    if (dto.id_docente || dto.id_programa) {
      const current = await this.getById(id);
      if (!current) {
        const err: any = new Error('ProgramaDocente no encontrado');
        err.status = 404;
        throw err;
      }
      const newDocenteId = dto.id_docente ?? current.docente.id;
      const newProgId = dto.id_programa ?? current.programaCurso.id;

      // si cambió la pareja, validar duplicado
      if (
        newDocenteId !== current.docente.id ||
        newProgId !== current.programaCurso.id
      ) {
        const conflict = await this.repo.findOne({
          where: {
            docente: { id: newDocenteId } as any,
            programaCurso: { id: newProgId } as any,
          },
        });
        if (conflict) {
          const err: any = new Error(
            'Ya existe esa asignación docente↔programaCurso',
          );
          err.status = 409;
          throw err;
        }
        patch.docente = { id: newDocenteId };
        patch.programaCurso = { id: newProgId };
      }
    }
    if (dto.porcentaje !== undefined)
      patch.porcentaje = this.normPorcentaje(dto.porcentaje);

    await this.repo.update({ id }, patch);
    return this.getById(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
