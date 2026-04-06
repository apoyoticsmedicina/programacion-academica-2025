"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstadoServidorController = void 0;
const estadoServidorService_1 = require("../services/estadoServidorService");
const service = new estadoServidorService_1.EstadoServidorService();
class EstadoServidorController {
    // CRUD
    async list(req, res) {
        const data = await service.list();
        return res.json(data);
    }
    async getActive(req, res) {
        const active = await service.getActiveRow();
        return res.json(active); // puede ser null
    }
    async getById(req, res) {
        const raw = req.params.id;
        const id = Number(raw);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Parámetro id inválido", id: raw });
        }
        const entity = await service.getById(id);
        if (!entity)
            return res.status(404).json({ message: "No encontrado" });
        return res.json(entity);
    }
    async create(req, res) {
        try {
            const created = await service.create(req.body);
            return res.status(201).json(created);
        }
        catch (e) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error creando estado" });
        }
    }
    async update(req, res) {
        const id = Number(req.params.id);
        try {
            const updated = await service.update(id, req.body);
            if (!updated)
                return res.status(404).json({ message: "No encontrado" });
            return res.json(updated);
        }
        catch (e) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error actualizando estado" });
        }
    }
    async remove(req, res) {
        const id = Number(req.params.id);
        const ok = await service.remove(id);
        if (!ok)
            return res.status(404).json({ message: "No encontrado" });
        return res.status(204).send();
    }
    // Motor por tiempo
    async recalc(req, res) {
        try {
            const updated = await service.recalcActiveByNow();
            return res.json(updated);
        }
        catch (e) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error recalculando estado" });
        }
    }
    // Flujos
    async activateFlow1(req, res) {
        try {
            const result = await service.activateFlow1(req.body);
            return res.json(result);
        }
        catch (e) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error activando flujo 1" });
        }
    }
    async activateCronogramasOnly(req, res) {
        try {
            const result = await service.activateCronogramasOnly(req.body);
            return res.json(result);
        }
        catch (e) {
            return res.status(400).json({
                message: e?.message ?? "Error activando cronogramas-only",
            });
        }
    }
    async effective(req, res) {
        try {
            const row = await service.getEffectiveRowNow();
            return res.json(row); // puede ser null si faltara seed (no debería)
        }
        catch (e) {
            return res.status(400).json({ message: e?.message ?? "Error obteniendo estado efectivo" });
        }
    }
}
exports.EstadoServidorController = EstadoServidorController;
//# sourceMappingURL=estadoServidorController.js.map