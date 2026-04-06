"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/controllers/catalogosController.ts
const express_1 = require("express");
const data_source_1 = require("../config/data-source");
// Entidades actuales
const CaracteristicasCurso_1 = require("../entities/CaracteristicasCurso");
const ClaseCurso_1 = require("../entities/ClaseCurso");
const ModalidadCurso_1 = require("../entities/ModalidadCurso");
const TipoCurso_1 = require("../entities/TipoCurso");
// Estrategia Didáctica (usa campo `estrategia`)
const EstrategiaDidactica_1 = require("../entities/EstrategiaDidactica");
const router = (0, express_1.Router)();
/** Características del curso */
router.get('/catalogos/caracteristicas-curso', async (_req, res) => {
    const repo = data_source_1.AppDataSource.getRepository(CaracteristicasCurso_1.CaracteristicasCurso);
    const items = await repo.find({ order: { id: 'ASC' } });
    res.json({ items });
});
/** Clases del curso */
router.get('/catalogos/clases-curso', async (_req, res) => {
    const repo = data_source_1.AppDataSource.getRepository(ClaseCurso_1.ClaseCurso);
    const items = await repo.find({ order: { id: 'ASC' } });
    res.json({ items });
});
/** Modalidades del curso */
router.get('/catalogos/modalidades-curso', async (_req, res) => {
    const repo = data_source_1.AppDataSource.getRepository(ModalidadCurso_1.ModalidadCurso);
    const items = await repo.find({ order: { id: 'ASC' } });
    res.json({ items });
});
/** Tipos de curso */
router.get('/catalogos/tipos-curso', async (_req, res) => {
    const repo = data_source_1.AppDataSource.getRepository(TipoCurso_1.TipoCurso);
    const items = await repo.find({ order: { id: 'ASC' } });
    res.json({ items });
});
/** Estrategias didácticas (según entidad con campo `estrategia`) */
router.get('/catalogos/estrategias-didacticas', async (_req, res) => {
    const repo = data_source_1.AppDataSource.getRepository(EstrategiaDidactica_1.EstrategiaDidactica);
    // Selecciona sólo los campos que necesitas (id, estrategia)
    const items = await repo.find({
        select: {
            id: true,
            estrategia: true,
        },
        order: { estrategia: 'ASC' },
    });
    res.json({ items });
});
exports.default = router;
//# sourceMappingURL=catalogosController.js.map