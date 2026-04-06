"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const data_source_1 = require("../config/data-source");
const Usuario_1 = require("../entities/Usuario");
const authService_1 = require("../services/authService");
const env_1 = require("../config/env");
class AuthController {
    constructor() {
        // GET /auth/google
        this.googleAuth = (req, res, next) => {
            try {
                const url = this.svc.getGoogleAuthUrl();
                res.redirect(url);
            }
            catch (err) {
                next(err);
            }
        };
        // GET /auth/google/callback
        this.googleCallback = async (req, res, next) => {
            try {
                const code = req.query.code;
                if (!code) {
                    return res.status(400).json({ message: 'Missing code' });
                }
                const { token, user } = await this.svc.authenticateWithGoogle(code);
                const frontendUrl = env_1.env.frontendUrl; // ← ahora de env
                const redirectUrl = new URL('/auth/popup-callback', frontendUrl);
                redirectUrl.searchParams.set('token', token);
                redirectUrl.searchParams.set('email', user.email);
                redirectUrl.searchParams.set('nombre', user.nombre ?? '');
                redirectUrl.searchParams.set('rol', user.rol);
                if (user.foto)
                    redirectUrl.searchParams.set('foto', user.foto);
                return res.redirect(redirectUrl.toString());
            }
            catch (err) {
                next(err);
            }
        };
        // GET /auth/me
        this.me = (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader?.startsWith('Bearer ')) {
                    return res.status(401).json({ message: 'Missing token' });
                }
                const token = authHeader.substring(7);
                const payload = this.svc.verifyToken(token);
                // devolvemos el "AuthUser" que espera el front
                return res.json({
                    id: payload.sub,
                    email: payload.email,
                    nombre: payload.nombre,
                    rol: payload.rol,
                    foto: payload.foto,
                });
            }
            catch (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
        };
        this.listUsuarios = async (req, res) => {
            try {
                const list = await this.svc.listUsuarios();
                res.json(list);
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error al listar usuarios' });
            }
        };
        this.preRegister = async (req, res) => {
            try {
                const { email, rol } = req.body;
                if (!email || !rol) {
                    return res
                        .status(400)
                        .json({ message: 'email y rol son obligatorios' });
                }
                if (!['superadmin', 'admin', 'coordinador de programa', 'coordinador de curso', 'docente'].includes(rol)) {
                    return res
                        .status(400)
                        .json({ message: "rol debe ser 'superadmin', 'admin', 'coordinador de programa', 'coordinador de curso' o 'docente'" });
                }
                const user = await this.svc.preRegister(email, rol);
                res.status(201).json(user);
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error al registrar usuario' });
            }
        };
        this.roles = (req, res) => {
            const roles = this.svc.getAvailableRoles();
            res.json(roles);
        };
        this.devLogin = async (req, res, next) => {
            try {
                const { email } = req.body;
                if (!email) {
                    return res.status(400).json({ message: 'email es obligatorio' });
                }
                // ✅ header recomendado: X-DEV-KEY
                const devKey = (req.header('x-dev-key') ||
                    req.header('X-DEV-KEY') ||
                    '');
                const { token, user } = await this.svc.authenticateDevByEmail(email, devKey);
                // Para el front: misma forma que usas en /auth/me / callback
                return res.json({
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        nombre: user.nombre ?? '',
                        rol: user.rol,
                        foto: user.foto,
                        ultimo_login: user.ultimo_login,
                    },
                });
            }
            catch (err) {
                next(err);
            }
        };
        const repo = data_source_1.AppDataSource.getRepository(Usuario_1.Usuario);
        this.svc = new authService_1.AuthService(repo);
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map