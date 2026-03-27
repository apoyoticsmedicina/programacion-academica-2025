// src/services/programaDocxService.ts
import * as fs from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import angularExpressions from 'docxtemplater/expressions.js';

import { AppDataSource } from '../config/data-source';
import { env } from '../config/env';
import { ProgramaCurso } from '../entities/ProgramaCurso';
import { ProgramaMetodologia } from '../entities/ProgramaMetodologia';
import { ProgramaMetodologiaEstrategia } from '../entities/ProgramaMetodologiaEstrategia';
import { ProgramaBibliografia } from '../entities/ProgramaBibliografia';
import { PlanEstudioCurso } from '../entities/PlanDeEstudioCurso';

export class ProgramaDocxService {
  // ⬇️ ahora viene de env.docx.programaTemplatePath
  private static TEMPLATE_PATH = env.docx.programaTemplatePath;
  private static TEMPLATE_BIN = fs.readFileSync(
    ProgramaDocxService.TEMPLATE_PATH,
    'binary',
  );

  private static reloadTemplate() {
    ProgramaDocxService.TEMPLATE_BIN = fs.readFileSync(
      ProgramaDocxService.TEMPLATE_PATH,
      'binary',
    );
  }

  static enableDevWatch() {
    if (!env.docx.enableWatch) return;

    fs.watch(
      ProgramaDocxService.TEMPLATE_PATH,
      { persistent: false },
      () => {
        try {
          ProgramaDocxService.reloadTemplate();
          console.log('[template] recargada');
        } catch (e) {
          console.error('[template] error recargando:', e);
        }
      },
    );
  }

  static async getPayloadForDebug(id: number) {
    return await ProgramaDocxService.buildPayloadFromProgramaCursoId(id);
  }

  static async buildPayloadFromProgramaCursoId(id: number) {
    const repo = AppDataSource.getRepository(ProgramaCurso);

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
      const err: any = new Error('ProgramaCurso no encontrado');
      err.status = 404;
      throw err;
    }

    const sum = (arr: number[]) =>
      arr.reduce((a, b) => a + (Number(b) || 0), 0);

    const toCodeName = (r: any) => {
      const cod = r?.requisito?.codigo ?? r?.requisito?.codigoMares ?? '';
      const nom = r?.requisito?.nombre ?? '';
      return [cod, nom].filter(Boolean).join(' - ');
    };

    const prereqRows = (pc.requisitos || []).filter(
      (r) => (r.tipo ?? '').toLowerCase() === 'prerrequisito',
    );
    const coreqRows = (pc.requisitos || []).filter(
      (r) => (r.tipo ?? '').toLowerCase() === 'correquisito',
    );

    // ====== Programas (pertenencia / oferta) ======
    let programaPertenencia = '';
    let programasOferta = '';

    const planCurso: any = (pc as any).planCurso;
    const planActual = planCurso?.plan;
    const programaActual = planActual?.programa;
    const nombreProgramaActual: string = programaActual?.nombre ?? '';

    programaPertenencia = nombreProgramaActual;

    const cursoId: number | undefined = planCurso?.curso?.id;

    if (cursoId) {
      const pecRepo = AppDataSource.getRepository(PlanEstudioCurso);

      const otrosPecs = await pecRepo
        .createQueryBuilder('pec')
        .leftJoinAndSelect('pec.plan', 'plan2')
        .leftJoinAndSelect('plan2.programa', 'prog2')
        .where('pec.curso_id = :cursoId', { cursoId })
        .getMany();

      const todosLosProgramas = (otrosPecs as any[])
        .map((p) => p.plan?.programa?.nombre as string | undefined)
        .filter((n): n is string => !!n);

      const oferta = todosLosProgramas.filter(
        (n) => !nombreProgramaActual || n !== nombreProgramaActual,
      );

      programasOferta = oferta.join(' / ');
    }

    const car: any = (pc as any).caracteristicas;
    const caracteristicasCurso =
      car && typeof car.caracteristicas === 'string'
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
      vigencia: (pc as any).vigencia ?? '',
      codigoCurso:
        (pc as any).planCurso?.curso?.codigo ??
        (pc as any).planCurso?.curso?.codigoMares ??
        '',
      nombreCurso: (pc as any).planCurso?.curso?.nombre ?? '',
      tipoCurso: (pc as any).planCurso?.tipo?.tipo ?? '',
      claseCurso: (pc as any).clase?.clase ?? (pc as any).clase?.nombre ?? '',
      modalidad:
        (pc as any).modalidad?.modalidad ??
        (pc as any).modalidad?.nombre ??
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
      .map(
        (e: ProgramaMetodologiaEstrategia) => e.estrategia?.estrategia,
      )
      .filter(Boolean) as string[];

    const metodologiaRegistros: ProgramaMetodologia[] =
      (pc as any).metodologia ?? [];

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
          porcentaje:
            typeof e.porcentaje === 'number'
              ? `${e.porcentaje.toFixed(2)}`
              : String(e.porcentaje ?? ''),
        }))
        .filter((r) => r.momento || r.porcentaje),
    };

    const comunidad = (pc.docentes || [])
      .map((pd) => {
        const d = pd.docente as any;
        const nombre = [d?.nombres ?? d?.nombre, d?.apellidos]
          .filter(Boolean)
          .join(' ');
        return {
          nombre: nombre || '',
          unidad: d.unidad_academica || 'Facultad de Medicina',
          formacion: '',
          porcentaje:
            typeof (pd as any).porcentaje === 'number'
              ? (pd as any).porcentaje.toFixed(2)
              : String((pd as any).porcentaje ?? ''),
        };
      })
      .filter((r) => r.nombre);

    const bibliografia = (pc.bibliografia || []).map(
      (b: ProgramaBibliografia) => {
        const cultura = (b as any).cultura ?? '';
        const referencia = (b as any).referencia ?? '';
        const palabrasClave =
          (b as any).palabrasClave ?? (b as any).palabras_clave ?? '';

        return {
          cultura,
          cultural: cultura,
          referencia,
          referencial: referencia,
          palabrasClave,
        };
      },
    );

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

  static async renderDocxFromProgramaCursoId(id: number): Promise<Buffer> {
    const data = await ProgramaDocxService.buildPayloadFromProgramaCursoId(id);

    console.log(
      '[docx:data] nombre=%s, codigo=%s, creditos=%s',
      data.info?.nombreCurso,
      data.info?.codigoCurso,
      data.carga?.creditos,
    );

    const zip = new PizZip(ProgramaDocxService.TEMPLATE_BIN);

    const parser = angularExpressions.configure?.({}) ?? angularExpressions;

    const doc = new Docxtemplater(zip, {
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

ProgramaDocxService.enableDevWatch();
