import { AppDataSource } from "../config/data-source";

import {
    SolicitudCambio,
    PropuestaAvanzadoPayload,
} from "../entities/SolicitudCambio";
import { Usuario } from "../entities/Usuario";
import { ProgramaCurso } from "../entities/ProgramaCurso";
import { PlanEstudioCurso } from "../entities/PlanDeEstudioCurso";
import { UsuarioCurso } from "../entities/UsuarioCurso";
import { Curso } from "../entities/Curso";

import { ProgramaMetodologia } from "../entities/ProgramaMetodologia";
import { ProgramaMetodologiaEstrategia } from "../entities/ProgramaMetodologiaEstrategia";
import { ProgramaEvaluacion } from "../entities/ProgramaEvaluacion";
import { ProgramaBibliografia } from "../entities/ProgramaBibliografia";
import { ProgramaDocente } from "../entities/ProgramaDocente";
import { ProgramaCursoService } from "./programaCursoService";

const ROLES_COORD = new Set<Usuario["rol"]>([
    "coordinador de programa",
    "coordinador de curso",
]);

const ROLES_ADMIN = new Set<Usuario["rol"]>(["superadmin", "admin"]);

type CrearSolicitudBody = {
    programaCursoId: number;
    motivo?: string | null;
    propuesta: PropuestaAvanzadoPayload;
};

type ResolverBody = {
    comentario?: string | null;
};

export class SolicitudesCambioService {
    private repo = AppDataSource.getRepository(SolicitudCambio);

    // ============== LISTADOS ==============

    async listPendientes() {
        return this.repo.find({
            where: { estado: "pendiente" as any },
            relations: { curso: true, programaCurso: true, solicitante: true } as any,
            order: { id: "DESC" },
        });
    }

    async listMias(solicitanteId: number) {
        return this.repo.find({
            where: { solicitante: { id: solicitanteId } as any },
            relations: {
                curso: true,
                programaCurso: true,
                solicitante: true,
                resueltoPor: true,
            } as any,
            order: { id: "DESC" },
        });
    }

    async getById(id: number) {
        return this.repo.findOne({
            where: { id },
            relations: {
                curso: true,
                programaCurso: true,
                solicitante: true,
                resueltoPor: true,
            } as any,
        });
    }

    async getByIdForUser(userId: number, rol: Usuario["rol"], id: number) {
        // Admin/Superadmin puede ver cualquiera
        if (rol === "admin" || rol === "superadmin") {
            return this.getById(id);
        }

        // Coordinador solo puede ver las suyas
        if (rol === "coordinador de curso" || rol === "coordinador de programa") {
            return this.repo.findOne({
                where: { id, solicitante: { id: userId } as any },
                relations: {
                    curso: true,
                    programaCurso: true,
                    solicitante: true,
                    resueltoPor: true,
                } as any,
            });
        }

        return null;
    }

    // ============== CREAR (coordinador) ==============

    async crear(solicitanteId: number, body: CrearSolicitudBody) {
        const programaCursoId = Number(body?.programaCursoId);
        if (!Number.isInteger(programaCursoId) || programaCursoId <= 0) {
            throw new Error("programaCursoId inválido");
        }

        const propuesta = body?.propuesta;
        if (
            !propuesta ||
            typeof propuesta !== "object" ||
            Array.isArray(propuesta)
        ) {
            throw new Error("propuesta es obligatoria y debe ser un objeto JSON");
        }

        return AppDataSource.transaction(async (manager) => {
            const userR = manager.getRepository(Usuario);
            const scR = manager.getRepository(SolicitudCambio);
            const pcR = manager.getRepository(ProgramaCurso);
            const pecR = manager.getRepository(PlanEstudioCurso);
            const ucR = manager.getRepository(UsuarioCurso);
            const cursoR = manager.getRepository(Curso);

            // 1) validar solicitante y rol
            const solicitante = await userR.findOne({ where: { id: solicitanteId } });
            if (!solicitante) throw new Error("Usuario solicitante no existe.");
            if (!ROLES_COORD.has(solicitante.rol)) {
                throw new Error("Solo coordinadores pueden crear solicitudes de cambio.");
            }

            // 2) programa curso y curso asociado (via plan_estudio_cursos)
            const programaCurso = await pcR.findOne({
                where: { id: programaCursoId },
                relations: { planCurso: true } as any,
            });
            if (!programaCurso) throw new Error("ProgramaCurso no encontrado.");

            const pecId = (programaCurso.planCurso as any)?.id;
            if (!pecId) throw new Error("ProgramaCurso sin planCurso asociado.");

            const pec = await pecR.findOne({
                where: { id: pecId },
                relations: { curso: true } as any,
            });
            if (!pec?.curso) {
                throw new Error("No se pudo resolver el curso del ProgramaCurso.");
            }

            const curso = await cursoR.findOne({ where: { id: pec.curso.id } });
            if (!curso) throw new Error("Curso no encontrado.");

            // 3) validar que el coordinador esté asignado al curso
            const vinculo = await ucR.findOne({
                where: {
                    usuario: { id: solicitanteId } as any,
                    curso: { id: curso.id } as any,
                },
            });
            if (!vinculo) {
                throw new Error("El coordinador no está asignado a este curso.");
            }

            // 4) evitar duplicado pendiente por programa_curso
            const yaPendiente = await scR.findOne({
                where: {
                    programaCurso: { id: programaCursoId } as any,
                    estado: "pendiente" as any,
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

    async aprobar(adminId: number, solicitudId: number, body: ResolverBody) {
        return AppDataSource.transaction(async (manager) => {
            const userR = manager.getRepository(Usuario);
            const scR = manager.getRepository(SolicitudCambio);

            const admin = await userR.findOne({ where: { id: adminId } });
            if (!admin) throw new Error("Admin no existe.");
            if (!ROLES_ADMIN.has(admin.rol)) throw new Error("Forbidden");

            const sc = await scR.findOne({
                where: { id: solicitudId },
                relations: { programaCurso: true } as any,
            });
            if (!sc) throw new Error("Solicitud no encontrada.");
            if (sc.estado !== "pendiente") throw new Error("La solicitud ya fue resuelta.");

            // ✅ PARCHE: Construir un payload COMPLETO para upsertAvanzado
            // para que NO meta "Por definir." en campos no enviados.
            const payloadFinal = mergeSnapshotWithPropuesta(
                (sc.snapshot || {}) as any,
                (sc.propuesta || {}) as any
            );

            // ✅ importante: usar repos del manager (misma transacción)
            const pcSvcTx = new ProgramaCursoService(
                manager.getRepository(ProgramaCurso),
                manager.getRepository(ProgramaMetodologia),
                manager.getRepository(ProgramaEvaluacion),
                manager.getRepository(ProgramaMetodologiaEstrategia),
                manager.getRepository(ProgramaBibliografia)
            );

            await pcSvcTx.upsertAvanzado(sc.programaCurso.id, payloadFinal as any);

            if ((sc.propuesta as any)?.comunidad !== undefined) {
                await syncProgramaDocenteFromComunidad(
                    manager,
                    sc.programaCurso.id,
                    (sc.propuesta as any).comunidad
                );
            }

            sc.estado = "aprobada";
            sc.comentario_admin = body?.comentario ?? null;
            sc.resueltoPor = admin as any;
            sc.resuelto_en = new Date();
            sc.actualizado_en = new Date();

            await scR.save(sc);

            return { ok: true, solicitud: sc };
        });
    }

    async rechazar(adminId: number, solicitudId: number, body: ResolverBody) {
        return AppDataSource.transaction(async (manager) => {
            const userR = manager.getRepository(Usuario);
            const scR = manager.getRepository(SolicitudCambio);

            const admin = await userR.findOne({ where: { id: adminId } });
            if (!admin) throw new Error("Admin no existe.");
            if (!ROLES_ADMIN.has(admin.rol)) throw new Error("Forbidden");

            const sc = await scR.findOne({ where: { id: solicitudId } });
            if (!sc) throw new Error("Solicitud no encontrada.");
            if (sc.estado !== "pendiente") throw new Error("La solicitud ya fue resuelta.");

            sc.estado = "rechazada";
            sc.comentario_admin = body?.comentario ?? null;
            sc.resueltoPor = admin as any;
            sc.resuelto_en = new Date();
            sc.actualizado_en = new Date();

            await scR.save(sc);

            return { ok: true, solicitud: sc };
        });
    }

    // ============== helpers ==============
    private async buildSnapshotAvanzado(
        manager: any,
        programaCursoId: number
    ): Promise<PropuestaAvanzadoPayload> {
        const pcR = manager.getRepository(ProgramaCurso);

        const pcFull = await pcR.findOne({ where: { id: programaCursoId } });
        if (!pcFull) throw new Error("ProgramaCurso no encontrado.");

        const metodologiaRepo = manager.getRepository(ProgramaMetodologia);
        const estrategiasRepo = manager.getRepository(ProgramaMetodologiaEstrategia);
        const evalRepo = manager.getRepository(ProgramaEvaluacion);
        const biblioRepo = manager.getRepository(ProgramaBibliografia);
        const progDocRepo = manager.getRepository(ProgramaDocente);
        const metodologia = await metodologiaRepo.findOne({
            where: { programaCurso: { id: programaCursoId } as any },
            order: { id: "DESC" } as any,
        });

        // ⚠️ Ajusta "estrategia" si el nombre real difiere
        const estrategiasRows = await estrategiasRepo.find({
            where: { programaCurso: { id: programaCursoId } as any },
            relations: { estrategia: true } as any,
        });

        const estrategiaIds = (estrategiasRows || [])
            .map((r: any) => r?.estrategia?.id)
            .filter((x: any) => Number.isInteger(Number(x)))
            .map((x: any) => Number(x));

        const evalRows = await evalRepo.find({
            where: { programaCurso: { id: programaCursoId } as any },
            order: { id: "ASC" } as any,
        });

        const biblioRows = await biblioRepo.find({
            where: { programaCurso: { id: programaCursoId } as any },
            order: { id: "ASC" } as any,
        });

        // ✅ Comunidad actual: ProgramaDocente + Docente
        // Ajusta relations si tu relación se llama distinto
        const comunidadRows = await progDocRepo.find({
            where: { programaCurso: { id: programaCursoId } as any },
            relations: { docente: true } as any,
            order: { id: "ASC" } as any,
        });

        const comunidad = (comunidadRows || [])
            .map((pd: any) => {
                const d = pd?.docente;
                const docenteId =
                    d?.id ?? pd?.docenteId ?? pd?.docente_id ?? pd?.id_docente ?? null;

                if (!docenteId) return null;

                const nombre = [d?.nombres, d?.apellidos].filter(Boolean).join(" ").trim();

                const unidad =
                    d?.unidad_academica ??
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
            estrategias_internacionalizacion:
                metodologia?.estrategiasInternacionalizacion ?? null,
            estrategias_enfoque: metodologia?.estrategiasEnfoque ?? null,

            estrategias: Array.from(new Set(estrategiaIds)),

            evaluacion: (evalRows || []).map((r: ProgramaEvaluacion) => ({
                momentos_evaluacion: r.momentosEvaluacion,
                porcentaje: Number(r.porcentaje),
            })),

            bibliografia: (biblioRows || []).map((b: ProgramaBibliografia) => ({
                cultura: b.cultura ?? null,
                referencia: b.referencia,
                palabras_clave: b.palabrasClave ?? null,
            })),

            // ✅ NUEVO: comunidad en snapshot
            comunidad,
        } as any;
    }
}

/**
 * Construye un payload COMPLETO para ProgramaCursoService.upsertAvanzado:
 * - Si un campo NO viene en propuesta, usa el snapshot.
 * - Así evitamos que upsertAvanzado meta placeholders “Por definir.” por undefined
 * - y evitamos borrar evaluacion/bibliografia por ausencia.
 */
function mergeSnapshotWithPropuesta(
    snapshot: PropuestaAvanzadoPayload,
    propuesta: PropuestaAvanzadoPayload
): PropuestaAvanzadoPayload {
    const out: any = {};

    const pick = (k: keyof PropuestaAvanzadoPayload) => {
        if (propuesta && (propuesta as any)[k] !== undefined) return (propuesta as any)[k];
        return (snapshot as any)[k];
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
    if ((propuesta as any).comunidad !== undefined) out.comunidad = (propuesta as any).comunidad;
    else if ((snapshot as any).comunidad !== undefined) out.comunidad = (snapshot as any).comunidad;

    return out as PropuestaAvanzadoPayload;
}

/**
 * Aplica comunidad académica en ProgramaDocente (sync total) SOLO si viene en propuesta.
 * - Crea/actualiza porcentaje por docente_id
 * - Elimina los que ya no están
 *
 * Espera comunidad como:
 * [{ docente_id: number, porcentaje: number, unidad_academica?: string|null, nombre?: string }, ...]
 */
async function syncProgramaDocenteFromComunidad(
    manager: any,
    programaCursoId: number,
    comunidadRaw: any
): Promise<void> {
    const repo = manager.getRepository(ProgramaDocente);

    const incoming = Array.isArray(comunidadRaw) ? comunidadRaw : [];

    // normalizar + deduplicar por docente_id
    const normalized: Array<{ docente_id: number; porcentaje: number }> = [];
    const seen = new Set<number>();

    for (const r of incoming) {
        const docenteId = Number(r?.docente_id ?? 0);
        if (!Number.isInteger(docenteId) || docenteId <= 0) continue;
        if (seen.has(docenteId)) continue;
        seen.add(docenteId);

        const pct = Number(r?.porcentaje ?? 0);
        normalized.push({
            docente_id: docenteId,
            porcentaje: Number.isFinite(pct) ? pct : 0,
        });
    }

    // existentes del programa
    const existing = await repo.find({
        where: { programaCurso: { id: programaCursoId } as any },
        relations: { docente: true } as any,
    });

    const byDocId = new Map<number, any>();
    for (const row of existing) {
        const did = row?.docente?.id ?? row?.docenteId ?? row?.docente_id;
        if (did) byDocId.set(Number(did), row);
    }

    const incomingIds = new Set(normalized.map((x) => x.docente_id));

    // upsert create/update
    for (const inc of normalized) {
        const row = byDocId.get(inc.docente_id);

        if (!row) {
            // CREATE
            await repo.save(
                repo.create({
                    programaCurso: { id: programaCursoId } as any,
                    docente: { id: inc.docente_id } as any,
                    porcentaje: inc.porcentaje as any,
                } as any)
            );
        } else {
            // UPDATE solo si cambia
            const currentPct = Number(row?.porcentaje ?? 0);
            if (currentPct !== inc.porcentaje) {
                await repo.update(
                    { id: row.id } as any,
                    { porcentaje: inc.porcentaje as any } as any
                );
            }
        }
    }

    // delete los que ya no están
    for (const row of existing) {
        const did = row?.docente?.id ?? row?.docenteId ?? row?.docente_id;
        if (did && !incomingIds.has(Number(did))) {
            await repo.delete({ id: row.id } as any);
        }
    }
}