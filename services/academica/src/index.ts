// src/index.ts
import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

import { AppDataSource } from './config/data-source';
import router from './routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(bodyParser.json());


app.use('/', router);

const PORT = +(process.env.PORT || 3000);

async function startApp() {
  try {
    // Inicializo TypeORM (Postgres)
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');

    // Arranco el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor de Programación Académica corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error crítico durante la inicialización:', error);
    process.exit(1);
  }
}

startApp();
