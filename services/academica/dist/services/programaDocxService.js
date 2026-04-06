"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramaDocxService = void 0;
// src/services/programaDocxService.ts
const fs = __importStar(require("fs"));
const pizzip_1 = __importDefault(require("pizzip"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
const expressions_js_1 = __importDefault(require("docxtemplater/expressions.js"));
const data_source_1 = require("../config/data-source");
const env_1 = require("../config/env");
const ProgramaCurso_1 = require("../entities/ProgramaCurso");
const PlanDeEstudioCurso_1 = require("../entities/PlanDeEstudioCurso");
class ProgramaDocxService {
    static reloadTemplate() {
        ProgramaDocxService.TEMPLATE_BIN = fs.readFileSync(ProgramaDocxService.TEMPLATE_PATH, 'binary');
    }
    static enableDevWatch() {
        if (!env_1.env.docx.enableWatch)
            return;
        fs.watch(ProgramaDocxService.TEMPLATE_PATH, { persistent: false }, () => {
            try {
                ProgramaDocxService.reloadTemplate();
                console.log('[template] recargada');
            }
            catch (e) {
                console.error('[template] error recargando:', e);
            }
        });
    }
    static async getPayloadForDebug(id) {
        return await ProgramaDocxService.buildPayloadFromProgramaCursoId(id);
    }
    static async buildPayloadFromProgramaCursoId(id) {
        const repo = data_source_1.AppDataSource.getRepository(ProgramaCurso_1.ProgramaCurso);
        const pc = await repo
            .createQueryBuilder('pc')
            .leftJoinAndSelect('pc.planCurso', 'pec')
            .leftJoinAndSelect('pec.plan', 'plan')
            .leftJoinAndSelect('plan.programa', 'progPrincipal')
            .leftJoinAndSelect('pec.curso', 'c')
            .leftJoinAndSelect('pec.tipo', 'tipo')
            .leftJoinAndSelect('pc.clase', 'cl')
            .leftJoinAndSelect('pc.modalidad', 'mo')
            .leftJoinAndSelect('pc.caracteristicas', 'car')
            .leftJoinAndSelect('pc.horas', 'hc')
            .leftJoinAndSelect('pc.metodologia', 'pm')
            .leftJoinAndSelect('pc.estrategiasMetodologicas', 'pme')
            .leftJoinAndSelect('pme.estrategia', 'ed')
            .leftJoinAndSelect('pc.evaluaciones', 'pe')
            .leftJoinAndSelect('pc.docentes', 'pd')
            .leftJoinAndSelect('pd.docente', 'd')
            .leftJoinAndSelect('pc.requisitos', 'req')
            .leftJoinAndSelect('req.requisito', 'reqc')
            .leftJoinAndSelect('pc.bibliografia', 'bib')
            .where('pc.id = :id', { id })
            .getOne();
        if (!pc) {
            const err = new Error('ProgramaCurso no encontrado');
            err.status = 404;
            throw err;
        }
        const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0);
        const toCodeName = (r) => {
            const cod = r?.requisito?.codigo ?? r?.requisito?.codigoMares ?? '';
            const nom = r?.requisito?.nombre ?? '';
            return [cod, nom].filter(Boolean).join(' - ');
        };
        const prereqRows = (pc.requisitos || []).filter((r) => (r.tipo ?? '').toLowerCase() === 'prerrequisito');
        const coreqRows = (pc.requisitos || []).filter((r) => (r.tipo ?? '').toLowerCase() === 'correquisito');
        // ====== Programas (pertenencia / oferta) ======
        let programaPertenencia = '';
        let programasOferta = '';
        const planCurso = pc.planCurso;
        const planActual = planCurso?.plan;
        const programaActual = planActual?.programa;
        const nombreProgramaActual = programaActual?.nombre ?? '';
        programaPertenencia = nombreProgramaActual;
        const cursoId = planCurso?.curso?.id;
        if (cursoId) {
            const pecRepo = data_source_1.AppDataSource.getRepository(PlanDeEstudioCurso_1.PlanEstudioCurso);
            const otrosPecs = await pecRepo
                .createQueryBuilder('pec')
                .leftJoinAndSelect('pec.plan', 'plan2')
                .leftJoinAndSelect('plan2.programa', 'prog2')
                .where('pec.curso_id = :cursoId', { cursoId })
                .getMany();
            const todosLosProgramas = otrosPecs
                .map((p) => p.plan?.programa?.nombre)
                .filter((n) => !!n);
            const oferta = todosLosProgramas.filter((n) => !nombreProgramaActual || n !== nombreProgramaActual);
            programasOferta = oferta.join(' / ');
        }
        const car = pc.caracteristicas;
        const caracteristicasCurso = car && typeof car.caracteristicas === 'string'
            ? car.caracteristicas
            : [
                car?.validable ? 'Validable' : '',
                car?.habilitable ? 'Habilitable' : '',
                car?.clasificable ? 'Clasificable' : '',
                car?.evalSuficiencia ? 'Evaluación de suficiencia' : '',
            ]
                .filter(Boolean)
                .join(' · ');
        const info = {
            unidadAcademica: pc.unidad_academica ?? '',
            programaPertenencia,
            programasOferta,
            vigencia: pc.vigencia ?? '',
            codigoCurso: pc.planCurso?.curso?.codigo ??
                pc.planCurso?.curso?.codigoMares ??
                '',
            nombreCurso: pc.planCurso?.curso?.nombre ?? '',
            tipoCurso: pc.planCurso?.tipo?.tipo ?? '',
            claseCurso: pc.clase?.clase ?? pc.clase?.nombre ?? '',
            modalidad: pc.modalidad?.modalidad ??
                pc.modalidad?.nombre ??
                '',
            areaCurricular: pc.nucleo_curso ?? '',
            prerequisitos: prereqRows.map(toCodeName).filter(Boolean),
            corequisitos: coreqRows.map(toCodeName).filter(Boolean),
            caracteristicasCurso,
        };
        const carga = {
            creditos: Number(pc.creditos ?? 0),
            hSemEP: sum((pc.horas || []).map((h) => h.h_semanales_p_e)),
            hSemInd: sum((pc.horas || []).map((h) => h.h_semanales_t_i)),
            hSemTeo: sum((pc.horas || []).map((h) => h.h_semanales_a_a_t)),
            hSemPrac: sum((pc.horas || []).map((h) => h.h_semanales_a_a_p)),
            hSemTeoPrac: sum((pc.horas || []).map((h) => h.h_semanales_a_a_t_p)),
            hTotales: sum((pc.horas || []).map((h) => h.h_totales_curso)),
        };
        const perfil = { relacion: pc.perfil ?? '' };
        const intencionalidades = {
            texto: pc.intencionalidadesFormativas ?? '',
        };
        const aportes = { texto: pc.aportesCursoFormacion ?? '' };
        const saberes = { descripcion: pc.descripcionConocimientos ?? '' };
        const estrategiasItems = (pc.estrategiasMetodologicas ?? [])
            .map((e) => e.estrategia?.estrategia)
            .filter(Boolean);
        const metodologiaRegistros = pc.metodologia ?? [];
        const metodologia = {
            estrategias: estrategiasItems.join('; '),
            recursos: metodologiaRegistros
                .map((m) => m.mediosYRecursos)
                .filter(Boolean)
                .join('\n'),
            interaccion: metodologiaRegistros
                .map((m) => m.formasInteraccion)
                .filter(Boolean)
                .join('\n'),
            internacionalizacion: metodologiaRegistros
                .map((m) => m.estrategiasInternacionalizacion)
                .filter(Boolean)
                .join('\n'),
            genero: metodologiaRegistros
                .map((m) => m.estrategiasEnfoque)
                .filter(Boolean)
                .join('\n'),
        };
        const evaluacion = {
            concepcion: '',
            procesos: '',
            momentos: (pc.evaluaciones || [])
                .map((e) => ({
                momento: e.momentosEvaluacion,
                porcentaje: typeof e.porcentaje === 'number'
                    ? `${e.porcentaje.toFixed(2)}`
                    : String(e.porcentaje ?? ''),
            }))
                .filter((r) => r.momento || r.porcentaje),
        };
        const comunidad = (pc.docentes || [])
            .map((pd) => {
            const d = pd.docente;
            const nombre = [d?.nombres ?? d?.nombre, d?.apellidos]
                .filter(Boolean)
                .join(' ');
            return {
                nombre: nombre || '',
                unidad: d.unidad_academica || 'Facultad de Medicina',
                formacion: '',
                porcentaje: typeof pd.porcentaje === 'number'
                    ? pd.porcentaje.toFixed(2)
                    : String(pd.porcentaje ?? ''),
            };
        })
            .filter((r) => r.nombre);
        const bibliografia = (pc.bibliografia || []).map((b) => {
            const cultura = b.cultura ?? '';
            const referencia = b.referencia ?? '';
            const palabrasClave = b.palabrasClave ?? b.palabras_clave ?? '';
            return {
                cultura,
                cultural: cultura,
                referencia,
                referencial: referencia,
                palabrasClave,
            };
        });
        return {
            info,
            carga,
            perfil,
            intencionalidades,
            aportes,
            saberes,
            metodologia,
            evaluacion,
            comunidad,
            bibliografia,
        };
    }
    static async renderDocxFromProgramaCursoId(id) {
        const data = await ProgramaDocxService.buildPayloadFromProgramaCursoId(id);
        console.log('[docx:data] nombre=%s, codigo=%s, creditos=%s', data.info?.nombreCurso, data.info?.codigoCurso, data.carga?.creditos);
        const zip = new pizzip_1.default(ProgramaDocxService.TEMPLATE_BIN);
        const parser = expressions_js_1.default.configure?.({}) ?? expressions_js_1.default;
        const doc = new docxtemplater_1.default(zip, {
            delimiters: { start: '[[', end: ']]' },
            parser,
            paragraphLoop: true,
            linebreaks: true,
            nullGetter() {
                return '';
            },
        });
        doc.render(data);
        return doc.getZip().generate({ type: 'nodebuffer' });
    }
}
exports.ProgramaDocxService = ProgramaDocxService;
// ⬇️ ahora viene de env.docx.programaTemplatePath
ProgramaDocxService.TEMPLATE_PATH = env_1.env.docx.programaTemplatePath;
ProgramaDocxService.TEMPLATE_BIN = fs.readFileSync(ProgramaDocxService.TEMPLATE_PATH, 'binary');
ProgramaDocxService.enableDevWatch();
//# sourceMappingURL=programaDocxService.js.map