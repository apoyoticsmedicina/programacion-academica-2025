import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";

import { ProgramaAcademico } from "../entities/ProgramaAcademico";
import { PlanEstudio } from "../entities/PlanEstudio";
import { RegistroPlanEstudio } from "../entities/RegistroPlanEstudio";
import { Curso } from "../entities/Curso";
import { PlanEstudioCurso } from "../entities/PlanEstudioCurso";
import { CursoDetalle } from "../entities/CursoDetalle";
import { Docente } from "../entities/Docente";
import { CursoDocente } from "../entities/CursoDocente";
import { Cronograma } from "../entities/Cronograma";
import { CursoRequisito } from "../entities/RequisitosCurso";
import { SolicitudCambio } from "../entities/SolicitudCambio";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    ProgramaAcademico,
    PlanEstudio,
    RegistroPlanEstudio,
    Curso,
    PlanEstudioCurso,
    CursoDetalle,
    Docente,
    CursoDocente,
    Cronograma,
    CursoRequisito,
    SolicitudCambio,
  ],
});
