"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudesCambioController = void 0;
const SolicitudesCambioService_1 = require("../services/SolicitudesCambioService");
const service = new SolicitudesCambioService_1.SolicitudesCambioService();
class SolicitudesCambioController {
    constructor() {
        this.pendientes = async (_req, res) => {
            const data = await service.listPendientes();
            return res.json(data);
        };
        this.mias = async (req, res) => {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ message: "Unauthorized" });
            const data = await service.listMias(userId);
            return res.json(data);
        };
        this.getById = async (req, res) => {
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({ message: "id inválido" });
            }
            const userId = req.user?.id;
            const rol = req.user?.rol;
            if (!userId || !rol)
                return res.status(401).json({ message: "Unauthorized" });
            const row = await service.getByIdForUser(userId, rol, id);
            if (!row)
                return res.status(404).json({ message: "No encontrado" });
            return res.json(row);
        };
        this.crear = async (req, res) => {
            try {
                const userId = req.user?.id;
                if (!userId)
                    return res.status(401).json({ message: "Unauthorized" });
                const created = await service.crear(userId, req.body);
                return res.status(201).json(created);
            }
            catch (e) {
                return res
                    .status(400)
                    .json({ message: e?.message ?? "Error creando solicitud" });
            }
        };
        this.aprobar = async (req, res) => {
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({ message: "id inválido" });
            }
            try {
                const adminId = req.user?.id;
                if (!adminId)
                    return res.status(401).json({ message: "Unauthorized" });
                const result = await service.aprobar(adminId, id, req.body);
                return res.json(result);
            }
            catch (e) {
                return res
                    .status(400)
                    .json({ message: e?.message ?? "Error aprobando solicitud" });
            }
        };
        this.rechazar = async (req, res) => {
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({ message: "id inválido" });
            }
            try {
                const adminId = req.user?.id;
                if (!adminId)
                    return res.status(401).json({ message: "Unauthorized" });
                const result = await service.rechazar(adminId, id, req.body);
                return res.json(result);
            }
            catch (e) {
                return res
                    .status(400)
                    .json({ message: e?.message ?? "Error rechazando solicitud" });
            }
        };
    }
}
exports.SolicitudesCambioController = SolicitudesCambioController;
//# sourceMappingURL=solicitudesCambioController.js.map