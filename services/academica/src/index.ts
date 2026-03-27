// src/index.ts
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { json as expressJson } from 'express';
import { setMaxListeners } from 'events';
import { AppDataSource } from './config/data-source';
import catalogosController from './controllers/catalogosController';
import router from './routes';
import { env } from './config/env';
import { EstadoServidorService } from './services/estadoServidorService';

setMaxListeners(30);

const FRONTEND_ORIGIN = env.frontendUrl;
const PORT = env.backendPort;
const AUTO_MIGRATE = env.dbAutoMigrate;

async function startApp() {
  try {
    // 1) Inicializa TypeORM
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');

    // 2) Aplica migraciones si corresponde
    if (AUTO_MIGRATE) {
      const migrations = await AppDataSource.runMigrations();
      if (migrations.length) {
        console.log(
          '🗂️  Migraciones aplicadas:',
          migrations.map((m) => m.name).join(', '),
        );
      } else {
        console.log('🗂️  No hay migraciones pendientes.');
      }
    } else {
      console.log('🗂️  Auto-migrate deshabilitado (DB_AUTO_MIGRATE=false).');
    }

    // 2.1) Recalculo automático (ya con DB lista)
    const estadoSrv = new EstadoServidorService();

    try {
      await estadoSrv.recalcActiveByNow();
      console.log('🟦 EstadoServidor: recalc inicial aplicado');
    } catch (e) {
      console.error('🟧 EstadoServidor: recalc inicial falló:', e);
    }

    const RECALC_MS = 30_000;
    setInterval(async () => {
      try {
        await estadoSrv.recalcActiveByNow();
      } catch (e) {
        console.error('🟧 EstadoServidor: recalc periódico falló:', e);
      }
    }, RECALC_MS);

    // 3) Crea y configura la app
    const app = express();

    app.use(
      cors({
        origin: FRONTEND_ORIGIN,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Dev-Key'],
        credentials: true,
      }),
    );
    app.options('*', cors());

    app.use(expressJson({ limit: '2mb' }));

    app.get('/health', (_req, res) => res.json({ ok: true }));

    app.use(catalogosController);
    app.use('/', router);

    app.use((req, res) => {
      res.status(404).json({ message: 'Not Found', path: req.originalUrl });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use(
      (
        err: any,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        console.error('❌ Unhandled error:', err);
        const status = err?.status || 500;
        res.status(status).json({ message: err?.message || 'Internal Server Error' });
      },
    );

    app.listen(PORT, () => {
      console.log(
        `🚀 Servidor de Programación Académica corriendo en http://localhost:${PORT}`,
      );
      console.log(`🌐 CORS origin permitido: ${FRONTEND_ORIGIN}`);
      console.log(`🌱 APP_ENV: ${env.appEnv} | NODE_ENV: ${env.nodeEnv}`);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('🚨 Unhandled Rejection:', reason);
    });
    process.on('uncaughtException', (err) => {
      console.error('🚨 Uncaught Exception:', err);
    });
  } catch (error) {
    console.error('❌ Error crítico durante la inicialización:', error);
    process.exit(1);
  }
}

startApp();