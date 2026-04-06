"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoServidorService = void 0;
const data_source_1 = require("../config/data-source");
const EstadoServidor_1 = require("../entities/EstadoServidor");
const ESTADOS = {
    IDLE: "idle (lectura)",
    SOLICITUDES: "solicitudes de cambio",
    REVISIONES: "revisiones",
    CRONOGRAMAS: "cronogramas",
};
function parseISO(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        throw new Error(`Fecha inválida: ${iso}`);
    return d;
}
function assertWindow(w, label) {
    const desde = parseISO(w.desde);
    const hasta = parseISO(w.hasta);
    if (hasta.getTime() <= desde.getTime()) {
        throw new Error(`Ventana inválida en ${label}: 'hasta' debe ser > 'desde'`);
    }
    return { desde, hasta };
}
function assertContiguous(aEnd, bStart, label) {
    // Requisito: fin estado A == inicio estado B
    if (aEnd.getTime() !== bStart.getTime()) {
        throw new Error(`Las franjas no son concurrentes (${label}): fin != inicio`);
    }
}
class EstadoServidorService {
    constructor() {
        this.repo = data_source_1.AppDataSource.getRepository(EstadoServidor_1.EstadoServidor);
    }
    // ===================== CRUD =====================
    async list() {
        return this.repo.find({ order: { id: "ASC" } });
    }
    async getById(id) {
        return this.repo.findOne({ where: { id } });
    }
    async getByEstado(estado) {
        return this.repo.findOne({ where: { estado } });
    }
    async getActiveRow() {
        return this.repo.findOne({ where: { activo: true } });
    }
    async create(payload) {
        const e = this.repo.create(payload);
        return this.repo.save(e);
    }
    async update(id, payload) {
        const e = await this.getById(id);
        if (!e)
            return null;
        Object.assign(e, payload);
        return this.repo.save(e);
    }
    async remove(id) {
        const r = await this.repo.delete({ id });
        return !!r.affected;
    }
    // ===================== Helpers de flujo =====================
    /**
     * Estado "efectivo" según NOW() y ventanas.
     * - Si NOW() cae dentro de una ventana de (solicitudes/revisiones/cronogramas), ese es el estado efectivo.
     * - Si no cae en ninguna, es IDLE.
     */
    async computeEffectiveEstado(now, managerRepo = this.repo) {
        const rows = await managerRepo.find({
            where: [
                { estado: ESTADOS.SOLICITUDES },
                { estado: ESTADOS.REVISIONES },
                { estado: ESTADOS.CRONOGRAMAS },
            ],
        });
        const t = now.getTime();
        for (const r of rows) {
            if (!r.activo_desde || !r.activo_hasta)
                continue;
            if (t >= r.activo_desde.getTime() && t < r.activo_hasta.getTime()) {
                return r.estado;
            }
        }
        return ESTADOS.IDLE;
    }
    // ✅ Devuelve SOLO el nombre del estado efectivo (según NOW())
    async getEffectiveEstadoNow() {
        return this.computeEffectiveEstado(new Date(), this.repo);
    }
    // ✅ Devuelve la FILA completa del estado efectivo (más útil para el front)
    async getEffectiveRowNow() {
        const estado = await this.computeEffectiveEstado(new Date(), this.repo);
        return this.repo.findOne({ where: { estado } });
    }
    /**
     * Aplica "solo uno activo" dejando activo=true al estado efectivo.
     */
    async recalcActiveByNow() {
        return data_source_1.AppDataSource.transaction(async (manager) => {
            const r = manager.getRepository(EstadoServidor_1.EstadoServidor);
            const now = new Date();
            const targetEstado = await this.computeEffectiveEstado(now, r);
            await r.createQueryBuilder()
                .update(EstadoServidor_1.EstadoServidor)
                .set({ activo: false })
                .where("activo = true")
                .execute();
            const target = await r.findOne({ where: { estado: targetEstado } });
            if (!target)
                return null;
            target.activo = true;
            return r.save(target);
        });
    }
    async setWindow(estado, desde, hasta, repo) {
        const row = await repo.findOne({ where: { estado } });
        if (!row)
            throw new Error(`No existe el estado: ${estado}`);
        row.activo_desde = desde;
        row.activo_hasta = hasta;
        await repo.save(row);
    }
    // ===================== Flujo 1 =====================
    async activateFlow1(payload) {
        const s = assertWindow(payload.solicitudes, ESTADOS.SOLICITUDES);
        const r = assertWindow(payload.revisiones, ESTADOS.REVISIONES);
        const c = assertWindow(payload.cronogramas, ESTADOS.CRONOGRAMAS);
        // Contigüidad estricta
        assertContiguous(s.hasta, r.desde, `${ESTADOS.SOLICITUDES} -> ${ESTADOS.REVISIONES}`);
        assertContiguous(r.hasta, c.desde, `${ESTADOS.REVISIONES} -> ${ESTADOS.CRONOGRAMAS}`);
        return data_source_1.AppDataSource.transaction(async (manager) => {
            const repo = manager.getRepository(EstadoServidor_1.EstadoServidor);
            await this.setWindow(ESTADOS.SOLICITUDES, s.desde, s.hasta, repo);
            await this.setWindow(ESTADOS.REVISIONES, r.desde, r.hasta, repo);
            await this.setWindow(ESTADOS.CRONOGRAMAS, c.desde, c.hasta, repo);
            const now = new Date();
            const targetEstado = await this.computeEffectiveEstado(now, repo);
            await repo.createQueryBuilder()
                .update(EstadoServidor_1.EstadoServidor)
                .set({ activo: false })
                .where("activo = true")
                .execute();
            const target = await repo.findOne({ where: { estado: targetEstado } });
            if (!target)
                throw new Error(`No existe estado target: ${targetEstado}`);
            target.activo = true;
            return repo.save(target);
        });
    }
    // ===================== Flujo 2 =====================
    async activateCronogramasOnly(payload) {
        const c = assertWindow(payload.cronogramas, ESTADOS.CRONOGRAMAS);
        return data_source_1.AppDataSource.transaction(async (manager) => {
            const repo = manager.getRepository(EstadoServidor_1.EstadoServidor);
            const solicitudes = await repo.findOne({ where: { estado: ESTADOS.SOLICITUDES } });
            if (!solicitudes || !solicitudes.activo_desde || !solicitudes.activo_hasta) {
                throw new Error("No se puede abrir solo cronogramas: el flujo completo (solicitudes→revisiones→cronogramas) debe haber ocurrido al menos una vez.");
            }
            const now = new Date();
            const effective = await this.computeEffectiveEstado(now, repo);
            if (effective !== ESTADOS.IDLE) {
                throw new Error(`No se puede abrir solo cronogramas: el estado efectivo actual no es '${ESTADOS.IDLE}' (es '${effective}').`);
            }
            await this.setWindow(ESTADOS.CRONOGRAMAS, c.desde, c.hasta, repo);
            const targetEstado = await this.computeEffectiveEstado(now, repo);
            await repo.createQueryBuilder()
                .update(EstadoServidor_1.EstadoServidor)
                .set({ activo: false })
                .where("activo = true")
                .execute();
            const target = await repo.findOne({ where: { estado: targetEstado } });
            if (!target)
                throw new Error(`No existe estado target: ${targetEstado}`);
            target.activo = true;
            return repo.save(target);
        });
    }
}
exports.EstadoServidorService = EstadoServidorService;
//# sourceMappingURL=estadoServidorService.js.map