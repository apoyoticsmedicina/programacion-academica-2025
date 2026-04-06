"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCodigoProgramaAcademico1731000002000 = void 0;
class AddCodigoProgramaAcademico1731000002000 {
    constructor() {
        this.name = "AddCodigoProgramaAcademico1731000002000";
    }
    async up(queryRunner) {
        // 1) Columna (como reinician BD, puede ser NOT NULL directo)
        await queryRunner.query(`
      ALTER TABLE "programas_academicos"
      ADD COLUMN "codigo" integer NOT NULL
    `);
        // 2) Unicidad
        await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_programas_academicos_codigo"
      ON "programas_academicos" ("codigo")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      DROP INDEX "public"."UQ_programas_academicos_codigo"
    `);
        await queryRunner.query(`
      ALTER TABLE "programas_academicos"
      DROP COLUMN "codigo"
    `);
    }
}
exports.AddCodigoProgramaAcademico1731000002000 = AddCodigoProgramaAcademico1731000002000;
//# sourceMappingURL=1731000002000-AddCodigoProgramaAcademico.js.map