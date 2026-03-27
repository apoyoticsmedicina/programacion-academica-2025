// src/app/dto/auth.dto.ts
import type { RolUsuario } from './roles.dto';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: RolUsuario;
  foto?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}