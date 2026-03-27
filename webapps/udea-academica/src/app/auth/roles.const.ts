// src/app/auth/roles.const.ts
import type { RolUsuario } from '../dto/roles.dto';

export const ROLES = {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    COORD_PROGRAMA: 'coordinador de programa',
    COORD_CURSO: 'coordinador de curso',
    DOCENTE: 'docente',
} as const satisfies Record<string, RolUsuario>;
