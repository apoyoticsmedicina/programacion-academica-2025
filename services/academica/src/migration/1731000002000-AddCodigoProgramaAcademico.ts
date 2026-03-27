import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCodigoProgramaAcademico1731000002000 implements MigrationInterface {
    name = "AddCodigoProgramaAcademico1731000002000";

    public async up(queryRunner: QueryRunner): Promise<void> {
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DROP INDEX "public"."UQ_programas_academicos_codigo"
    `);

        await queryRunner.query(`
      ALTER TABLE "programas_academicos"
      DROP COLUMN "codigo"
    `);
    }
}
