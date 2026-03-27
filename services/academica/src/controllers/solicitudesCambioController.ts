import { Request, Response } from "express";
import { SolicitudesCambioService } from "../services/SolicitudesCambioService";

const service = new SolicitudesCambioService();

export class SolicitudesCambioController {
    pendientes = async (_req: Request, res: Response) => {
        const data = await service.listPendientes();
        return res.json(data);
    };

    mias = async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const data = await service.listMias(userId);
        return res.json(data);
    };

    getById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "id inválido" });
        }

        const userId = req.user?.id;
        const rol = req.user?.rol as any;
        if (!userId || !rol) return res.status(401).json({ message: "Unauthorized" });

        const row = await service.getByIdForUser(userId, rol, id);
        if (!row) return res.status(404).json({ message: "No encontrado" });

        return res.json(row);
    };

    crear = async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ message: "Unauthorized" });

            const created = await service.crear(userId, req.body);
            return res.status(201).json(created);
        } catch (e: any) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error creando solicitud" });
        }
    };

    aprobar = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "id inválido" });
        }

        try {
            const adminId = req.user?.id;
            if (!adminId) return res.status(401).json({ message: "Unauthorized" });

            const result = await service.aprobar(adminId, id, req.body);
            return res.json(result);
        } catch (e: any) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error aprobando solicitud" });
        }
    };

    rechazar = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "id inválido" });
        }

        try {
            const adminId = req.user?.id;
            if (!adminId) return res.status(401).json({ message: "Unauthorized" });

            const result = await service.rechazar(adminId, id, req.body);
            return res.json(result);
        } catch (e: any) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error rechazando solicitud" });
        }
    };
}