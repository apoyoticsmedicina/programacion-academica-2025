import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEstadosServidor1731000004000 implements MigrationInterface {
    name = "AddEstadosServidor1731000004000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1) Crear tabla (si no existe) con franja de tiempo
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "estados_servidor" (
        "id" SERIAL PRIMARY KEY,
        "estado" varchar(100) NOT NULL UNIQUE,
        "activo" boolean NOT NULL DEFAULT false,
        "activo_desde" timestamptz NULL,
        "activo_hasta" timestamptz NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);

        // 2) Idempotencia por si existía la tabla sin las columnas nuevas
        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='estados_servidor' AND column_name='activo_desde'
        ) THEN
          ALTER TABLE "estados_servidor" ADD COLUMN "activo_desde" timestamptz NULL;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='estados_servidor' AND column_name='activo_hasta'
        ) THEN
          ALTER TABLE "estados_servidor" ADD COLUMN "activo_hasta" timestamptz NULL;
        END IF;
      END $$;
    `);

        // 3) Solo 1 activo=true al tiempo (Postgres: índice único parcial)
        await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_estados_servidor_activo_true"
      ON "estados_servidor" ((activo))
      WHERE activo = true;
    `);

        // 4) Seed catálogo inicial
        //    - 'idle (lectura)' queda activo por defecto
        await queryRunner.query(`
      INSERT INTO "estados_servidor" ("estado", "activo", "activo_desde", "activo_hasta") VALUES
        ('idle (lectura)', true,  NULL, NULL),
        ('solicitudes de cambio', false, NULL, NULL),
        ('revisiones', false, NULL, NULL),
        ('cronogramas', false, NULL, NULL)
      ON CONFLICT ("estado") DO NOTHING;
    `);

        // 5) Si por lo que sea hubiese más de un activo (corridas previas), forzar preferencia a 'idle (lectura)'
        await queryRunner.query(`
      WITH preferred AS (
        SELECT id
        FROM "estados_servidor"
        WHERE estado = 'idle (lectura)'
        ORDER BY id ASC
        LIMIT 1
      )
      UPDATE "estados_servidor"
      SET activo = CASE WHEN id = (SELECT id FROM preferred) THEN true ELSE false END
      WHERE id = (SELECT id FROM preferred)
         OR activo = true;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_estados_servidor_activo_true";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "estados_servidor";`);
    }
}