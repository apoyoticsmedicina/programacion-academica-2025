import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNivelesToPlanesEstudio1731000003000 implements MigrationInterface {
    name = "AddNivelesToPlanesEstudio1731000003000";

    public async up(queryRunner: QueryRunner): Promise<void> {
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

    public async down(queryRunner: QueryRunner): Promise<void> {
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
