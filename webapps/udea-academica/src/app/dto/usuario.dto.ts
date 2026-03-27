// src/app/dto/usuario.dto.ts

import type { RolUsuario } from './roles.dto';

export interface UsuarioAdminDTO {
    id: number;
    email: string;
    rol: RolUsuario;
    nombre?: string | null;
    foto?: string | null;
    creado_en: string;       // viene como ISO string del backend
    actualizado_en: string;  // idem
    ultimo_login?: string | null;
}
