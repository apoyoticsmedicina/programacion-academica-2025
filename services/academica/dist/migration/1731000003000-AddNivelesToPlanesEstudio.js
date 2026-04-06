"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNivelesToPlanesEstudio1731000003000 = void 0;
class AddNivelesToPlanesEstudio1731000003000 {
    constructor() {
        this.name = "AddNivelesToPlanesEstudio1731000003000";
    }
    async up(queryRunner) {
        // 1) Agregar columna niveles (entero)
        await queryRunner.query(`
      ALTER TABLE "planes_estudio"
      ADD COLUMN "niveles" integer
    `);
        // 2) Si existieran filas previas (por si acaso), setear un default razonable
        //    Ajusta 10/12/etc según tu caso
        await queryRunner.query(`
      UPDATE "planes_estudio"
      SET "niveles" = 10
      WHERE "niveles" IS NULL
    `);
        // 3) Enforce NOT NULL
        await queryRunner.query(`
      ALTER TABLE "planes_estudio"
      ALTER COLUMN "niveles" SET NOT NULL
    `);
        // 4) Constraint: debe ser positivo
        await queryRunner.query(`
      ALTER TABLE "planes_estudio"
      ADD CONSTRAINT "CHK_planes_estudio_niveles_pos"
      CHECK ("niveles" > 0)
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "planes_estudio"
      DROP CONSTRAINT IF EXISTS "CHK_planes_estudio_niveles_pos"
    `);
        await queryRunner.query(`
      ALTER TABLE "planes_estudio"
      DROP COLUMN IF EXISTS "niveles"
    `);
    }
}
exports.AddNivelesToPlanesEstudio1731000003000 = AddNivelesToPlanesEstudio1731000003000;
//# sourceMappingURL=1731000003000-AddNivelesToPlanesEstudio.js.map