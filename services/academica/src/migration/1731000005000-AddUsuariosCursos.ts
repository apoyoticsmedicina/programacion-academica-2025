import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsuariosCursos1731000005000 implements MigrationInterface {
    name = "AddUsuariosCursos1731000005000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "usuarios_cursos" (
        "id" SERIAL PRIMARY KEY,
        "usuario_id" int NOT NULL,
        "curso_id" int NOT NULL,
        "creado_en" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_uc_usuario" FOREIGN KEY ("usuario_id")
          REFERENCES "usuarios"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_uc_curso" FOREIGN KEY ("curso_id")
          REFERENCES "cursos"("id") ON DELETE RESTRICT,
        CONSTRAINT "UQ_uc_usuario_curso" UNIQUE ("usuario_id","curso_id")
      );
    `);

        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_uc_usuario" ON "usuarios_cursos" ("usuario_id");
    `);

        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_uc_curso" ON "usuarios_cursos" ("curso_id");
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_uc_curso";`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_uc_usuario";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "usuarios_cursos";`);
    }
}