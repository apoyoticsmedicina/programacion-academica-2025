// src/config/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';

// ===== ENTIDADES del esquema vigente =====
import { ProgramaAcademico } from '../entities/ProgramaAcademico';
import { Cohorte } from '../entities/Cohorte';

import { Curso } from '../entities/Curso';
import { TipoCurso } from '../entities/TipoCurso';
import { CaracteristicasCurso } from '../entities/CaracteristicasCurso';
import { ClaseCurso } from '../entities/ClaseCurso';
import { ModalidadCurso } from '../entities/ModalidadCurso';

import { PlanDeEstudio } from '../entities/PlanDeEstudio';
import { PlanEstudioCurso } from '../entities/PlanDeEstudioCurso';

import { ProgramaCurso } from '../entities/ProgramaCurso';
import { ProgramaDocente } from '../entities/ProgramaDocente';
import { ProgramaCursoRequisito } from '../entities/ProgramaCursoRequisito';
import { HorasCurso } from '../entities/HorasCurso';
import { ProgramaMetodologia } from '../entities/ProgramaMetodologia';
import { ProgramaMetodologiaEstrategia } from '../entities/ProgramaMetodologiaEstrategia';
import { ProgramaEvaluacion } from '../entities/ProgramaEvaluacion';
import { ProgramaBibliografia } from '../entities/ProgramaBibliografia';
import { CronogramaGrupoDocente } from '../entities/CronogramaGrupoDocente';
import { CronogramaGrupo } from '../entities/CronogramaGrupo';
import { EstrategiaDidactica } from '../entities/EstrategiaDidactica';
import { Docente } from '../entities/Docente';
import { Usuario } from '../entities/Usuario';
import { EstadoServidor } from '../entities/EstadoServidor';
import { UsuarioCurso } from '../entities/UsuarioCurso';
import { SolicitudCambio } from '../entities/SolicitudCambio';

const isTs = __filename.endsWith('.ts');

export const AppDataSource = new DataSource({
  // Mapeado desde env.db.type (pgsql -> postgres)
  type: env.db.type as any,
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.pass,
  database: env.db.name,

  // Si algún día usas RDS con SSL, puedes activar DB_SSL="true"
  ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
  dropSchema: false,
  synchronize: false, // mantenlo en false: estás usando migraciones
  logging: env.nodeEnv !== 'production',

  entities: [
    // Catálogos / maestras
    ProgramaAcademico,
    Cohorte,

    Curso,
    TipoCurso,
    CaracteristicasCurso,
    ClaseCurso,
    ModalidadCurso,

    // Planes y asociaciones
    PlanDeEstudio,
    PlanEstudioCurso,

    // Programa de curso y derivados
    ProgramaCurso,
    ProgramaDocente,
    ProgramaCursoRequisito,
    HorasCurso,
    ProgramaMetodologia,
    ProgramaEvaluacion,
    ProgramaMetodologiaEstrategia,
    ProgramaBibliografia,
    CronogramaGrupo,
    CronogramaGrupoDocente,
    SolicitudCambio,

    // Personas
    EstrategiaDidactica,
    Docente,
    Usuario,
    UsuarioCurso,
    EstadoServidor,
  ],

  migrations: [
    isTs ? 'src/migration/**/*.{ts,tsx}' : 'dist/migration/**/*.{js,cjs}',
  ],
  subscribers: [],
});
