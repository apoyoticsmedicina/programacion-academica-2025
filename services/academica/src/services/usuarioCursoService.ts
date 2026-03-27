import { In } from "typeorm";
import { AppDataSource } from "../config/data-source";

import { UsuarioCurso } from "../entities/UsuarioCurso";
import { Usuario } from "../entities/Usuario";
import { Curso } from "../entities/Curso";
import { PlanEstudioCurso } from "../entities/PlanDeEstudioCurso";

type SetCursosPayload = {
    cursoIds: number[];
};

type CursoDisponible = {
    id: number;
    codigo: string;
    nombre: string;
    asignado: boolean;
};

const ROLES_COORD = new Set<Usuario["rol"]>([
    "coordinador de programa",
    "coordinador de curso",
]);

export class UsuarioCursoService {
    private ucRepo = AppDataSource.getRepository(UsuarioCurso);
    private userRepo = AppDataSource.getRepository(Usuario);
    private cursoRepo = AppDataSource.getRepository(Curso);
    private pecRepo = AppDataSource.getRepository(PlanEstudioCurso);

    async listCursosByUsuario(usuarioId: number) {
        return this.ucRepo.find({
            where: { usuario: { id: usuarioId } as any },
            relations: { curso: true },
            order: { id: "ASC" },
        });
    }

    /**
     * Reemplaza la asignación completa de cursos para un usuario
     */
    async setCursosForUsuario(usuarioId: number, payload: SetCursosPayload) {
        const ids = this.normalizeIds(payload?.cursoIds);

        return AppDataSource.transaction(async (manager) => {
            const userR = manager.getRepository(Usuario);
            const cursoR = manager.getRepository(Curso);
            const ucR = manager.getRepository(UsuarioCurso);
            const pecR = manager.getRepository(PlanEstudioCurso);

            const usuario = await userR.findOne({ where: { id: usuarioId } });
            if (!usuario) throw new Error("Usuario no encontrado.");

            if (!ROLES_COORD.has(usuario.rol)) {
                throw new Error(
                    "Solo se pueden asignar cursos a usuarios con rol 'coordinador de programa' o 'coordinador de curso'."
                );
            }

            // Validar existencia de cursos
            const cursos = ids.length
                ? await cursoR.find({ where: { id: In(ids) } })
                : [];
            if (ids.length && cursos.length !== ids.length) {
                throw new Error("Uno o más cursos no existen.");
            }

            // Validar que cada curso tenga PlanEstudioCurso y plan asociado (programa queda garantizado por FK del plan)
            const validCursoIds = await this.getCursosConPlanYPrograma(ids, pecR);
            if (validCursoIds.length !== ids.length) {
                const invalid = ids.filter((x) => !validCursoIds.includes(x));
                throw new Error(
                    `Los siguientes cursos no tienen Plan de Estudio/Programa asignado: ${invalid.join(", ")}`
                );
            }

            // Reemplazo total: borrar vínculos previos + insertar nuevos
            await ucR.delete({ usuario: { id: usuarioId } as any });

            if (cursos.length) {
                const rows = cursos.map((c) => ucR.create({ usuario, curso: c }));
                await ucR.save(rows);
            }

            return ucR.find({
                where: { usuario: { id: usuarioId } as any },
                relations: { curso: true },
                order: { id: "ASC" },
            });
        });
    }

    /**
     * Agrega cursos sin eliminar los previos
     */
    async addCursosToUsuario(usuarioId: number, payload: SetCursosPayload) {
        const ids = this.normalizeIds(payload?.cursoIds);

        return AppDataSource.transaction(async (manager) => {
            const userR = manager.getRepository(Usuario);
            const cursoR = manager.getRepository(Curso);
            const ucR = manager.getRepository(UsuarioCurso);
            const pecR = manager.getRepository(PlanEstudioCurso);

            const usuario = await userR.findOne({ where: { id: usuarioId } });
            if (!usuario) throw new Error("Usuario no encontrado.");

            if (!ROLES_COORD.has(usuario.rol)) {
                throw new Error(
                    "Solo se pueden asignar cursos a usuarios con rol 'coordinador de programa' o 'coordinador de curso'."
                );
            }

            const cursos = ids.length
                ? await cursoR.find({ where: { id: In(ids) } })
                : [];
            if (ids.length && cursos.length !== ids.length) {
                throw new Error("Uno o más cursos no existen.");
            }

            const validCursoIds = await this.getCursosConPlanYPrograma(ids, pecR);
            if (validCursoIds.length !== ids.length) {
                const invalid = ids.filter((x) => !validCursoIds.includes(x));
                throw new Error(
                    `Los siguientes cursos no tienen Plan de Estudio/Programa asignado: ${invalid.join(", ")}`
                );
            }

            // Insertar ignorando duplicados (por UQ usuario+curso)
            for (const c of cursos) {
                try {
                    await ucR.save(ucR.create({ usuario, curso: c }));
                } catch {
                    // ignore conflict
                }
            }

            return ucR.find({
                where: { usuario: { id: usuarioId } as any },
                relations: { curso: true },
                order: { id: "ASC" },
            });
        });
    }

    async removeCursoFromUsuario(usuarioId: number, cursoId: number) {
        const res = await this.ucRepo.delete({
            usuario: { id: usuarioId } as any,
            curso: { id: cursoId } as any,
        });
        return !!res.affected;
    }

    // ================== helpers ==================

    private normalizeIds(input: any): number[] {
        const arr = Array.isArray(input) ? input : [];
        const ids = arr.map((x) => Number(x)).filter((n) => Number.isInteger(n) && n > 0);
        return Array.from(new Set(ids));
    }

    /**
     * Retorna los curso_id que cumplen:
     * existe PEC + join PlanDeEstudio (por plan_estudio_id).
     */
    private async getCursosConPlanYPrograma(
        cursoIds: number[],
        pecRepo: ReturnType<typeof AppDataSource.getRepository<PlanEstudioCurso>>
    ): Promise<number[]> {
        if (!cursoIds.length) return [];

        const rows = await pecRepo
            .createQueryBuilder("pec")
            .innerJoin("pec.plan", "plan") // PlanDeEstudio
            .select('DISTINCT pec."curso_id"', "curso_id")
            .where('pec."curso_id" IN (:...ids)', { ids: cursoIds })
            .getRawMany<{ curso_id: number }>();

        return rows.map((r) => Number(r.curso_id)).filter((n) => Number.isInteger(n));
    }

    async listCursosDisponibles(usuarioId: number) {
        // 1) cursos que cumplen “tiene plan+programa” (por existencia en PEC + join plan)
        const disponibles = await this.cursoRepo
            .createQueryBuilder("c")
            .innerJoin(PlanEstudioCurso, "pec", 'pec."curso_id" = c.id')
            .innerJoin("pec.plan", "plan") // asegura plan asociado
            .select([
                "c.id AS id",
                "c.codigo AS codigo",
                "c.nombre AS nombre",
            ])
            .distinct(true)
            .orderBy("c.codigo", "ASC")
            .getRawMany<{ id: number; codigo: string; nombre: string }>();

        // 2) cursos ya asignados a este usuario
        const asignados = await this.ucRepo.find({
            where: { usuario: { id: usuarioId } as any },
            relations: { curso: true },
        });

        const assignedSet = new Set(asignados.map((x) => x.curso?.id).filter(Boolean) as number[]);

        // 3) merge para UI
        return disponibles.map((c) => ({
            id: Number(c.id),
            codigo: c.codigo,
            nombre: c.nombre,
            asignado: assignedSet.has(Number(c.id)),
        }));
    }
}