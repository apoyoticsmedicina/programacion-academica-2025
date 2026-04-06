"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitEsquemaUnificado1731000000000 = void 0;
class InitEsquemaUnificado1731000000000 {
    constructor() {
        this.name = "InitEsquemaUnificado1731000000000";
    }
    async up(queryRunner) {
        await queryRunner.query(`
    CREATE TABLE IF NOT EXISTS "usuarios" (
      "id" SERIAL PRIMARY KEY,
      "email" varchar NOT NULL UNIQUE,
      "rol" varchar NOT NULL DEFAULT 'basico',
      "nombre" varchar NULL,
      "foto" varchar NULL,
      "creado_en" timestamptz NOT NULL DEFAULT now(),
      "actualizado_en" timestamptz NOT NULL DEFAULT now(),
      "ultimo_login" timestamptz NULL
    );
  `);
        // ===== Catálogos base =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "programas_academicos" (
        "id" SERIAL PRIMARY KEY,
        "nombre" varchar NOT NULL,
        "tipo"   varchar NOT NULL
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cohortes" (
        "id" SERIAL PRIMARY KEY,
        "fecha_inicio" date NOT NULL,
        "fecha_fin"    date NOT NULL,
        "periodo"      varchar NOT NULL,
        CONSTRAINT "UQ_cohortes_periodo" UNIQUE ("periodo")
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cursos" (
        "id" SERIAL PRIMARY KEY,
        "codigo" varchar NOT NULL UNIQUE,
        "nombre" varchar NOT NULL
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tipos_curso" (
        "id" SERIAL PRIMARY KEY,
        "tipo" varchar NOT NULL UNIQUE
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "caracteristicas_curso" (
        "id" SERIAL PRIMARY KEY,
        "caracteristicas" varchar NOT NULL UNIQUE
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "clases_curso" (
        "id" SERIAL PRIMARY KEY,
        "clase" varchar NOT NULL UNIQUE
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "modalidades_curso" (
        "id" SERIAL PRIMARY KEY,
        "modalidad" varchar NOT NULL UNIQUE
      );
    `);
        // ===== Planes =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "planes_estudio" (
        "id" SERIAL PRIMARY KEY,
        "programa_id" int NOT NULL,
        "version" varchar NOT NULL,
        "id_cohorte" int NOT NULL,
        "activo" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_plan_version_cohorte" UNIQUE ("programa_id","version","id_cohorte"),
        CONSTRAINT "FK_plan_programa" FOREIGN KEY ("programa_id")
          REFERENCES "programas_academicos"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_plan_cohorte" FOREIGN KEY ("id_cohorte")
          REFERENCES "cohortes"("id") ON DELETE RESTRICT
      );
    `);
        // ===== PlanEstudioCurso (PEC) =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plan_estudio_cursos" (
        "id" SERIAL PRIMARY KEY,
        "plan_estudio_id" int NOT NULL,
        "curso_id" int NOT NULL,
        "tipo_curso_id" int NOT NULL,
        "orden" int NULL,
        CONSTRAINT "UQ_pec_plan_curso" UNIQUE ("plan_estudio_id","curso_id"),
        CONSTRAINT "FK_pec_plan"  FOREIGN KEY ("plan_estudio_id")
          REFERENCES "planes_estudio"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pec_curso" FOREIGN KEY ("curso_id")
          REFERENCES "cursos"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_pec_tipo"  FOREIGN KEY ("tipo_curso_id")
          REFERENCES "tipos_curso"("id") ON DELETE RESTRICT
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pec_plan" ON "plan_estudio_cursos" ("plan_estudio_id");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pec_plan_orden" ON "plan_estudio_cursos" ("plan_estudio_id","orden");
    `);
        // ===== Docentes =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "docentes" (
        "id" SERIAL PRIMARY KEY,
        "tipo_documento" varchar NOT NULL,
        "documento" varchar NOT NULL UNIQUE,
        "nombres" varchar NOT NULL,
        "apellidos" varchar NOT NULL,
        "vinculacion" varchar NULL,
        "dedicacion" varchar NULL,
        "departamento" varchar NULL,
        "unidad_academica" varchar NULL,
        "activo" boolean NOT NULL DEFAULT true,
        "correo_institucional" varchar NULL,
        "correo_personal" varchar NULL
      );
    `);
        // ===== Cronogramas: grupos por curso =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cronograma_grupos" (
        "id" SERIAL PRIMARY KEY,
        "curso_id" int NOT NULL,
        "nombre" varchar(100) NOT NULL,
        CONSTRAINT "FK_cg_curso" FOREIGN KEY ("curso_id")
          REFERENCES "cursos"("id") ON DELETE CASCADE
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cg_curso" ON "cronograma_grupos" ("curso_id");
    `);
        // ===== Cronogramas: docentes por grupo =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "cronograma_grupos_docentes" (
        "id" SERIAL PRIMARY KEY,
        "grupo_id" int NOT NULL,
        "docente_id" int NOT NULL,
        "horas" int NOT NULL DEFAULT 0,
        CONSTRAINT "FK_cgd_grupo" FOREIGN KEY ("grupo_id")
          REFERENCES "cronograma_grupos"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cgd_docente" FOREIGN KEY ("docente_id")
          REFERENCES "docentes"("id") ON DELETE RESTRICT
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cgd_grupo" ON "cronograma_grupos_docentes" ("grupo_id");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_cgd_docente" ON "cronograma_grupos_docentes" ("docente_id");
    `);
        // ===== Programas de curso =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "programas_curso" (
        "id" SERIAL PRIMARY KEY,
        "id_plan_estudio_curso" int NOT NULL,
        "unidad_academica" varchar NOT NULL,
        "id_caracteristicas" int NOT NULL,
        "id_clase_curso" int NOT NULL,
        "id_modalidad_curso" int NOT NULL,
        "nucleo_curso" varchar NULL,
        "vigencia" varchar NULL, 
        "perfil" text NULL,
        "intencionalidades_formativas" text NULL,
        "aportes_curso_formacion" text NULL,
        "descripcion_conocimientos" text NULL,
        "creditos" numeric(5,2) NULL,
        CONSTRAINT "FK_pc_pec" FOREIGN KEY ("id_plan_estudio_curso")
          REFERENCES "plan_estudio_cursos"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pc_car" FOREIGN KEY ("id_caracteristicas")
          REFERENCES "caracteristicas_curso"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_pc_clase" FOREIGN KEY ("id_clase_curso")
          REFERENCES "clases_curso"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_pc_mod" FOREIGN KEY ("id_modalidad_curso")
          REFERENCES "modalidades_curso"("id") ON DELETE RESTRICT
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pc_pec" ON "programas_curso" ("id_plan_estudio_curso");
    `);
        // ===== Programa ↔ Docente =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "programas_docente" (
        "id" SERIAL PRIMARY KEY,
        "id_docente" int NOT NULL,
        "id_programa" int NOT NULL,
        "porcentaje" numeric(5,2) NOT NULL DEFAULT 0,
        CONSTRAINT "FK_pd_doc" FOREIGN KEY ("id_docente")
          REFERENCES "docentes"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_pd_prog" FOREIGN KEY ("id_programa")
          REFERENCES "programas_curso"("id") ON DELETE CASCADE
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pd_programa" ON "programas_docente" ("id_programa");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pd_docente"  ON "programas_docente" ("id_docente");
    `);
        // ===== Requisitos (por ProgramaCurso) =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "programa_curso_requisitos" (
        "programa_curso_id"  int NOT NULL,
        "curso_id"           int NOT NULL,
        "requisito_curso_id" int NOT NULL,
        "tipo"               varchar NOT NULL,
        CONSTRAINT "PK_pcr" PRIMARY KEY ("programa_curso_id","curso_id","requisito_curso_id","tipo"),
        CONSTRAINT "FK_pcr_pc"   FOREIGN KEY ("programa_curso_id")
          REFERENCES "programas_curso"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pcr_curso" FOREIGN KEY ("curso_id")
          REFERENCES "cursos"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_pcr_req"   FOREIGN KEY ("requisito_curso_id")
          REFERENCES "cursos"("id") ON DELETE RESTRICT
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pcr_pc" ON "programa_curso_requisitos" ("programa_curso_id");
    `);
        // ===== Horas del programa de curso =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "horas_curso" (
        "id" SERIAL PRIMARY KEY,
        "h_semanales_p_e"   int NOT NULL DEFAULT 0,
        "h_semanales_t_i"   int NOT NULL DEFAULT 0,
        "h_semanales_a_a_t" int NOT NULL DEFAULT 0,
        "h_semanales_a_a_p" int NOT NULL DEFAULT 0,
        "h_semanales_a_a_t_p" int NOT NULL DEFAULT 0,
        "h_totales_curso"   int NOT NULL DEFAULT 0,
        "id_programa_curso" int NOT NULL,
        CONSTRAINT "FK_hc_pc" FOREIGN KEY ("id_programa_curso")
          REFERENCES "programas_curso"("id") ON DELETE CASCADE
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_hc_pc" ON "horas_curso" ("id_programa_curso");
    `);
        // ===== Estrategias didácticas (catálogo) =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "estrategias_didacticas" (
        "id" SERIAL PRIMARY KEY,
        "estrategia" text NOT NULL UNIQUE
      );
    `);
        // ===== Programas metodología (textos, 1:N pero usaremos 1 registro) =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "programas_metodologia" (
        "id" SERIAL PRIMARY KEY,
        "id_programa_curso" int NOT NULL,
        "medios_y_recursos" text NULL,
        "formas_interaccion" text NULL,
        "estrategias_internacionalizacion" text NULL,
        "estrategias_enfoque" text NULL,
        CONSTRAINT "FK_pm_pc" FOREIGN KEY ("id_programa_curso")
          REFERENCES "programas_curso"("id") ON DELETE CASCADE
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pm_pc" ON "programas_metodologia" ("id_programa_curso");
    `);
        // ===== Programas metodología ↔ Estrategias (N:N) =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "programas_metodologia_estrategias" (
        "id" SERIAL PRIMARY KEY,
        "id_programa_curso" int NOT NULL,
        "id_estrategia_didactica" int NOT NULL,
        CONSTRAINT "FK_pme_pc" FOREIGN KEY ("id_programa_curso")
          REFERENCES "programas_curso"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pme_estrategia" FOREIGN KEY ("id_estrategia_didactica")
          REFERENCES "estrategias_didacticas"("id") ON DELETE RESTRICT
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pme_pc" ON "programas_metodologia_estrategias" ("id_programa_curso");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pme_estrategia" ON "programas_metodologia_estrategias" ("id_estrategia_didactica");
    `);
        // ===== Programas evaluación =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "programas_evaluacion" (
        "id" SERIAL PRIMARY KEY,
        "id_programa_curso" int NOT NULL,
        "momentos_evaluacion" text NOT NULL,
        "porcentaje" numeric(5,2) NOT NULL,
        CONSTRAINT "FK_pe_pc" FOREIGN KEY ("id_programa_curso")
          REFERENCES "programas_curso"("id") ON DELETE CASCADE
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pe_pc" ON "programas_evaluacion" ("id_programa_curso");
    `);
        // ===== Programas bibliografía =====
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "programas_bibliografia" (
        "id" SERIAL PRIMARY KEY,
        "id_programa_curso" int NOT NULL,
        "cultura" varchar(100) NULL,
        "referencia" text NOT NULL,
        "palabras_clave" text NULL,
        CONSTRAINT "FK_pb_pc" FOREIGN KEY ("id_programa_curso")
          REFERENCES "programas_curso"("id") ON DELETE CASCADE
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pb_pc" ON "programas_bibliografia" ("id_programa_curso");
    `);
    }
    async down(queryRunner) {
        // bajar en orden inverso (índices y tablas) respetando FKs
        // Bibliografía
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pb_pc";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "programas_bibliografia";`);
        // Evaluación
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pe_pc";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "programas_evaluacion";`);
        // Programas ↔ Estrategias
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pme_estrategia";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pme_pc";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "programas_metodologia_estrategias";`);
        // Metodología
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pm_pc";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "programas_metodologia";`);
        // Catálogo de estrategias
        await queryRunner.query(`DROP TABLE IF EXISTS "estrategias_didacticas";`);
        // Horas
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_hc_pc";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "horas_curso";`);
        // Requisitos
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pcr_pc";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "programa_curso_requisitos";`);
        // Programas ↔ Docente
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pd_docente";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pd_programa";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "programas_docente";`);
        // Programas de curso
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pc_pec";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "programas_curso";`);
        // Cronogramas (docentes por grupo, luego grupos)
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cgd_docente";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cgd_grupo";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cronograma_grupos_docentes";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cg_curso";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cronograma_grupos";`);
        // PEC
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pec_plan_orden";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pec_plan";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "plan_estudio_cursos";`);
        // Planes
        await queryRunner.query(`DROP TABLE IF EXISTS "planes_estudio";`);
        // Catálogos base
        await queryRunner.query(`DROP TABLE IF EXISTS "modalidades_curso";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "clases_curso";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "caracteristicas_curso";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tipos_curso";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cursos";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "cohortes";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "programas_academicos";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "usuarios";`);
        // (opcional, por simetría con up)
        // await queryRunner.query(`DROP TABLE IF EXISTS "docentes";`);
    }
}
exports.InitEsquemaUnificado1731000000000 = InitEsquemaUnificado1731000000000;
//# sourceMappingURL=1731000000000-InitEsquemaUnificado.js.map