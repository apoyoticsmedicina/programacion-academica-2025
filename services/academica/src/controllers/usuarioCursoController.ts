import { Request, Response } from "express";
import { UsuarioCursoService } from "../services/usuarioCursoService";

const service = new UsuarioCursoService();

export class UsuarioCursoController {
    async listByUsuario(req: Request, res: Response) {
        const usuarioId = Number(req.params.usuarioId);
        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
            return res.status(400).json({ message: "usuarioId inválido" });
        }

        const data = await service.listCursosByUsuario(usuarioId);
        return res.json(data);
    }

    // Reemplazo total
    async setForUsuario(req: Request, res: Response) {
        const usuarioId = Number(req.params.usuarioId);
        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
            return res.status(400).json({ message: "usuarioId inválido" });
        }

        const cursoIds = req.body?.cursoIds;
        if (!Array.isArray(cursoIds)) {
            return res.status(400).json({ message: "cursoIds debe ser un arreglo" });
        }

        try {
            const data = await service.setCursosForUsuario(usuarioId, { cursoIds });
            return res.json(data);
        } catch (e: any) {
            return res.status(400).json({ message: e?.message ?? "Error asignando cursos" });
        }
    }

    // Agregar incremental
    async addToUsuario(req: Request, res: Response) {
        const usuarioId = Number(req.params.usuarioId);
        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
            return res.status(400).json({ message: "usuarioId inválido" });
        }

        const cursoIds = req.body?.cursoIds;
        if (!Array.isArray(cursoIds)) {
            return res.status(400).json({ message: "cursoIds debe ser un arreglo" });
        }

        try {
            const data = await service.addCursosToUsuario(usuarioId, { cursoIds });
            return res.json(data);
        } catch (e: any) {
            return res.status(400).json({ message: e?.message ?? "Error agregando cursos" });
        }
    }

    async removeOne(req: Request, res: Response) {
        const usuarioId = Number(req.params.usuarioId);
        const cursoId = Number(req.params.cursoId);

        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
            return res.status(400).json({ message: "usuarioId inválido" });
        }
        if (!Number.isInteger(cursoId) || cursoId <= 0) {
            return res.status(400).json({ message: "cursoId inválido" });
        }

        const ok = await service.removeCursoFromUsuario(usuarioId, cursoId);
        if (!ok) return res.status(404).json({ message: "Vínculo no encontrado" });
        return res.status(204).send();
    }

    async listDisponibles(req: Request, res: Response) {
        const usuarioId = Number(req.params.usuarioId);
        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
            return res.status(400).json({ message: "usuarioId inválido" });
        }

        try {
            const data = await service.listCursosDisponibles(usuarioId);
            return res.json(data);
        } catch (e: any) {
            return res
                .status(400)
                .json({ message: e?.message ?? "Error listando cursos disponibles" });
        }
    }

    async listMine(req: Request, res: Response) {
        const userId = (req as any).user?.id; // o req.user?.id si ya tipaste Express.Request
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const data = await service.listCursosByUsuario(Number(userId));
        return res.json(data);
    }
}