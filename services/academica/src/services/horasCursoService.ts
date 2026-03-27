import { Repository } from "typeorm";
import { HorasCurso } from "../entities/HorasCurso";

export class HorasCursoService {
  constructor(private repo: Repository<HorasCurso>) {}

  private toInt(v: any, def = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : def;
  }

  /** Calcula totales si no vienen; valida que no haya negativos. */
  private normalize(dto: Partial<HorasCurso>) {
    const p_e  = this.toInt((dto as any).h_semanales_p_e,  dto.h_semanales_p_e ?? 0);
    const t_i  = this.toInt((dto as any).h_semanales_t_i,  dto.h_semanales_t_i ?? 0);
    const aat  = this.toInt((dto as any).h_semanales_a_a_t, dto.h_semanales_a_a_t ?? 0);
    const aap  = this.toInt((dto as any).h_semanales_a_a_p, dto.h_semanales_a_a_p ?? 0);
    const aatp = this.toInt((dto as any).h_semanales_a_a_t_p, dto.h_semanales_a_a_t_p ?? 0);

    const patch: Partial<HorasCurso> = {
      h_semanales_p_e: p_e,
      h_semanales_t_i: t_i,
      h_semanales_a_a_t: aat,
      h_semanales_a_a_p: aap,
      h_semanales_a_a_t_p: aatp,
    };

    if (dto.h_totales_curso === undefined || dto.h_totales_curso === null) {
      patch.h_totales_curso = p_e + t_i + aat + aap + aatp;
    } else {
      patch.h_totales_curso = this.toInt(dto.h_totales_curso, 0);
    }

    return patch;
  }

  listByProgramaCurso(programaCursoId: number) {
    return this.repo.find({
      where: { programaCurso: { id: programaCursoId } as any },
      order: { id: "ASC" },
    });
  }

  getById(id: number) {
    return this.repo.findOne({
      where: { id },
      relations: ["programaCurso", "programaCurso.planCurso", "programaCurso.planCurso.curso"],
    });
  }

  async createForProgramaCurso(programaCursoId: number, dto: Partial<HorasCurso>) {
    const data = this.normalize(dto);
    const ent = this.repo.create({
      ...data,
      programaCurso: { id: programaCursoId } as any,
    });
    await this.repo.save(ent);
    return this.getById(ent.id);
  }

  async update(id: number, dto: Partial<HorasCurso>) {
    const data = this.normalize(dto);
    await this.repo.update({ id }, data);
    const updated = await this.getById(id);
    if (!updated) {
      const err: any = new Error("HorasCurso no encontrado");
      err.status = 404;
      throw err;
    }
    return updated;
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
