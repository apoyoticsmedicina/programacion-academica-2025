// src/config/env.ts
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";

const projectRoot = process.cwd();

// 1) Cargar .env "genérico" si existe
const defaultEnvPath = path.resolve(projectRoot, ".env");
if (fs.existsSync(defaultEnvPath)) {
  dotenv.config({ path: defaultEnvPath });
} else {
  // fallback: busca .env por defecto
  dotenv.config();
}

// 2) Determinar APP_ENV y cargar .env.{APP_ENV} si existe
const appEnv = process.env.APP_ENV || "local"; // local | dev | prod | test

const specificEnvFile = `.env.${appEnv}`;
const specificEnvPath = path.resolve(projectRoot, specificEnvFile);

if (fs.existsSync(specificEnvPath)) {
  dotenv.config({ path: specificEnvPath });
}

// Helper: env requerida
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

// Mapear DB_CONNECTION=pgsql -> postgres (lo que espera TypeORM)
const dbConnectionRaw = process.env.DB_CONNECTION || "postgres";
const dbType = dbConnectionRaw === "pgsql" ? "postgres" : dbConnectionRaw;

const rawTemplatePath =
  process.env.DOCX_PROGRAMA_TEMPLATE_PATH ??
  path.join("templates", "VD-FO-003-plantilla.docx");

const resolvedTemplatePath = path.isAbsolute(rawTemplatePath)
  ? rawTemplatePath
  : path.join(process.cwd(), rawTemplatePath);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appEnv,

  // Soporta BACKEND_PORT o el PORT viejo
  backendPort: Number(process.env.BACKEND_PORT || process.env.PORT || 3000),

  // Control de migraciones automáticas
  dbAutoMigrate: String(process.env.DB_AUTO_MIGRATE ?? "true") === "true",

  db: {
    type: dbType,
    host: required("DB_HOST"),
    port: Number(process.env.DB_PORT ?? 5432),
    name: required("DB_NAME"),
    user: required("DB_USER"),
    pass: required("DB_PASS"),
    ssl: String(process.env.DB_SSL ?? "false") === "true",
  },

  google: {
    clientId: required("GOOGLE_CLIENT_ID"),
    clientSecret: required("GOOGLE_CLIENT_SECRET"),
    redirectUri: required("GOOGLE_REDIRECT_URI"),
  },

  // Soporta FRONTEND_ORIGIN o FRONTEND_URL (como ya lo tienes)
  frontendUrl: process.env.FRONTEND_ORIGIN || required("FRONTEND_URL"),

  auth: {
    jwtSecret: required("JWT_SECRET"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
    allowedEmailDomain: process.env.AUTH_ALLOWED_DOMAIN ?? "udea.edu.co",
    allowDevLogin: process.env.ALLOW_DEV_LOGIN === 'true',
    devLoginKey: process.env.DEV_LOGIN_KEY ?? '',
  },

  pagination: {
    // tamaños por defecto y máximo (globales)
    defaultPageSize: Number(process.env.PAGINATION_DEFAULT_PAGE_SIZE ?? 20),
    maxPageSize: Number(process.env.PAGINATION_MAX_PAGE_SIZE ?? 100),
  },

  docx: {
    programaTemplatePath: resolvedTemplatePath,
    enableWatch:
      process.env.DOCX_PROGRAMA_TEMPLATE_WATCH !== undefined
        ? process.env.DOCX_PROGRAMA_TEMPLATE_WATCH === "true"
        : (process.env.NODE_ENV ?? "development") !== "production",
    allowDebug:
      process.env.DOCX_PROGRAMA_ALLOW_DEBUG !== undefined
        ? process.env.DOCX_PROGRAMA_ALLOW_DEBUG === "true"
        : (process.env.NODE_ENV ?? "development") !== "production",
  },
};
