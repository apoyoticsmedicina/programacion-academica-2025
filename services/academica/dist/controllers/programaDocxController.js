"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramaDocxController = void 0;
const programaDocxService_1 = require("../services/programaDocxService");
const env_1 = require("../config/env");
class ProgramaDocxController {
    static async generate(req, res) {
        const id = Number(req.params.id);
        const debugRequested = String(req.query.debug || '') === '1';
        const debug = debugRequested && env_1.env.docx.allowDebug;
        console.time(`[docx] ${id}`);
        console.log(`[docx] start id=${id}`);
        try {
            const payload = await programaDocxService_1.ProgramaDocxService.buildPayloadFromProgramaCursoId(id);
            console.timeLog(`[docx] ${id}`, 'buildPayload');
            // Solo permitimos debug si lo habilita la config
            if (debug) {
                res.status(200).json({
                    ok: true,
                    id,
                    payload,
                });
                console.timeEnd(`[docx] ${id}`);
                return;
            }
            const buf = await programaDocxService_1.ProgramaDocxService.renderDocxFromProgramaCursoId(id);
            console.timeLog(`[docx] ${id}`, 'render ok');
            const filename = `ProgramaOficialCurso-${id}.docx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', String(buf.length));
            res.status(200).send(buf);
            console.timeEnd(`[docx] ${id}`);
        }
        catch (e) {
            const details = e?.properties?.errors || e?.properties || e?.message || e;
            console.error('[docx] error:', details);
            res.status(e?.status || 500).json({
                message: 'Error generando DOCX',
                details,
            });
        }
    }
}
exports.ProgramaDocxController = ProgramaDocxController;
//# sourceMappingURL=programaDocxController.js.map