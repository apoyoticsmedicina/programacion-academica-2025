import { In, Repository } from "typeorm";
import { ProgramaCursoRequisito } from "../entities/ProgramaCursoRequisito";

export type ListReqParams = {
  programa_curso_id: number;
  tipo?: "prerrequisito" | "correquisito";
};

export class ProgramaCursoRequisitoService {
  constructor(private repo: Repository<ProgramaCursoRequisito>) {}

  private normalizeTipo(tipo?: string) {
    if (!tipo) return undefined;
    const t = tipo.trim().toLowerCase();
    if (t !== "prerrequisito" && t !== "correquisito") {
      const err: any = new Error(
        "tipo inválido: use 'prerrequisito' o 'correquisito'"
      );
      err.status = 400;
      throw err;
    }
    return t as "prerrequisito" | "correquisito";
  }

  async listByProgramaCurso(params: ListReqParams) {
    const tipo = this.normalizeTipo(params.tipo);
    return this.repo.find({
      where: {
        programaCursoId: params.programa_curso_id,
        ...(tipo ? { tipo } : {}),
      } as any,
      relations: ["programaCurso", "curso", "requisito"],
      order: { cursoId: "ASC", requisitoCursoId: "ASC" },
    });
  }

  /** Crea un requisito contextualizado al ProgramaCurso */
  async create(dto: {
    programa_curso_id: number;
    curso_id: number; // curso principal (catálogo)
    requisito_curso_id: number; // curso requisito (catálogo)
    tipo: "prerrequisito" | "correquisito";
  }) {
    const tipo = this.normalizeTipo(dto.tipo);

    if (dto.curso_id === dto.requisito_curso_id) {
      const err: any = new Error(
        "curso_id no puede ser igual a requisito_curso_id"
      );
      err.status = 400;
      throw err;
    }

    // Evitar duplicados (además de la PK compuesta en DB)
    const dup = await this.repo.findOne({
      where: {
        programaCursoId: dto.programa_curso_id,
        cursoId: dto.curso_id,
        requisitoCursoId: dto.requisito_curso_id,
        tipo,
      } as any,
    });
    if (dup) {
      const err: any = new Error(
        "El requisito ya existe para ese curso en este programa"
      );
      err.status = 409;
      throw err;
    }

    const ent = this.repo.create({
      programaCursoId: dto.programa_curso_id,
      cursoId: dto.curso_id,
      requisitoCursoId: dto.requisito_curso_id,
      tipo,
    } as any);
    return this.repo.save(ent);
  }

  /** Eliminación por PK compuesta */
  async remove(pk: {
    programa_curso_id: number;
    curso_id: number;
    requisito_curso_id: number;
    tipo: "prerrequisito" | "correquisito";
  }) {
    const tipo = this.normalizeTipo(pk.tipo);
    await this.repo.delete({
      programaCursoId: pk.programa_curso_id,
      cursoId: pk.curso_id,
      requisitoCursoId: pk.requisito_curso_id,
      tipo,
    } as any);
  }

  /** Opcional: carga masiva en un solo request */
  async bulkCreate(
    programa_curso_id: number,
    rows: Array<{
      curso_id: number;
      requisito_curso_id: number;
      tipo: "prerrequisito" | "correquisito";
    }>
  ) {
    // Validaciones básicas
    for (const r of rows) {
      this.normalizeTipo(r.tipo);
      if (r.curso_id === r.requisito_curso_id) {
        const err: any = new Error(
          "curso_id no puede ser igual a requisito_curso_id"
        );
        err.status = 400;
        throw err;
      }
    }

    // Filtra duplicados exactos ya existentes
    const existing = await this.repo.find({
      where: rows.map((r) => ({
        programaCursoId: programa_curso_id,
        cursoId: r.curso_id,
        requisitoCursoId: r.requisito_curso_id,
        tipo: r.tipo,
      })) as any,
      select: ["programaCursoId", "cursoId", "requisitoCursoId", "tipo"],
    });

    const existsSet = new Set(
      existing.map(
        (e) =>
          `${e.programaCursoId}|${e.cursoId}|${e.requisitoCursoId}|${e.tipo}`
      )
    );

    const partials: Array<Partial<ProgramaCursoRequisito>> = rows
      .filter(
        (r) =>
          !existsSet.has(
            `${programa_curso_id}|${r.curso_id}|${r.requisito_curso_id}|${r.tipo}`
          )
      )
      .map((r) => ({
        programaCursoId: programa_curso_id,
        cursoId: r.curso_id,
        requisitoCursoId: r.requisito_curso_id,
        tipo: r.tipo,
      }));

    if (!partials.length) return [];

    // 👇 una sola llamada a create con array
    const entities = this.repo.create(partials);
    // y save sobre array plano de entidades
    return this.repo.save(entities);
  }
}
