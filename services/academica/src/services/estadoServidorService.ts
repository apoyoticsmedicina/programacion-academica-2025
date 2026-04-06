import { AppDataSource } from "../config/data-source";
import { EstadoServidor } from "../entities/EstadoServidor";

const ESTADOS = {
    IDLE: "idle (lectura)",
    SOLICITUDES: "solicitudes de cambio",
    APROBACION: "aprobación",
    REVISIONES: "revisiones",
    CRONOGRAMAS: "cronogramas",
} as const;

/** Tipos embebidos (sin DTO folder) */
type TimeWindow = {
    desde: string; // ISO: '2026-03-02T10:00:00-05:00'
    hasta: string; // ISO
};

type ActivateFlow1Payload = {
    solicitudes: TimeWindow;
    aprobacion: TimeWindow;
    revisiones: TimeWindow;
    cronogramas: TimeWindow;
};

type ActivateCronogramasOnlyPayload = {
    cronogramas: TimeWindow;
};

function parseISO(iso: string): Date {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) throw new Error(`Fecha inválida: ${iso}`);
    return d;
}

function assertWindow(w: TimeWindow, label: string) {
    const desde = parseISO(w.desde);
    const hasta = parseISO(w.hasta);
    if (hasta.getTime() <= desde.getTime()) {
        throw new Error(`Ventana inválida en ${label}: 'hasta' debe ser > 'desde'`);
    }
    return { desde, hasta };
}

function assertOrderedWindowsWithoutOverlap(
    windows: Array<{ estado: string; desde: Date; hasta: Date }>
) {
    const ordered = [...windows].sort((a, b) => a.desde.getTime() - b.desde.getTime());

    for (let i = 1; i < ordered.length; i++) {
        const prev = ordered[i - 1];
        const next = ordered[i];

        if (next.desde.getTime() < prev.hasta.getTime()) {
            throw new Error(
                `Las franjas se solapan (${prev.estado} -> ${next.estado}): ` +
                `el inicio de '${next.estado}' debe ser mayor o igual al fin de '${prev.estado}'.`
            );
        }
    }

    return ordered;
}

export class EstadoServidorService {
    private repo = AppDataSource.getRepository(EstadoServidor);

    // ===================== CRUD =====================
    async list() {
        return this.repo.find({ order: { id: "ASC" } });
    }

    async getById(id: number) {
        return this.repo.findOne({ where: { id } });
    }

    async getByEstado(estado: string) {
        return this.repo.findOne({ where: { estado } });
    }

    async getActiveRow() {
        return this.repo.findOne({ where: { activo: true } });
    }

    async create(payload: Partial<EstadoServidor>) {
        const e = this.repo.create(payload);
        return this.repo.save(e);
    }

    async update(id: number, payload: Partial<EstadoServidor>) {
        const e = await this.getById(id);
        if (!e) return null;
        Object.assign(e, payload);
        return this.repo.save(e);
    }

    async remove(id: number) {
        const r = await this.repo.delete({ id });
        return !!r.affected;
    }

    // ===================== Helpers de flujo =====================

    /**
     * Estado "efectivo" según NOW() y ventanas.
     * - Si NOW() cae dentro de una ventana de
     *   (solicitudes/aprobación/revisiones/cronogramas), ese es el estado efectivo.
     * - Si no cae en ninguna, es IDLE.
     */
    private async computeEffectiveEstado(now: Date, managerRepo = this.repo): Promise<string> {
        const rows = await managerRepo.find({
            where: [
                { estado: ESTADOS.SOLICITUDES },
                { estado: ESTADOS.APROBACION },
                { estado: ESTADOS.REVISIONES },
                { estado: ESTADOS.CRONOGRAMAS },
            ] as any,
        });

        const t = now.getTime();
        for (const r of rows) {
            if (!r.activo_desde || !r.activo_hasta) continue;
            if (t >= r.activo_desde.getTime() && t < r.activo_hasta.getTime()) {
                return r.estado;
            }
        }
        return ESTADOS.IDLE;
    }

    private async hasFlow1ConfiguredFromNow(
        repo: any,
        now: Date
    ): Promise<boolean> {
        const rows = await repo.find({
            where: [
                { estado: ESTADOS.SOLICITUDES },
                { estado: ESTADOS.REVISIONES },
                { estado: ESTADOS.APROBACION },
                { estado: ESTADOS.CRONOGRAMAS },
            ] as any,
        });

        const t = now.getTime();

        return rows.some((r: EstadoServidor) => {
            if (!r.activo_desde || !r.activo_hasta) return false;
            return r.activo_hasta.getTime() > t;
        });
    }

    async getEffectiveEstadoNow(): Promise<string> {
        return this.computeEffectiveEstado(new Date(), this.repo);
    }

    async getEffectiveRowNow(): Promise<EstadoServidor | null> {
        const estado = await this.computeEffectiveEstado(new Date(), this.repo);
        return this.repo.findOne({ where: { estado } });
    }

    /**
     * Aplica "solo uno activo" dejando activo=true al estado efectivo.
     */
    async recalcActiveByNow(): Promise<EstadoServidor | null> {
        return AppDataSource.transaction(async (manager) => {
            const r = manager.getRepository(EstadoServidor);

            const now = new Date();
            const targetEstado = await this.computeEffectiveEstado(now, r);

            await r.createQueryBuilder()
                .update(EstadoServidor)
                .set({ activo: false })
                .where("activo = true")
                .execute();

            const target = await r.findOne({ where: { estado: targetEstado } });
            if (!target) return null;

            target.activo = true;
            return r.save(target);
        });
    }

    private async setWindow(estado: string, desde: Date, hasta: Date, repo: any) {
        const row = await repo.findOne({ where: { estado } });
        if (!row) throw new Error(`No existe el estado: ${estado}`);
        row.activo_desde = desde;
        row.activo_hasta = hasta;
        await repo.save(row);
    }

    // ===================== Flujo 1 =====================

    async activateFlow1(payload: ActivateFlow1Payload) {
        const s = assertWindow(payload.solicitudes, ESTADOS.SOLICITUDES);
        const r = assertWindow(payload.revisiones, ESTADOS.REVISIONES);
        const a = assertWindow(payload.aprobacion, ESTADOS.APROBACION);
        const c = assertWindow(payload.cronogramas, ESTADOS.CRONOGRAMAS);

        assertOrderedWindowsWithoutOverlap([
            { estado: ESTADOS.SOLICITUDES, desde: s.desde, hasta: s.hasta },
            { estado: ESTADOS.REVISIONES, desde: r.desde, hasta: r.hasta },
            { estado: ESTADOS.APROBACION, desde: a.desde, hasta: a.hasta },
            { estado: ESTADOS.CRONOGRAMAS, desde: c.desde, hasta: c.hasta },
        ]);

        return AppDataSource.transaction(async (manager) => {
            const repo = manager.getRepository(EstadoServidor);

            const now = new Date();
            const hasConfigured = await this.hasFlow1ConfiguredFromNow(repo, now);

            if (hasConfigured) {
                throw new Error(
                    'No se puede reescribir el flujo 1 porque ya existe una programación activa o futura.'
                );
            }

            await this.setWindow(ESTADOS.SOLICITUDES, s.desde, s.hasta, repo);
            await this.setWindow(ESTADOS.REVISIONES, r.desde, r.hasta, repo);
            await this.setWindow(ESTADOS.APROBACION, a.desde, a.hasta, repo);
            await this.setWindow(ESTADOS.CRONOGRAMAS, c.desde, c.hasta, repo);

            const targetEstado = await this.computeEffectiveEstado(now, repo);

            await repo.createQueryBuilder()
                .update(EstadoServidor)
                .set({ activo: false })
                .where('activo = true')
                .execute();

            const target = await repo.findOne({ where: { estado: targetEstado } });
            if (!target) throw new Error(`No existe estado target: ${targetEstado}`);

            target.activo = true;
            return repo.save(target);
        });
    }

    // ===================== Flujo 2 =====================

    async activateCronogramasOnly(payload: ActivateCronogramasOnlyPayload) {
        const c = assertWindow(payload.cronogramas, ESTADOS.CRONOGRAMAS);

        return AppDataSource.transaction(async (manager) => {
            const repo = manager.getRepository(EstadoServidor);

            const solicitudes = await repo.findOne({ where: { estado: ESTADOS.SOLICITUDES } });
            if (!solicitudes || !solicitudes.activo_desde || !solicitudes.activo_hasta) {
                throw new Error(
                    "No se puede abrir solo cronogramas: el flujo completo (solicitudes→revisiones→aprobación→cronogramas) debe haber ocurrido al menos una vez."
                );
            }

            const now = new Date();
            const effective = await this.computeEffectiveEstado(now, repo);
            if (effective !== ESTADOS.IDLE) {
                throw new Error(
                    `No se puede abrir solo cronogramas: el estado efectivo actual no es '${ESTADOS.IDLE}' (es '${effective}').`
                );
            }

            await this.setWindow(ESTADOS.CRONOGRAMAS, c.desde, c.hasta, repo);

            const targetEstado = await this.computeEffectiveEstado(now, repo);

            await repo.createQueryBuilder()
                .update(EstadoServidor)
                .set({ activo: false })
                .where("activo = true")
                .execute();

            const target = await repo.findOne({ where: { estado: targetEstado } });
            if (!target) throw new Error(`No existe estado target: ${targetEstado}`);

            target.activo = true;
            return repo.save(target);
        });
    }
}