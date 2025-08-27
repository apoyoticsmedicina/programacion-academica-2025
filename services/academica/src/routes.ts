import { Router } from 'express';
import { ProgramasController } from './controllers/programasController';
import { CursoController } from './controllers/cursoController';
import { CronogramaController } from './controllers/cronogramaCrontroller';
import { PlanEstudioController } from './controllers/planEstudioController';
import { RegistroPlanEstudioController } from './controllers/registroPlanEstudioController';
import { PlanEstudioCursoController } from './controllers/planEstudioCursoController';
import { CursoRequisitoController } from './controllers/cursoRequisitoController';
import { DocenteController } from './controllers/docenteController';
import { CursoDocenteController } from './controllers/cursoDocenteController';
import { CursoDetalleController } from './controllers/cursoDetalleController';
import { SolicitudCambioController } from './controllers/solicitudCambioController';

const router = Router();
const progCtrl = new ProgramasController();
const cursosCtrl   = new CursoController();
const cronCtrl = new CronogramaController();
const peCtrl = new PlanEstudioController();
const rpCtrl = new RegistroPlanEstudioController();
const pecCtrl = new PlanEstudioCursoController();
const crCtrl = new CursoRequisitoController();
const docCtrl = new DocenteController();
const cdocCtrl = new CursoDocenteController();
const cdetCtrl = new CursoDetalleController();
const scCtrl = new SolicitudCambioController();


// /programas
router.get('/programas', progCtrl.getAll);
router.get('/programas/:id', progCtrl.getById);
router.post('/programas', progCtrl.create);
router.delete('/programas/:id', progCtrl.remove);

// Cursos
router.get   ('/cursos',           cursosCtrl.getAll);
router.get   ('/cursos/:id',       cursosCtrl.getById);
router.post  ('/cursos',           cursosCtrl.create);
router.patch ('/cursos/:id',       cursosCtrl.update);
router.delete('/cursos/:id',       cursosCtrl.remove);

// Cronograma
router.get('/cronogramas', cronCtrl.getAll);
router.get('/cronogramas/:id', cronCtrl.getById);
router.post('/cronogramas', cronCtrl.create);
router.patch('/cronogramas/:id', cronCtrl.update);
router.delete('/cronogramas/:id', cronCtrl.remove);

// PlanEstudio
router.get('/planes-estudio', peCtrl.getAll);
router.get('/planes-estudio/:id', peCtrl.getById);
router.post('/planes-estudio', peCtrl.create);
router.patch('/planes-estudio/:id', peCtrl.update);
router.delete('/planes-estudio/:id', peCtrl.remove);

// RegistroPlanEstudio
router.get('/registro-plan', rpCtrl.getAll);
router.get('/registro-plan/:id', rpCtrl.getById);
router.post('/registro-plan', rpCtrl.create);
router.patch('/registro-plan/:id', rpCtrl.update);
router.delete('/registro-plan/:id', rpCtrl.remove);

// PlanEstudioCurso (composite key)
router.get('/plan-estudio-cursos', pecCtrl.getAll);
router.get('/plan-estudio-cursos/:planId/:cursoId', pecCtrl.getByIds);
router.post('/plan-estudio-cursos', pecCtrl.create);
router.patch('/plan-estudio-cursos/:planId/:cursoId', pecCtrl.update);
router.delete('/plan-estudio-cursos/:planId/:cursoId', pecCtrl.remove);

// CursoRequisito (composite key)
router.get('/curso-requisitos', crCtrl.getAll);
router.get('/curso-requisitos/:cursoId/:reqId', crCtrl.getByIds);
router.post('/curso-requisitos', crCtrl.create);
router.patch('/curso-requisitos/:cursoId/:reqId', crCtrl.update);
router.delete('/curso-requisitos/:cursoId/:reqId', crCtrl.remove);

// Docentes
router.get('/docentes', docCtrl.getAll);
router.get('/docentes/:id', docCtrl.getById);
router.post('/docentes', docCtrl.create);
router.patch('/docentes/:id', docCtrl.update);
router.delete('/docentes/:id', docCtrl.remove);

// Cursos ↔ Docentes (composite key)
router.get('/cursos-docentes', cdocCtrl.getAll);
router.get('/cursos-docentes/curso/:cursoId', cdocCtrl.getByCurso);
router.get('/cursos-docentes/docente/:docenteId', cdocCtrl.getByDocente);
router.get('/cursos-docentes/:cursoId/:docenteId', cdocCtrl.getByIds);
router.post('/cursos-docentes', cdocCtrl.create);
router.patch('/cursos-docentes/:cursoId/:docenteId', cdocCtrl.update);
router.delete('/cursos-docentes/:cursoId/:docenteId', cdocCtrl.remove);

// Curso Detalle (1:1 con curso)
router.get('/curso-detalle', cdetCtrl.getAll);
router.get('/curso-detalle/:id', cdetCtrl.getById);
router.get('/curso-detalle/curso/:cursoId', cdetCtrl.getByCurso);
router.post('/curso-detalle', cdetCtrl.create);
router.patch('/curso-detalle/:id', cdetCtrl.update);
router.delete('/curso-detalle/:id', cdetCtrl.remove);

// Solicitudes de cambio
router.get('/solicitudes-cambio', scCtrl.getAll);
router.get('/solicitudes-cambio/:id', scCtrl.getById);
router.post('/solicitudes-cambio', scCtrl.create);
router.patch('/solicitudes-cambio/:id', scCtrl.update);
router.delete('/solicitudes-cambio/:id', scCtrl.remove);

export default router;
