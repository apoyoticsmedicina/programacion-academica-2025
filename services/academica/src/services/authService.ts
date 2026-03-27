// src/services/authService.ts
import { OAuth2Client } from "google-auth-library";
import jwt, { SignOptions } from 'jsonwebtoken';
import { Repository } from "typeorm";
import { Usuario, RolUsuario } from "../entities/Usuario";
import { env } from "../config/env";

const client = new OAuth2Client(
  env.google.clientId,
  env.google.clientSecret,
  env.google.redirectUri
);

export class AuthService {
  constructor(private repo: Repository<Usuario>) { }

  private signJwt(user: Usuario) {
    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
      foto: user.foto,
    };

    const signOptions: SignOptions = {
      expiresIn: env.auth.jwtExpiresIn as SignOptions["expiresIn"],
    };

    const token = jwt.sign(payload, env.auth.jwtSecret, signOptions);
    return { token, user };
  }

  private normalizeEmail(email: string) {
    return (email || '').trim().toLowerCase();
  }

  getGoogleAuthUrl(): string {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const options = {
      redirect_uri: env.google.redirectUri,
      client_id: env.google.clientId,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  private async getGoogleUser(code: string) {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const response = await client.request({
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
    });

    const data = response.data as any;

    return {
      email: data.email as string,
      nombre: data.name as string,
      foto: data.picture as string | undefined,
    };
  }

  async authenticateWithGoogle(code: string) {
    const googleUser = await this.getGoogleUser(code);

    const domain = env.auth.allowedEmailDomain;
    if (!googleUser.email.endsWith(`@${domain}`)) {
      const err: any = new Error(
        `Solo se permiten correos institucionales @${domain}`
      );
      err.status = 401;
      throw err;
    }

    let user = await this.repo.findOne({
      where: { email: googleUser.email },
    });

    if (!user) {
      const total = await this.repo.count();
      const rol: RolUsuario = total === 0 ? 'superadmin' : 'coordinador de programa';

      user = this.repo.create({
        email: googleUser.email,
        rol,
        nombre: googleUser.nombre,
        foto: googleUser.foto,
        ultimo_login: new Date(),
      });
    } else {
      user.nombre = googleUser.nombre;
      user.foto = googleUser.foto;
      user.ultimo_login = new Date();
      user.actualizado_en = new Date();
    }

    user = await this.repo.save(user);

    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      nombre: user.nombre,
      foto: user.foto,
    };

    // 🔧 Tipamos explícitamente las opciones para que TS esté feliz
    const signOptions: SignOptions = {
      expiresIn: env.auth.jwtExpiresIn as SignOptions["expiresIn"],
    };

    const token = jwt.sign(payload, env.auth.jwtSecret, signOptions);

    return { token, user };
  }

  verifyToken(token: string) {
    return jwt.verify(token, env.auth.jwtSecret) as any;
  }


  async listUsuarios(): Promise<Usuario[]> {
    return this.repo.find({
      order: { creado_en: "DESC" },
    });
  }

  async preRegister(email: string, rol: RolUsuario): Promise<Usuario> {
    const emailNorm = email.trim().toLowerCase();

    let user = await this.repo.findOne({
      where: { email: emailNorm },
    });

    if (!user) {
      user = this.repo.create({
        email: emailNorm,
        rol,
      });
    } else {
      user.rol = rol;
      user.actualizado_en = new Date();
    }

    return this.repo.save(user);
  }

  getAvailableRoles(): RolUsuario[] {
    return ['superadmin', 'admin', 'coordinador de programa', 'coordinador de curso', 'docente'];
  }

  /**
 * Login DEV por email (solo para pruebas).
 * Requiere:
 * - env.auth.allowDevLogin === true
 * - devKey recibido (header) == env.auth.devLoginKey
 */
  async authenticateDevByEmail(email: string, devKey: string) {
    // 1) Feature flag
    if (!env.auth.allowDevLogin) {
      const err: any = new Error('Dev login deshabilitado.');
      err.status = 403;
      throw err;
    }

    // 2) Validar key (clave compartida)
    if (!devKey || devKey !== env.auth.devLoginKey) {
      const err: any = new Error('Dev key inválida.');
      err.status = 401;
      throw err;
    }

    // 3) Normalizar + validar email
    const emailNorm = this.normalizeEmail(email);
    if (!emailNorm || !emailNorm.includes('@')) {
      const err: any = new Error('Email inválido.');
      err.status = 400;
      throw err;
    }

    // ✅ Recomendación fuerte:
    // Para que NO sea una puerta trasera total, exigimos que el usuario exista (preregistrado)
    // y así puedes controlar roles desde tu pantalla de preregistro.
    let user = await this.repo.findOne({ where: { email: emailNorm } });

    if (!user) {
      const err: any = new Error(
        'El usuario no existe. Preregístralo primero para poder hacer login DEV.'
      );
      err.status = 404;
      throw err;
    }

    // 4) Simular “perfil” (opcional)
    // No sobrescribimos nombre/foto si ya existen. Pero podrías setear un placeholder.
    user.ultimo_login = new Date();
    user.actualizado_en = new Date();

    user = await this.repo.save(user);

    // 5) Firmar JWT igual que Google
    return this.signJwt(user);
  }

}



