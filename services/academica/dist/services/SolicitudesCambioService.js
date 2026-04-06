"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudesCambioService = void 0;
const data_source_1 = require("../config/data-source");
const SolicitudCambio_1 = require("../entities/SolicitudCambio");
const Usuario_1 = require("../entities/Usuario");
const ProgramaCurso_1 = require("../entities/ProgramaCurso");
const PlanDeEstudioCurso_1 = require("../entities/PlanDeEstudioCurso");
const UsuarioCurso_1 = require("../entities/UsuarioCurso");
const Curso_1 = require("../entities/Curso");
const ProgramaMetodologia_1 = require("../entities/ProgramaMetodologia");
const ProgramaMetodologiaEstrategia_1 = require("../entities/ProgramaMetodologiaEstrategia");
const ProgramaEvaluacion_1 = require("../entities/ProgramaEvaluacion");
const ProgramaBibliografia_1 = require("../entities/ProgramaBibliografia");
const ProgramaDocente_1 = require("../entities/ProgramaDocente");
const programaCursoService_1 = require("./programaCursoService");
const ROLES_COORD = new Set([
    "coordinador de programa",
    "coordinador de curso",
]);
const ROLES_ADMIN = new Set(["superadmin", "admin"]);
class SolicitudesCambioService {
    constructor() {
        this.repo = data_source_1.AppDataSource.getRepository(SolicitudCambio_1.SolicitudCambio);
    }
    // ============== LISTADOS ==============
    async listPendientes() {
        return this.repo.find({
            where: { estado: "pendiente" },
            relations: { curso: true, programaCurso: true, solicitante: true },
            order: { id: "DESC" },
        });
    }
    async listMias(solicitanteId) {
        return this.repo.find({
            where: { solicitante: { id: solicitanteId } },
            relations: {
                curso: true,
                programaCurso: true,
                solicitante: true,
                resueltoPor: true,
            },
            order: { id: "DESC" },
        });
    }
    async getById(id) {
        return this.repo.findOne({
            where: { id },
            relations: {
                curso: true,
                programaCurso: true,
                solicitante: true,
                resueltoPor: true,
            },
        });
    }
    async getByIdForUser(userId, rol, id) {
        // Admin/Superadmin puede ver cualquiera
        if (rol === "admin" || rol === "superadmin") {
            return this.getById(id);
        }
        // Coordinador solo puede ver las suyas
        if (rol === "coordinador de curso" || rol === "coordinador de programa") {
            return this.repo.findOne({
                where: { id, solicitante: { id: userId } },
                relations: {
                    curso: true,
                    programaCurso: true,
                    solicitante: true,
                    resueltoPor: true,
                },
            });
        }
        return null;
    }
    // ============== CREAR (coordinador) ==============
    async crear(solicitanteId, body) {
        const programaCursoId = Number(body?.programaCursoId);
        if (!Number.isInteger(programaCursoId) || programaCursoId <= 0) {
            throw new Error("programaCursoId inválido");
        }
        const propuesta = body?.propuesta;
        if (!propuesta ||
            typeof propuesta !== "object" ||
            Array.isArray(propuesta)) {
            throw new Error("propuesta es obligatoria y debe ser un objeto JSON");
        }
        return data_source_1.AppDataSource.transaction(async (manager) => {
            const userR = manager.getRepository(Usuario_1.Usuario);
            const scR = manager.getRepository(SolicitudCambio_1.SolicitudCambio);
            const pcR = manager.getRepository(ProgramaCurso_1.ProgramaCurso);
            const pecR = manager.getRepository(PlanDeEstudioCurso_1.PlanEstudioCurso);
            const ucR = manager.getRepository(UsuarioCurso_1.UsuarioCurso);
            const cursoR = manager.getRepository(Curso_1.Curso);
            // 1) validar solicitante y rol
            const solicitante = await userR.findOne({ where: { id: solicitanteId } });
            if (!solicitante)
                throw new Error("Usuario solicitante no existe.");
            if (!ROLES_COORD.has(solicitante.rol)) {
                throw new Error("Solo coordinadores pueden crear solicitudes de cambio.");
            }
            // 2) programa curso y curso asociado (via plan_estudio_cursos)
            const programaCurso = await pcR.findOne({
                where: { id: programaCursoId },
                relations: { planCurso: true },
            });
            if (!programaCurso)
                throw new Error("ProgramaCurso no encontrado.");
            const pecId = programaCurso.planCurso?.id;
            if (!pecId)
                throw new Error("ProgramaCurso sin planCurso asociado.");
            const pec = await pecR.findOne({
                where: { id: pecId },
                relations: { curso: true },
            });
            if (!pec?.curso) {
                throw new Error("No se pudo resolver el curso del ProgramaCurso.");
            }
            const curso = await cursoR.findOne({ where: { id: pec.curso.id } });
            if (!curso)
                throw new Error("Curso no encontrado.");
            // 3) validar que el coordinador esté asignado al curso
            const vinculo = await ucR.findOne({
                where: {
                    usuario: { id: solicitanteId },
                    curso: { id: curso.id },
                },
            });
            if (!vinculo) {
                throw new Error("El coordinador no está asignado a este curso.");
            }
            // 4) evitar duplicado pendiente por programa_curso
            const yaPendiente = await scR.findOne({
                where: {
                    programaCurso: { id: programaCursoId },
                    estado: "pendiente",
                },
            });
            if (yaPendiente) {
                throw new Error("Ya existe una solicitud pendiente para este programa.");
            }
            // 5) snapshot real (mismo shape del payload upsertAvanzado)
            const snapshot = await this.buildSnapshotAvanzado(manager, programaCursoId);
            const entity = scR.create({
                curso,
                programaCurso,
                solicitante,
                estado: "pendiente",
                motivo: body?.motivo ?? null,
                propuesta,
                snapshot,
                actualizado_en: new Date(),
            });
            return scR.save(entity);
        });
    }
    // ============== APROBAR / RECHAZAR (admin) ==============
    async aprobar(adminId, solicitudId, body) {
        return data_source_1.AppDataSource.transaction(async (manager) => {
            const userR = manager.getRepository(Usuario_1.Usuario);
            const scR = manager.getRepository(SolicitudCambio_1.SolicitudCambio);
            const admin = await userR.findOne({ where: { id: adminId } });
            if (!admin)
                throw new Error("Admin no existe.");
            if (!ROLES_ADMIN.has(admin.rol))
                throw new Error("Forbidden");
            const sc = await scR.findOne({
                where: { id: solicitudId },
                relations: { programaCurso: true },
            });
            if (!sc)
                throw new Error("Solicitud no encontrada.");
            if (sc.estado !== "pendiente")
                throw new Error("La solicitud ya fue resuelta.");
            // ✅ PARCHE: Construir un payload COMPLETO para upsertAvanzado
            // para que NO meta "Por definir." en campos no enviados.
            const payloadFinal = mergeSnapshotWithPropuesta((sc.snapshot || {}), (sc.propuesta || {}));
            // ✅ importante: usar repos del manager (misma transacción)
            const pcSvcTx = new programaCursoService_1.ProgramaCursoService(manager.getRepository(ProgramaCurso_1.ProgramaCurso), manager.getRepository(ProgramaMetodologia_1.ProgramaMetodologia), manager.getRepository(ProgramaEvaluacion_1.ProgramaEvaluacion), manager.getRepository(ProgramaMetodologiaEstrategia_1.ProgramaMetodologiaEstrategia), manager.getRepository(ProgramaBibliografia_1.ProgramaBibliografia));
            await pcSvcTx.upsertAvanzado(sc.programaCurso.id, payloadFinal);
            if (sc.propuesta?.comunidad !== undefined) {
                await syncProgramaDocenteFromComunidad(manager, sc.programaCurso.id, sc.propuesta.comunidad);
            }
            sc.estado = "aprobada";
            sc.comentario_admin = body?.comentario ?? null;
            sc.resueltoPor = admin;
            sc.resuelto_en = new Date();
            sc.actualizado_en = new Date();
            await scR.save(sc);
            return { ok: true, solicitud: sc };
        });
    }
    async rechazar(adminId, solicitudId, body) {
        return data_source_1.AppDataSource.transaction(async (manager) => {
            const userR = manager.getRepository(Usuario_1.Usuario);
            const scR = manager.getRepository(SolicitudCambio_1.SolicitudCambio);
            const admin = await userR.findOne({ where: { id: adminId } });
            if (!admin)
                throw new Error("Admin no existe.");
            if (!ROLES_ADMIN.has(admin.rol))
                throw new Error("Forbidden");
            const sc = await scR.findOne({ where: { id: solicitudId } });
            if (!sc)
                throw new Error("Solicitud no encontrada.");
            if (sc.estado !== "pendiente")
                throw new Error("La solicitud ya fue resuelta.");
            sc.estado = "rechazada";
            sc.comentario_admin = body?.comentario ?? null;
            sc.resueltoPor = admin;
            sc.resuelto_en = new Date();
            sc.actualizado_en = new Date();
            await scR.save(sc);
            return { ok: true, solicitud: sc };
        });
    }
    // ============== helpers ==============
    async buildSnapshotAvanzado(manager, programaCursoId) {
        const pcR = manager.getRepository(ProgramaCurso_1.ProgramaCurso);
        const pcFull = await pcR.findOne({ where: { id: programaCursoId } });
        if (!pcFull)
            throw new Error("ProgramaCurso no encontrado.");
        const metodologiaRepo = manager.getRepository(ProgramaMetodologia_1.ProgramaMetodologia);
        const estrategiasRepo = manager.getRepository(ProgramaMetodologiaEstrategia_1.ProgramaMetodologiaEstrategia);
        const evalRepo = manager.getRepository(ProgramaEvaluacion_1.ProgramaEvaluacion);
        const biblioRepo = manager.getRepository(ProgramaBibliografia_1.ProgramaBibliografia);
        const progDocRepo = manager.getRepository(ProgramaDocente_1.ProgramaDocente);
        const metodologia = await metodologiaRepo.findOne({
            where: { programaCurso: { id: programaCursoId } },
            order: { id: "DESC" },
        });
        // ⚠️ Ajusta "estrategia" si el nombre real difiere
        const estrategiasRows = await estrategiasRepo.find({
            where: { programaCurso: { id: programaCursoId } },
            relations: { estrategia: true },
        });
        const estrategiaIds = (estrategiasRows || [])
            .map((r) => r?.estrategia?.id)
            .filter((x) => Number.isInteger(Number(x)))
            .map((x) => Number(x));
        const evalRows = await evalRepo.find({
            where: { programaCurso: { id: programaCursoId } },
            order: { id: "ASC" },
        });
        const biblioRows = await biblioRepo.find({
            where: { programaCurso: { id: programaCursoId } },
            order: { id: "ASC" },
        });
        // ✅ Comunidad actual: ProgramaDocente + Docente
        // Ajusta relations si tu relación se llama distinto
        const comunidadRows = await progDocRepo.find({
            where: { programaCurso: { id: programaCursoId } },
            relations: { docente: true },
            order: { id: "ASC" },
        });
        const comunidad = (comunidadRows || [])
            .map((pd) => {
            const d = pd?.docente;
            const docenteId = d?.id ?? pd?.docenteId ?? pd?.docente_id ?? pd?.id_docente ?? null;
            if (!docenteId)
                return null;
            const nombre = [d?.nombres, d?.apellidos].filter(Boolean).join(" ").trim();
            const unidad = d?.unidad_academica ??
                d?.unidadAcademica ??
                d?.dependencia ??
                pd?.unidad_academica ??
                null;
            return {
                docente_id: Number(docenteId),
                nombre: nombre || null,
                unidad_academica: unidad,
                porcentaje: Number(pd?.porcentaje ?? 0),
            };
        })
            .filter(Boolean);
        return {
            perfil: pcFull.perfil ?? null,
            intencionalidades_formativas: pcFull.intencionalidadesFormativas ?? null,
            aportes_curso_formacion: pcFull.aportesCursoFormacion ?? null,
            descripcion_conocimientos: pcFull.descripcionConocimientos ?? null,
            vigencia: pcFull.vigencia ?? null,
            medios_recursos: metodologia?.mediosYRecursos ?? null,
            formas_interaccion: metodologia?.formasInteraccion ?? null,
            estrategias_internacionalizacion: metodologia?.estrategiasInternacionalizacion ?? null,
            estrategias_enfoque: metodologia?.estrategiasEnfoque ?? null,
            estrategias: Array.from(new Set(estrategiaIds)),
            evaluacion: (evalRows || []).map((r) => ({
                momentos_evaluacion: r.momentosEvaluacion,
                porcentaje: Number(r.porcentaje),
            })),
            bibliografia: (biblioRows || []).map((b) => ({
                cultura: b.cultura ?? null,
                referencia: b.referencia,
                palabras_clave: b.palabrasClave ?? null,
            })),
            // ✅ NUEVO: comunidad en snapshot
            comunidad,
        };
    }
}
exports.SolicitudesCambioService = SolicitudesCambioService;
/**
 * Construye un payload COMPLETO para ProgramaCursoService.upsertAvanzado:
 * - Si un campo NO viene en propuesta, usa el snapshot.
 * - Así evitamos que upsertAvanzado meta placeholders “Por definir.” por undefined
 * - y evitamos borrar evaluacion/bibliografia por ausencia.
 */
function mergeSnapshotWithPropuesta(snapshot, propuesta) {
    const out = {};
    const pick = (k) => {
        if (propuesta && propuesta[k] !== undefined)
            return propuesta[k];
        return snapshot[k];
    };
    // textos + metodología
    out.perfil = pick("perfil");
    out.intencionalidades_formativas = pick("intencionalidades_formativas");
    out.aportes_curso_formacion = pick("aportes_curso_formacion");
    out.descripcion_conocimientos = pick("descripcion_conocimientos");
    out.vigencia = pick("vigencia");
    out.medios_recursos = pick("medios_recursos");
    out.formas_interaccion = pick("formas_interaccion");
    out.estrategias_internacionalizacion = pick("estrategias_internacionalizacion");
    out.estrategias_enfoque = pick("estrategias_enfoque");
    // listas (si NO vienen, preservamos snapshot para que upsert no las borre)
    out.estrategias = pick("estrategias") ?? [];
    out.evaluacion = pick("evaluacion") ?? [];
    out.bibliografia = pick("bibliografia") ?? [];
    // comunidad: se preserva para UI/registro (aunque upsertAvanzado hoy no la aplica)
    if (propuesta.comunidad !== undefined)
        out.comunidad = propuesta.comunidad;
    else if (snapshot.comunidad !== undefined)
        out.comunidad = snapshot.comunidad;
    return out;
}
/**
 * Aplica comunidad académica en ProgramaDocente (sync total) SOLO si viene en propuesta.
 * - Crea/actualiza porcentaje por docente_id
 * - Elimina los que ya no están
 *
 * Espera comunidad como:
 * [{ docente_id: number, porcentaje: number, unidad_academica?: string|null, nombre?: string }, ...]
 */
async function syncProgramaDocenteFromComunidad(manager, programaCursoId, comunidadRaw) {
    const repo = manager.getRepository(ProgramaDocente_1.ProgramaDocente);
    const incoming = Array.isArray(comunidadRaw) ? comunidadRaw : [];
    // normalizar + deduplicar por docente_id
    const normalized = [];
    const seen = new Set();
    for (const r of incoming) {
        const docenteId = Number(r?.docente_id ?? 0);
        if (!Number.isInteger(docenteId) || docenteId <= 0)
            continue;
        if (seen.has(docenteId))
            continue;
        seen.add(docenteId);
        const pct = Number(r?.porcentaje ?? 0);
        normalized.push({
            docente_id: docenteId,
            porcentaje: Number.isFinite(pct) ? pct : 0,
        });
    }
    // existentes del programa
    const existing = await repo.find({
        where: { programaCurso: { id: programaCursoId } },
        relations: { docente: true },
    });
    const byDocId = new Map();
    for (const row of existing) {
        const did = row?.docente?.id ?? row?.docenteId ?? row?.docente_id;
        if (did)
            byDocId.set(Number(did), row);
    }
    const incomingIds = new Set(normalized.map((x) => x.docente_id));
    // upsert create/update
    for (const inc of normalized) {
        const row = byDocId.get(inc.docente_id);
        if (!row) {
            // CREATE
            await repo.save(repo.create({
                programaCurso: { id: programaCursoId },
                docente: { id: inc.docente_id },
                porcentaje: inc.porcentaje,
            }));
        }
        else {
            // UPDATE solo si cambia
            const currentPct = Number(row?.porcentaje ?? 0);
            if (currentPct !== inc.porcentaje) {
                await repo.update({ id: row.id }, { porcentaje: inc.porcentaje });
            }
        }
    }
    // delete los que ya no están
    for (const row of existing) {
        const did = row?.docente?.id ?? row?.docenteId ?? row?.docente_id;
        if (did && !incomingIds.has(Number(did))) {
            await repo.delete({ id: row.id });
        }
    }
}
//# sourceMappingURL=SolicitudesCambioService.js.map