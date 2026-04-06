"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
// src/config/data-source.ts
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_1 = require("./env");
// ===== ENTIDADES del esquema vigente =====
const ProgramaAcademico_1 = require("../entities/ProgramaAcademico");
const Cohorte_1 = require("../entities/Cohorte");
const Curso_1 = require("../entities/Curso");
const TipoCurso_1 = require("../entities/TipoCurso");
const CaracteristicasCurso_1 = require("../entities/CaracteristicasCurso");
const ClaseCurso_1 = require("../entities/ClaseCurso");
const ModalidadCurso_1 = require("../entities/ModalidadCurso");
const PlanDeEstudio_1 = require("../entities/PlanDeEstudio");
const PlanDeEstudioCurso_1 = require("../entities/PlanDeEstudioCurso");
const ProgramaCurso_1 = require("../entities/ProgramaCurso");
const ProgramaDocente_1 = require("../entities/ProgramaDocente");
const ProgramaCursoRequisito_1 = require("../entities/ProgramaCursoRequisito");
const HorasCurso_1 = require("../entities/HorasCurso");
const ProgramaMetodologia_1 = require("../entities/ProgramaMetodologia");
const ProgramaMetodologiaEstrategia_1 = require("../entities/ProgramaMetodologiaEstrategia");
const ProgramaEvaluacion_1 = require("../entities/ProgramaEvaluacion");
const ProgramaBibliografia_1 = require("../entities/ProgramaBibliografia");
const CronogramaGrupoDocente_1 = require("../entities/CronogramaGrupoDocente");
const CronogramaGrupo_1 = require("../entities/CronogramaGrupo");
const EstrategiaDidactica_1 = require("../entities/EstrategiaDidactica");
const Docente_1 = require("../entities/Docente");
const Usuario_1 = require("../entities/Usuario");
const EstadoServidor_1 = require("../entities/EstadoServidor");
const UsuarioCurso_1 = require("../entities/UsuarioCurso");
const SolicitudCambio_1 = require("../entities/SolicitudCambio");
const isTs = __filename.endsWith('.ts');
exports.AppDataSource = new typeorm_1.DataSource({
    // Mapeado desde env.db.type (pgsql -> postgres)
    type: env_1.env.db.type,
    host: env_1.env.db.host,
    port: env_1.env.db.port,
    username: env_1.env.db.user,
    password: env_1.env.db.pass,
    database: env_1.env.db.name,
    // Si algún día usas RDS con SSL, puedes activar DB_SSL="true"
    ssl: env_1.env.db.ssl ? { rejectUnauthorized: false } : undefined,
    dropSchema: false,
    synchronize: false,
    logging: env_1.env.nodeEnv !== 'production',
    entities: [
        // Catálogos / maestras
        ProgramaAcademico_1.ProgramaAcademico,
        Cohorte_1.Cohorte,
        Curso_1.Curso,
        TipoCurso_1.TipoCurso,
        CaracteristicasCurso_1.CaracteristicasCurso,
        ClaseCurso_1.ClaseCurso,
        ModalidadCurso_1.ModalidadCurso,
        // Planes y asociaciones
        PlanDeEstudio_1.PlanDeEstudio,
        PlanDeEstudioCurso_1.PlanEstudioCurso,
        // Programa de curso y derivados
        ProgramaCurso_1.ProgramaCurso,
        ProgramaDocente_1.ProgramaDocente,
        ProgramaCursoRequisito_1.ProgramaCursoRequisito,
        HorasCurso_1.HorasCurso,
        ProgramaMetodologia_1.ProgramaMetodologia,
        ProgramaEvaluacion_1.ProgramaEvaluacion,
        ProgramaMetodologiaEstrategia_1.ProgramaMetodologiaEstrategia,
        ProgramaBibliografia_1.ProgramaBibliografia,
        CronogramaGrupo_1.CronogramaGrupo,
        CronogramaGrupoDocente_1.CronogramaGrupoDocente,
        SolicitudCambio_1.SolicitudCambio,
        // Personas
        EstrategiaDidactica_1.EstrategiaDidactica,
        Docente_1.Docente,
        Usuario_1.Usuario,
        UsuarioCurso_1.UsuarioCurso,
        EstadoServidor_1.EstadoServidor,
    ],
    migrations: [
        isTs ? 'src/migration/**/*.{ts,tsx}' : 'dist/migration/**/*.{js,cjs}',
    ],
    subscribers: [],
});
//# sourceMappingURL=data-source.js.map