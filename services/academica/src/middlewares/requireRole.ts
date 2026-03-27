import { Request, Response, NextFunction } from "express";

export function requireRole(roles: string[]) {
    const allowed = new Set(roles);

    return (req: Request, res: Response, next: NextFunction) => {
        const rol = req.user?.rol;
        if (!rol) return res.status(401).json({ message: "Unauthorized" });

        if (!allowed.has(rol)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
}