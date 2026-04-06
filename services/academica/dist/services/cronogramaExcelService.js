"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronogramaExcelService = void 0;
// src/services/cronogramaExcelService.ts
const exceljs_1 = __importDefault(require("exceljs"));
const data_source_1 = require("../config/data-source");
const PlanDeEstudioCurso_1 = require("../entities/PlanDeEstudioCurso");
const ProgramaCurso_1 = require("../entities/ProgramaCurso");
const CronogramaGrupo_1 = require("../entities/CronogramaGrupo");
class CronogramaExcelService {
    // ==========================
    // Construir filas desde la BD
    // ==========================
    static async buildRows() {
        const pecRepo = data_source_1.AppDataSource.getRepository(PlanDeEstudioCurso_1.PlanEstudioCurso);
        const pcRepo = data_source_1.AppDataSource.getRepository(ProgramaCurso_1.ProgramaCurso);
        const grupoRepo = data_source_1.AppDataSource.getRepository(CronogramaGrupo_1.CronogramaGrupo);
        // Traemos TODOS los PEC con plan, programa, cohorte y curso
        const pecs = await pecRepo
            .createQueryBuilder('pec')
            .leftJoinAndSelect('pec.plan', 'plan')
            .leftJoinAndSelect('plan.programa', 'prog')
            .leftJoinAndSelect('plan.cohorte', 'cohorte')
            .leftJoinAndSelect('pec.curso', 'curso')
            .orderBy('prog.id', 'ASC')
            .addOrderBy('plan.id', 'ASC')
            .addOrderBy('pec.orden', 'ASC')
            .getMany();
        const rows = [];
        for (const pec of pecs) {
            const anyPec = pec;
            const plan = anyPec.plan;
            const programa = plan?.programa;
            const cohorte = plan?.cohorte;
            const curso = anyPec.curso;
            if (!curso || !plan || !programa)
                continue;
            const programaNombre = programa.nombre ?? '';
            const tipoPrograma = (programa.tipo || '').toLowerCase() === 'posgrado'
                ? 'Posgrado'
                : programa.tipo || 'Programa';
            // === numéricos "limpios" ===
            const planVersion = (() => {
                const raw = plan.version;
                if (raw === null || raw === undefined)
                    return null;
                const n = Number(raw);
                return isNaN(n) ? null : n;
            })();
            const vigenciaPlan = cohorte?.periodo ?? null;
            // ===== Programa de curso principal de este PEC =====
            const pcList = await pcRepo
                .createQueryBuilder('pc')
                .leftJoinAndSelect('pc.horas', 'hc')
                .where('pc.id_plan_estudio_curso = :id', { id: pec.id })
                .getMany();
            const principal = pcList[0] || null;
            let creditos = null;
            let vigenciaPrograma = null;
            if (principal) {
                const anyPc = principal;
                const horas = anyPc.horas ?? [];
                // 1) primero, cred. del ProgramaCurso
                if (anyPc.creditos !== null && anyPc.creditos !== undefined) {
                    const c = Number(anyPc.creditos);
                    creditos = isNaN(c) ? null : c;
                }
                // 2) si no hay en pc.creditos, tratamos de leer de horas[0]
                if (creditos === null && horas.length) {
                    const h0 = horas[0];
                    const rawCred = h0?.creditos_curso ??
                        h0?.creditosCurso ??
                        null;
                    if (rawCred !== null && rawCred !== undefined) {
                        const c = Number(rawCred);
                        creditos = isNaN(c) ? null : c;
                    }
                }
                vigenciaPrograma =
                    anyPc.vigencia ?? anyPc.semestre_vigencia ?? null;
            }
            const cursoId = curso.id;
            // código de curso como número (si se puede)
            const codigoCurso = (() => {
                const raw = curso.codigo ?? curso.codigoMares ?? null;
                if (raw === null || raw === undefined || raw === '')
                    return null;
                const n = Number(raw);
                return isNaN(n) ? null : n;
            })();
            // ===== Grupos de cronograma del curso (con docentes) =====
            const grupos = await grupoRepo.find({
                where: { cursoId },
                relations: ['docentes', 'docentes.docente'],
            });
            // Sin grupos: fila “vacía”
            if (!grupos.length) {
                rows.push({
                    programaNombre,
                    tipoPrograma,
                    planVersion,
                    vigenciaPlan,
                    codigoCurso,
                    nombreCurso: curso.nombre ?? '',
                    creditos,
                    vigenciaPrograma,
                    nombreGrupo: null,
                    docenteNombre: null,
                    docenteVinculacion: null,
                    docenteDocumento: null,
                    horasDocente: null,
                });
                continue;
            }
            for (const g of grupos) {
                const anyGrupo = g;
                const vinculos = anyGrupo.docentes || [];
                // Grupo sin docentes
                if (!vinculos.length) {
                    rows.push({
                        programaNombre,
                        tipoPrograma,
                        planVersion,
                        vigenciaPlan,
                        codigoCurso,
                        nombreCurso: curso.nombre ?? '',
                        creditos,
                        vigenciaPrograma,
                        nombreGrupo: g.nombre,
                        docenteNombre: null,
                        docenteVinculacion: null,
                        docenteDocumento: null,
                        horasDocente: null,
                    });
                    continue;
                }
                // Una fila por docente
                for (const vd of vinculos) {
                    const anyVd = vd;
                    const d = anyVd.docente ?? null;
                    const anyDoc = d ?? {};
                    const docenteNombre = [anyDoc.nombres ?? anyDoc.nombre, anyDoc.apellidos]
                        .filter(Boolean)
                        .join(' ')
                        .trim() || null;
                    const docenteVinculacion = (anyDoc.vinculacion ??
                        anyDoc.tipo_vinculacion ??
                        anyDoc.vinculacion_docente ??
                        null) || null;
                    const docenteDocumento = (() => {
                        const raw = anyDoc.documento ??
                            anyDoc.numero_documento ??
                            anyDoc.num_documento ??
                            null;
                        if (raw === null || raw === undefined || raw === '')
                            return null;
                        const n = Number(raw);
                        return isNaN(n) ? null : n;
                    })();
                    const horasDocente = (() => {
                        if (anyVd.horas === null || anyVd.horas === undefined)
                            return null;
                        const n = Number(anyVd.horas);
                        return isNaN(n) ? null : n;
                    })();
                    rows.push({
                        programaNombre,
                        tipoPrograma,
                        planVersion,
                        vigenciaPlan,
                        codigoCurso,
                        nombreCurso: curso.nombre ?? '',
                        creditos,
                        vigenciaPrograma,
                        nombreGrupo: g.nombre,
                        docenteNombre,
                        docenteVinculacion: docenteVinculacion != null
                            ? String(docenteVinculacion).trim()
                            : null,
                        docenteDocumento,
                        horasDocente,
                    });
                }
            }
        }
        return rows;
    }
    // ==========================
    // Generar Excel (Buffer)
    // ==========================
    static async renderExcel() {
        const rows = await this.buildRows();
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet('Cronogramas');
        sheet.columns = [
            { header: 'Programa', key: 'programaNombre', width: 30 },
            { header: 'Tipo programa', key: 'tipoPrograma', width: 15 },
            { header: 'Plan', key: 'planVersion', width: 10 },
            { header: 'Vigencia plan', key: 'vigenciaPlan', width: 18 },
            { header: 'Código curso', key: 'codigoCurso', width: 15 },
            { header: 'Curso', key: 'nombreCurso', width: 40 },
            { header: 'Créditos', key: 'creditos', width: 10 },
            { header: 'Vigencia programa', key: 'vigenciaPrograma', width: 18 },
            { header: 'Grupo', key: 'nombreGrupo', width: 15 },
            { header: 'Docente', key: 'docenteNombre', width: 30 },
            { header: 'Vinculación', key: 'docenteVinculacion', width: 20 },
            { header: 'Documento', key: 'docenteDocumento', width: 18 },
            { header: 'Horas docente', key: 'horasDocente', width: 14 },
        ];
        sheet.addRows(rows);
        // Cabecera en negrilla y centrada
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
exports.CronogramaExcelService = CronogramaExcelService;
//# sourceMappingURL=cronogramaExcelService.js.map