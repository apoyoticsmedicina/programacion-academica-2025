// src/services/cronogramaExcelService.ts
import ExcelJS from 'exceljs';
import { AppDataSource } from '../config/data-source';

import { PlanEstudioCurso } from '../entities/PlanDeEstudioCurso';
import { ProgramaCurso } from '../entities/ProgramaCurso';
import { CronogramaGrupo } from '../entities/CronogramaGrupo';
import { CronogramaGrupoDocente } from '../entities/CronogramaGrupoDocente';
import { Docente } from '../entities/Docente';

type CronogramaRow = {
    programaNombre: string;
    tipoPrograma: string;
    planVersion: number | null;
    vigenciaPlan: string | null;

    codigoCurso: number | null;
    nombreCurso: string;
    creditos: number | null;
    vigenciaPrograma: string | null;

    nombreGrupo: string | null;
    docenteNombre: string | null;
    docenteVinculacion: string | null;
    docenteDocumento: number | null;
    horasDocente: number | null;
};

export class CronogramaExcelService {
    // ==========================
    // Construir filas desde la BD
    // ==========================
    static async buildRows(): Promise<CronogramaRow[]> {
        const pecRepo = AppDataSource.getRepository(PlanEstudioCurso);
        const pcRepo = AppDataSource.getRepository(ProgramaCurso);
        const grupoRepo = AppDataSource.getRepository(CronogramaGrupo);

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

        const rows: CronogramaRow[] = [];

        for (const pec of pecs) {
            const anyPec: any = pec;
            const plan: any = anyPec.plan;
            const programa: any = plan?.programa;
            const cohorte: any = plan?.cohorte;
            const curso: any = anyPec.curso;

            if (!curso || !plan || !programa) continue;

            const programaNombre: string = programa.nombre ?? '';
            const tipoPrograma: string =
                (programa.tipo || '').toLowerCase() === 'posgrado'
                    ? 'Posgrado'
                    : programa.tipo || 'Programa';

            // === numéricos "limpios" ===
            const planVersion: number | null = (() => {
                const raw = plan.version;
                if (raw === null || raw === undefined) return null;
                const n = Number(raw);
                return isNaN(n) ? null : n;
            })();

            const vigenciaPlan: string | null = cohorte?.periodo ?? null;

            // ===== Programa de curso principal de este PEC =====
            const pcList = await pcRepo
                .createQueryBuilder('pc')
                .leftJoinAndSelect('pc.horas', 'hc')
                .where('pc.id_plan_estudio_curso = :id', { id: pec.id })
                .getMany();

            const principal = pcList[0] || null;

            let creditos: number | null = null;
            let vigenciaPrograma: string | null = null;

            if (principal) {
                const anyPc: any = principal;
                const horas: any[] = anyPc.horas ?? [];

                // 1) primero, cred. del ProgramaCurso
                if (anyPc.creditos !== null && anyPc.creditos !== undefined) {
                    const c = Number(anyPc.creditos);
                    creditos = isNaN(c) ? null : c;
                }

                // 2) si no hay en pc.creditos, tratamos de leer de horas[0]
                if (creditos === null && horas.length) {
                    const h0 = horas[0];
                    const rawCred =
                        h0?.creditos_curso ??
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

            const cursoId: number = curso.id;

            // código de curso como número (si se puede)
            const codigoCurso: number | null = (() => {
                const raw = curso.codigo ?? curso.codigoMares ?? null;
                if (raw === null || raw === undefined || raw === '') return null;
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
                const anyGrupo: any = g;
                const vinculos: CronogramaGrupoDocente[] = anyGrupo.docentes || [];

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
                    const anyVd: any = vd;
                    const d: Docente | null = anyVd.docente ?? null;
                    const anyDoc: any = d ?? {};

                    const docenteNombre =
                        [anyDoc.nombres ?? anyDoc.nombre, anyDoc.apellidos]
                            .filter(Boolean)
                            .join(' ')
                            .trim() || null;

                    const docenteVinculacion =
                        (anyDoc.vinculacion ??
                            anyDoc.tipo_vinculacion ??
                            anyDoc.vinculacion_docente ??
                            null) || null;

                    const docenteDocumento: number | null = (() => {
                        const raw =
                            anyDoc.documento ??
                            anyDoc.numero_documento ??
                            anyDoc.num_documento ??
                            null;
                        if (raw === null || raw === undefined || raw === '') return null;
                        const n = Number(raw);
                        return isNaN(n) ? null : n;
                    })();

                    const horasDocente: number | null = (() => {
                        if (anyVd.horas === null || anyVd.horas === undefined) return null;
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
                        docenteVinculacion:
                            docenteVinculacion != null
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
    static async renderExcel(): Promise<Buffer> {
        const rows = await this.buildRows();

        const workbook = new ExcelJS.Workbook();
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
