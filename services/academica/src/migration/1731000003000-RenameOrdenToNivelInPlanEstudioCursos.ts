import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameOrdenToNivelInPlanEstudioCursos1731000003000 implements MigrationInterface {
    name = 'RenameOrdenToNivelInPlanEstudioCursos1731000003000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Si existe 'orden', renómbrala a 'nivel'
        await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name='plan_estudio_cursos'
            AND column_name='orden'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name='plan_estudio_cursos'
            AND column_name='nivel'
        ) THEN
          ALTER TABLE plan_estudio_cursos RENAME COLUMN orden TO nivel;
        END IF;
      END $$;
    `);

        // Opcional: asegurar tipo int (por si venía raro)
        await queryRunner.query(`
      ALTER TABLE plan_estudio_cursos
      ALTER COLUMN nivel TYPE integer
      USING nivel::integer;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir: nivel -> orden
        await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name='plan_estudio_cursos'
            AND column_name='nivel'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name='plan_estudio_cursos'
            AND column_name='orden'
        ) THEN
          ALTER TABLE plan_estudio_cursos RENAME COLUMN nivel TO orden;
        END IF;
      END $$;
    `);
    }
}
