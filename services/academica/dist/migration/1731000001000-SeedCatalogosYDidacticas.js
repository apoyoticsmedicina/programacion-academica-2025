"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedCatalogosYDidacticas1731000001000 = void 0;
class SeedCatalogosYDidacticas1731000001000 {
    constructor() {
        this.name = "SeedCatalogosYDidacticas1731000001000";
    }
    async up(queryRunner) {
        await queryRunner.query(`
      INSERT INTO caracteristicas_curso (caracteristicas) VALUES
        ('validable'), ('habilitable'), ('clasificable'), ('evaluacion de suficiencia')
      ON CONFLICT DO NOTHING;
    `);
        await queryRunner.query(`
      INSERT INTO tipos_curso (tipo) VALUES
        ('obligatoria'), ('electiva')
      ON CONFLICT DO NOTHING;
    `);
        await queryRunner.query(`
      INSERT INTO clases_curso (clase) VALUES
        ('basico'), ('profesional'), ('complementario')
      ON CONFLICT DO NOTHING;
    `);
        await queryRunner.query(`
      INSERT INTO modalidades_curso (modalidad) VALUES
        ('presencial'),
        ('virtual'),
        ('semipresencial'),
        ('asistido totalmente por tic'),
        ('asistido parcialmente por tic'),
        ('a distancia'),
        ('espejo'),
        ('intensivo'),
        ('otro')
      ON CONFLICT DO NOTHING;
    `);
        await queryRunner.query(`
      INSERT INTO estrategias_didacticas (estrategia) VALUES
        ('aprendizaje basado en problemas (abp)'),
        ('aprendizaje orientado a proyectos (aop)'),
        ('aprendizaje basado en retos (abr)'),
        ('estudio de caso'),
        ('aprendizaje entre pares'),
        ('aprendizaje invertido'),
        ('gamificacion o design thinking'),
        ('otro')
      ON CONFLICT DO NOTHING;
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM estrategias_didacticas;`);
        await queryRunner.query(`DELETE FROM modalidades_curso;`);
        await queryRunner.query(`DELETE FROM clases_curso;`);
        await queryRunner.query(`DELETE FROM tipos_curso;`);
        await queryRunner.query(`DELETE FROM caracteristicas_curso;`);
    }
}
exports.SeedCatalogosYDidacticas1731000001000 = SeedCatalogosYDidacticas1731000001000;
//# sourceMappingURL=1731000001000-SeedCatalogosYDidacticas.js.map