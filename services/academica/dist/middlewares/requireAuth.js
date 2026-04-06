"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const data_source_1 = require("../config/data-source");
const Usuario_1 = require("../entities/Usuario");
const authService_1 = require("../services/authService");
function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing token" });
        }
        const token = authHeader.substring(7);
        const repo = data_source_1.AppDataSource.getRepository(Usuario_1.Usuario);
        const svc = new authService_1.AuthService(repo);
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
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
}
exports.requireAuth = requireAuth;
//# sourceMappingURL=requireAuth.js.map