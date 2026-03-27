import { Request, Response } from "express";
import { EstadoServidorService } from "../services/estadoServidorService";

const service = new EstadoServidorService();

export class EstadoServidorController {
    // CRUD
    async list(req: Request, res: Response) {
        const data = await service.list();
        return res.json(data);
    }

    async getActive(req: Request, res: Response) {
        const active = await service.getActiveRow();
        return res.json(active); // puede ser null
    }

    async getById(req: Request, res: Response) {
        const raw = req.params.id;
        const id = Number(raw);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Parámetro id inválido", id: raw });
        }

        const entity = await service.getById(id);
        if (!entity) return res.status(404).json({ message: "No encontrado" });
        return res.json(entity);
    }

    async create(req: Request, res: Response) {
        try {
            const created = await service.create(req.body);
            return res.status(201).json(created);
        } catch (e: any) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error creando estado" });
        }
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        try {
            const updated = await service.update(id, req.body);
            if (!updated) return res.status(404).json({ message: "No encontrado" });
            return res.json(updated);
        } catch (e: any) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error actualizando estado" });
        }
    }

    async remove(req: Request, res: Response) {
        const id = Number(req.params.id);
        const ok = await service.remove(id);
        if (!ok) return res.status(404).json({ message: "No encontrado" });
        return res.status(204).send();
    }

    // Motor por tiempo
    async recalc(req: Request, res: Response) {
        try {
            const updated = await service.recalcActiveByNow();
            return res.json(updated);
        } catch (e: any) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error recalculando estado" });
        }
    }

    // Flujos
    async activateFlow1(req: Request, res: Response) {
        try {
            const result = await service.activateFlow1(req.body as any);
            return res.json(result);
        } catch (e: any) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error activando flujo 1" });
        }
    }

    async activateCronogramasOnly(req: Request, res: Response) {
        try {
            const result = await service.activateCronogramasOnly(req.body as any);
            return res.json(result);
        } catch (e: any) {
            return res.status(400).json({
                message: e?.message ?? "Error activando cronogramas-only",
            });
        }
    }

    async effective(req: Request, res: Response) {
        try {
            const row = await service.getEffectiveRowNow();
            return res.json(row); // puede ser null si faltara seed (no debería)
        } catch (e: any) {
            return res.status(400).json({ message: e?.message ?? "Error obteniendo estado efectivo" });
        }
    }
}