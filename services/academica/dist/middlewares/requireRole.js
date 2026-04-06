"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
function requireRole(roles) {
    const allowed = new Set(roles);
    return (req, res, next) => {
        const rol = req.user?.rol;
        if (!rol)
            return res.status(401).json({ message: "Unauthorized" });
        if (!allowed.has(rol)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
}
exports.requireRole = requireRole;
//# sourceMappingURL=requireRole.js.map