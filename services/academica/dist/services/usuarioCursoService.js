"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioCursoService = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const UsuarioCurso_1 = require("../entities/UsuarioCurso");
const Usuario_1 = require("../entities/Usuario");
const Curso_1 = require("../entities/Curso");
const PlanDeEstudioCurso_1 = require("../entities/PlanDeEstudioCurso");
const ROLES_COORD = new Set([
    "coordinador de programa",
    "coordinador de curso",
]);
class UsuarioCursoService {
    constructor() {
        this.ucRepo = data_source_1.AppDataSource.getRepository(UsuarioCurso_1.UsuarioCurso);
        this.userRepo = data_source_1.AppDataSource.getRepository(Usuario_1.Usuario);
        this.cursoRepo = data_source_1.AppDataSource.getRepository(Curso_1.Curso);
        this.pecRepo = data_source_1.AppDataSource.getRepository(PlanDeEstudioCurso_1.PlanEstudioCurso);
    }
    async listCursosByUsuario(usuarioId) {
        return this.ucRepo.find({
            where: { usuario: { id: usuarioId } },
            relations: { curso: true },
            order: { id: "ASC" },
        });
    }
    /**
     * Reemplaza la asignación completa de cursos para un usuario
     */
    async setCursosForUsuario(usuarioId, payload) {
        const ids = this.normalizeIds(payload?.cursoIds);
        return data_source_1.AppDataSource.transaction(async (manager) => {
            const userR = manager.getRepository(Usuario_1.Usuario);
            const cursoR = manager.getRepository(Curso_1.Curso);
            const ucR = manager.getRepository(UsuarioCurso_1.UsuarioCurso);
            const pecR = manager.getRepository(PlanDeEstudioCurso_1.PlanEstudioCurso);
            const usuario = await userR.findOne({ where: { id: usuarioId } });
            if (!usuario)
                throw new Error("Usuario no encontrado.");
            if (!ROLES_COORD.has(usuario.rol)) {
                throw new Error("Solo se pueden asignar cursos a usuarios con rol 'coordinador de programa' o 'coordinador de curso'.");
            }
            // Validar existencia de cursos
            const cursos = ids.length
                ? await cursoR.find({ where: { id: (0, typeorm_1.In)(ids) } })
                : [];
            if (ids.length && cursos.length !== ids.length) {
                throw new Error("Uno o más cursos no existen.");
            }
            // Validar que cada curso tenga PlanEstudioCurso y plan asociado (programa queda garantizado por FK del plan)
            const validCursoIds = await this.getCursosConPlanYPrograma(ids, pecR);
            if (validCursoIds.length !== ids.length) {
                const invalid = ids.filter((x) => !validCursoIds.includes(x));
                throw new Error(`Los siguientes cursos no tienen Plan de Estudio/Programa asignado: ${invalid.join(", ")}`);
            }
            // Reemplazo total: borrar vínculos previos + insertar nuevos
            await ucR.delete({ usuario: { id: usuarioId } });
            if (cursos.length) {
                const rows = cursos.map((c) => ucR.create({ usuario, curso: c }));
                await ucR.save(rows);
            }
            return ucR.find({
                where: { usuario: { id: usuarioId } },
                relations: { curso: true },
                order: { id: "ASC" },
            });
        });
    }
    /**
     * Agrega cursos sin eliminar los previos
     */
    async addCursosToUsuario(usuarioId, payload) {
        const ids = this.normalizeIds(payload?.cursoIds);
        return data_source_1.AppDataSource.transaction(async (manager) => {
            const userR = manager.getRepository(Usuario_1.Usuario);
            const cursoR = manager.getRepository(Curso_1.Curso);
            const ucR = manager.getRepository(UsuarioCurso_1.UsuarioCurso);
            const pecR = manager.getRepository(PlanDeEstudioCurso_1.PlanEstudioCurso);
            const usuario = await userR.findOne({ where: { id: usuarioId } });
            if (!usuario)
                throw new Error("Usuario no encontrado.");
            if (!ROLES_COORD.has(usuario.rol)) {
                throw new Error("Solo se pueden asignar cursos a usuarios con rol 'coordinador de programa' o 'coordinador de curso'.");
            }
            const cursos = ids.length
                ? await cursoR.find({ where: { id: (0, typeorm_1.In)(ids) } })
                : [];
            if (ids.length && cursos.length !== ids.length) {
                throw new Error("Uno o más cursos no existen.");
            }
            const validCursoIds = await this.getCursosConPlanYPrograma(ids, pecR);
            if (validCursoIds.length !== ids.length) {
                const invalid = ids.filter((x) => !validCursoIds.includes(x));
                throw new Error(`Los siguientes cursos no tienen Plan de Estudio/Programa asignado: ${invalid.join(", ")}`);
            }
            // Insertar ignorando duplicados (por UQ usuario+curso)
            for (const c of cursos) {
                try {
                    await ucR.save(ucR.create({ usuario, curso: c }));
                }
                catch {
                    // ignore conflict
                }
            }
            return ucR.find({
                where: { usuario: { id: usuarioId } },
                relations: { curso: true },
                order: { id: "ASC" },
            });
        });
    }
    async removeCursoFromUsuario(usuarioId, cursoId) {
        const res = await this.ucRepo.delete({
            usuario: { id: usuarioId },
            curso: { id: cursoId },
        });
        return !!res.affected;
    }
    // ================== helpers ==================
    normalizeIds(input) {
        const arr = Array.isArray(input) ? input : [];
        const ids = arr.map((x) => Number(x)).filter((n) => Number.isInteger(n) && n > 0);
        return Array.from(new Set(ids));
    }
    /**
     * Retorna los curso_id que cumplen:
     * existe PEC + join PlanDeEstudio (por plan_estudio_id).
     */
    async getCursosConPlanYPrograma(cursoIds, pecRepo) {
        if (!cursoIds.length)
            return [];
        const rows = await pecRepo
            .createQueryBuilder("pec")
            .innerJoin("pec.plan", "plan") // PlanDeEstudio
            .select('DISTINCT pec."curso_id"', "curso_id")
            .where('pec."curso_id" IN (:...ids)', { ids: cursoIds })
            .getRawMany();
        return rows.map((r) => Number(r.curso_id)).filter((n) => Number.isInteger(n));
    }
    async listCursosDisponibles(usuarioId) {
        // 1) cursos que cumplen “tiene plan+programa” (por existencia en PEC + join plan)
        const disponibles = await this.cursoRepo
            .createQueryBuilder("c")
            .innerJoin(PlanDeEstudioCurso_1.PlanEstudioCurso, "pec", 'pec."curso_id" = c.id')
            .innerJoin("pec.plan", "plan") // asegura plan asociado
            .select([
            "c.id AS id",
            "c.codigo AS codigo",
            "c.nombre AS nombre",
        ])
            .distinct(true)
            .orderBy("c.codigo", "ASC")
            .getRawMany();
        // 2) cursos ya asignados a este usuario
        const asignados = await this.ucRepo.find({
            where: { usuario: { id: usuarioId } },
            relations: { curso: true },
        });
        const assignedSet = new Set(asignados.map((x) => x.curso?.id).filter(Boolean));
        // 3) merge para UI
        return disponibles.map((c) => ({
            id: Number(c.id),
            codigo: c.codigo,
            nombre: c.nombre,
            asignado: assignedSet.has(Number(c.id)),
        }));
    }
}
exports.UsuarioCursoService = UsuarioCursoService;
//# sourceMappingURL=usuarioCursoService.js.map