"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_2 = require("express");
const events_1 = require("events");
const data_source_1 = require("./config/data-source");
const catalogosController_1 = __importDefault(require("./controllers/catalogosController"));
const routes_1 = __importDefault(require("./routes"));
const env_1 = require("./config/env");
const estadoServidorService_1 = require("./services/estadoServidorService");
(0, events_1.setMaxListeners)(30);
const FRONTEND_ORIGIN = env_1.env.frontendUrl;
const PORT = env_1.env.backendPort;
const AUTO_MIGRATE = env_1.env.dbAutoMigrate;
async function startApp() {
    try {
        // 1) Inicializa TypeORM
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Conexión a la base de datos establecida');
        // 2) Aplica migraciones si corresponde
        if (AUTO_MIGRATE) {
            const migrations = await data_source_1.AppDataSource.runMigrations();
            if (migrations.length) {
                console.log('🗂️  Migraciones aplicadas:', migrations.map((m) => m.name).join(', '));
            }
            else {
                console.log('🗂️  No hay migraciones pendientes.');
            }
        }
        else {
            console.log('🗂️  Auto-migrate deshabilitado (DB_AUTO_MIGRATE=false).');
        }
        // 2.1) Recalculo automático (ya con DB lista)
        const estadoSrv = new estadoServidorService_1.EstadoServidorService();
        try {
            await estadoSrv.recalcActiveByNow();
            console.log('🟦 EstadoServidor: recalc inicial aplicado');
        }
        catch (e) {
            console.error('🟧 EstadoServidor: recalc inicial falló:', e);
        }
        const RECALC_MS = 30000;
        setInterval(async () => {
            try {
                await estadoSrv.recalcActiveByNow();
            }
            catch (e) {
                console.error('🟧 EstadoServidor: recalc periódico falló:', e);
            }
        }, RECALC_MS);
        // 3) Crea y configura la app
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)({
            origin: FRONTEND_ORIGIN,
            methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Dev-Key'],
            credentials: true,
        }));
        app.options('*', (0, cors_1.default)());
        app.use((0, express_2.json)({ limit: '2mb' }));
        app.get('/health', (_req, res) => res.json({ ok: true }));
        app.use(catalogosController_1.default);
        app.use('/', routes_1.default);
        app.use((req, res) => {
            res.status(404).json({ message: 'Not Found', path: req.originalUrl });
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        app.use((err, _req, res, _next) => {
            console.error('❌ Unhandled error:', err);
            const status = err?.status || 500;
            res.status(status).json({ message: err?.message || 'Internal Server Error' });
        });
        app.listen(PORT, () => {
            console.log(`🚀 Servidor de Programación Académica corriendo en http://localhost:${PORT}`);
            console.log(`🌐 CORS origin permitido: ${FRONTEND_ORIGIN}`);
            console.log(`🌱 APP_ENV: ${env_1.env.appEnv} | NODE_ENV: ${env_1.env.nodeEnv}`);
        });
        process.on('unhandledRejection', (reason) => {
            console.error('🚨 Unhandled Rejection:', reason);
        });
        process.on('uncaughtException', (err) => {
            console.error('🚨 Uncaught Exception:', err);
        });
    }
    catch (error) {
        console.error('❌ Error crítico durante la inicialización:', error);
        process.exit(1);
    }
}
startApp();
//# sourceMappingURL=index.js.map