import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/data-source";
import { Usuario } from "../entities/Usuario";
import { AuthService } from "../services/authService";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing token" });
        }

        const token = authHeader.substring(7);

        const repo = AppDataSource.getRepository(Usuario);
        const svc = new AuthService(repo);

        const payload = svc.verifyToken(token);

        req.user = {
            id: Number(payload.sub),
            email: payload.email,
            rol: payload.rol,
            nombre: payload.nombre,
            foto: payload.foto,
        };

        if (!Number.isInteger(req.user.id) || req.user.id <= 0) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
}