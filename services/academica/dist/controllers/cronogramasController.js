"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronogramasController = void 0;
const cronogramasService_1 = require("../services/cronogramasService");
class CronogramasController {
    constructor() {
        /**
         * GET /cronogramas/curso/:cursoId
         * Devuelve los grupos y docentes de cronograma para ese curso.
         */
        this.getByCurso = async (req, res) => {
            try {
                const cursoId = Number(req.params.cursoId);
                if (Number.isNaN(cursoId) || cursoId <= 0) {
                    return res.status(400).json({ message: "cursoId inválido" });
                }
                const grupos = await cronogramasService_1.cronogramasService.getByCurso(cursoId);
                return res.json(grupos);
            }
            catch (err) {
                console.error("Error en GET /cronogramas/curso/:cursoId", err);
                return res.status(500).json({ message: "Error interno del servidor" });
            }
        };
        /**
         * PUT /cronogramas/curso/:cursoId
         * Reemplaza completamente los grupos del curso con los que vengan en el body.
         *
         * Body esperado:
         * {
         *   "grupos": [
         *     {
         *       "nombre": "Grupo 1",
         *       "docentes": [
         *         { "docenteId": 1, "horas": 8 },
         *         { "docenteId": 2, "horas": 4 }
         *       ]
         *     }
         *   ]
         * }
         */
        this.replaceForCurso = async (req, res) => {
            try {
                const cursoId = Number(req.params.cursoId);
                if (Number.isNaN(cursoId) || cursoId <= 0) {
                    return res.status(400).json({ message: "cursoId inválido" });
                }
                const gruposBody = (req.body?.grupos ?? []);
                if (!Array.isArray(gruposBody)) {
                    return res
                        .status(400)
                        .json({ message: "El payload debe incluir un arreglo 'grupos'" });
                }
                // Validación mínima / saneo
                const gruposSanitizados = gruposBody.map((g, i) => ({
                    nombre: g.nombre || `Grupo ${i + 1}`,
                    docentes: Array.isArray(g.docentes) ? g.docentes : [],
                }));
                const resultado = await cronogramasService_1.cronogramasService.replaceForCurso(cursoId, gruposSanitizados);
                return res.json(resultado);
            }
            catch (err) {
                console.error("Error en PUT /cronogramas/curso/:cursoId", err);
                return res.status(500).json({ message: "Error interno del servidor" });
            }
        };
    }
}
exports.CronogramasController = CronogramasController;
//# sourceMappingURL=cronogramasController.js.map