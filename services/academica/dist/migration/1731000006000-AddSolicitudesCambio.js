"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSolicitudesCambio1731000006000 = void 0;
class AddSolicitudesCambio1731000006000 {
    constructor() {
        this.name = "AddSolicitudesCambio1731000006000";
    }
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "solicitudes_cambio" (
        "id" SERIAL PRIMARY KEY,

        "curso_id" int NOT NULL,
        "programa_curso_id" int NOT NULL,
        "solicitante_id" int NOT NULL,

        "estado" varchar NOT NULL DEFAULT 'pendiente',
        "motivo" text NULL,

        "propuesta" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "snapshot" jsonb NULL,

        "comentario_admin" text NULL,
        "resuelto_por" int NULL,
        "resuelto_en" timestamptz NULL,

        "creado_en" timestamptz NOT NULL DEFAULT now(),
        "actualizado_en" timestamptz NOT NULL DEFAULT now(),

        CONSTRAINT "FK_sc_curso" FOREIGN KEY ("curso_id")
          REFERENCES "cursos"("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_sc_programa_curso" FOREIGN KEY ("programa_curso_id")
          REFERENCES "programas_curso"("id") ON DELETE CASCADE,

        CONSTRAINT "FK_sc_solicitante" FOREIGN KEY ("solicitante_id")
          REFERENCES "usuarios"("id") ON DELETE RESTRICT,

        CONSTRAINT "FK_sc_resuelto_por" FOREIGN KEY ("resuelto_por")
          REFERENCES "usuarios"("id") ON DELETE SET NULL
      );
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sc_estado" ON "solicitudes_cambio" ("estado");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sc_curso" ON "solicitudes_cambio" ("curso_id");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sc_programa_curso" ON "solicitudes_cambio" ("programa_curso_id");
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sc_solicitante" ON "solicitudes_cambio" ("solicitante_id");
    `);
        // ✅ 1 pendiente por programa_curso (evita spam / conflictos)
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_sc_programa_curso_pendiente"
      ON "solicitudes_cambio" ("programa_curso_id")
      WHERE estado = 'pendiente';
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_sc_programa_curso_pendiente";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sc_solicitante";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sc_programa_curso";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sc_curso";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_sc_estado";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "solicitudes_cambio";`);
    }
}
exports.AddSolicitudesCambio1731000006000 = AddSolicitudesCambio1731000006000;
//# sourceMappingURL=1731000006000-AddSolicitudesCambio.js.map