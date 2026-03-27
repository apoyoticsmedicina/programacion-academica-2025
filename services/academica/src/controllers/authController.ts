// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { Usuario, RolUsuario } from '../entities/Usuario';
import { AuthService } from '../services/authService';
import { env } from '../config/env';

export class AuthController {
  private svc: AuthService;

  constructor() {
    const repo = AppDataSource.getRepository(Usuario);
    this.svc = new AuthService(repo);
  }

  // GET /auth/google
  googleAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = this.svc.getGoogleAuthUrl();
      res.redirect(url);
    } catch (err) {
      next(err);
    }
  };

  // GET /auth/google/callback
  googleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const code = req.query.code as string | undefined;
      if (!code) {
        return res.status(400).json({ message: 'Missing code' });
      }

      const { token, user } = await this.svc.authenticateWithGoogle(
        code,
      );

      const frontendUrl = env.frontendUrl; // ← ahora de env

      const redirectUrl = new URL('/auth/popup-callback', frontendUrl);

      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('email', user.email);
      redirectUrl.searchParams.set('nombre', user.nombre ?? '');
      redirectUrl.searchParams.set('rol', user.rol);
      if (user.foto) redirectUrl.searchParams.set('foto', user.foto);

      return res.redirect(redirectUrl.toString());
    } catch (err) {
      next(err);
    }
  };

  // GET /auth/me
  me = (req: Request, res: Response, next: NextFunction) => {
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
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };

  listUsuarios = async (req: Request, res: Response) => {
    try {
      const list = await this.svc.listUsuarios();
      res.json(list);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al listar usuarios' });
    }
  };

  preRegister = async (req: Request, res: Response) => {
    try {
      const { email, rol } = req.body as {
        email?: string;
        rol?: RolUsuario;
      };

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
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al registrar usuario' });
    }
  };

  roles = (req: Request, res: Response) => {
    const roles = this.svc.getAvailableRoles();
    res.json(roles);
  };

  devLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email?: string };

      if (!email) {
        return res.status(400).json({ message: 'email es obligatorio' });
      }

      // ✅ header recomendado: X-DEV-KEY
      const devKey =
        (req.header('x-dev-key') ||
          req.header('X-DEV-KEY') ||
          '') as string;

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
    } catch (err) {
      next(err);
    }
  };
}
