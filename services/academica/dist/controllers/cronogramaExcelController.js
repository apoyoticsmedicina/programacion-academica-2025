"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronogramaExcelController = void 0;
const cronogramaExcelService_1 = require("../services/cronogramaExcelService");
class CronogramaExcelController {
    async export(req, res) {
        console.time('[excel-cronogramas]');
        console.log('[excel-cronogramas] start');
        try {
            const buf = await cronogramaExcelService_1.CronogramaExcelService.renderExcel();
            console.timeLog('[excel-cronogramas]', 'render ok');
            if (!buf || !buf.length) {
                res.status(204).send();
                console.timeEnd('[excel-cronogramas]');
                return;
            }
            const filename = 'Cronogramas.xlsx';
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', String(buf.length));
            res.status(200).send(buf);
            console.timeEnd('[excel-cronogramas]');
        }
        catch (e) {
            console.error('[excel-cronogramas] error:', e);
            res.status(500).json({
                message: 'Error generando Excel de cronogramas',
                details: e?.message ?? e,
            });
        }
    }
}
exports.CronogramaExcelController = CronogramaExcelController;
//# sourceMappingURL=cronogramaExcelController.js.map