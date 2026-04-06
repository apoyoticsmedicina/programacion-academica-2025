import { Router } from 'express';
import { requireAuth } from './middlewares/requireAuth';
import { requireRole } from './middlewares/requireRole';

import { ProgramasController } from './controllers/programasController';
import { CursoController } from './controllers/cursoController';
import { PlanEstudioController } from './controllers/planEstudioController';
import { PlanEstudioCursoController } from './controllers/planEstudioCursoController';
import { DocenteController } from './controllers/docenteController';
import { ProgramaDocenteController } from './controllers/programaDocenteController';
import { CohorteController } from './controllers/cohorteController';
import { ProgramaCursoController } from './controllers/programaCursoController';
import { ProgramaCursoRequisitoController } from './controllers/programaCursoRequisitoController';
import { HorasCursoController } from './controllers/horasCursoController';
import { ProgramaDocxController } from "./controllers/programaDocxController";
import { AuthController } from './controllers/authController';
import { CronogramasController } from './controllers/cronogramasController';
import { CronogramaExcelController } from './controllers/cronogramaExcelController';
import { EstadoServidorController } from './controllers/estadoServidorController';
import { UsuarioCursoController } from './controllers/usuarioCursoController';
import { SolicitudesCambioController } from './controllers/solicitudesCambioController';

const router = Router();

const progCtrl = new ProgramasController();
const cursosCtrl = new CursoController();
const peCtrl = new PlanEstudioController();
const pecCtrl = new PlanEstudioCursoController();
const docCtrl = new DocenteController();
const pdocCtrl = new ProgramaDocenteController();
const cohCtrl = new CohorteController();
const pcCtrl = new ProgramaCursoController();
const pcrCtrl = new ProgramaCursoRequisitoController();
const hcCtrl = new HorasCursoController();
const authCtrl = new AuthController();
const cronCtrl = new CronogramasController();
const cronExcelCtrl = new CronogramaExcelController();
const estadoSrvCtrl = new EstadoServidorController();
const ucCtrl = new UsuarioCursoController();
const scCtrl = new SolicitudesCambioController();

const ADMIN = requireRole(['superadmin', 'admin']);
const ANY = requireRole([
    'superadmin',
    'admin',
    'coordinador de programa',
    'coordinador de curso',
    'docente',
]);
const COORD = requireRole(['coordinador de programa', 'coordinador de curso', 'admin', 'superadmin']);

// ======== RUTAS DE AUTH (públicas) =========
router.get('/auth/google', authCtrl.googleAuth);
router.get('/auth/google/callback', authCtrl.googleCallback);
router.post('/auth/dev-login', authCtrl.devLogin);

// ======== AUTH (requiere token) =========
router.get('/auth/me', requireAuth, (req, res) => res.json(req.user)); // opcional: simplifica /auth/me

// gestión de usuarios / preregistro (admin)
router.get('/auth/usuarios', requireAuth, ADMIN, authCtrl.listUsuarios);
router.post('/auth/registro', requireAuth, ADMIN, authCtrl.preRegister);
router.get('/auth/roles', requireAuth, ADMIN, authCtrl.roles);

// A partir de aquí, todo requiere login
router.use(requireAuth);

// ================== PROGRAMAS (lectura: todos, escritura: admin) ==================
router.get('/programas', ANY, progCtrl.getAll);
router.get('/programas/:id', ANY, progCtrl.getById);
router.post('/programas', ADMIN, progCtrl.create);
router.patch('/programas/:id', ADMIN, progCtrl.update);
router.delete('/programas/:id', ADMIN, progCtrl.remove);

// ================== CURSOS ==================
router.get('/cursos', ANY, cursosCtrl.getAll);
router.get('/cursos/:id', ANY, cursosCtrl.getById);
router.post('/cursos', ADMIN, cursosCtrl.create);
router.patch('/cursos/:id', ADMIN, cursosCtrl.update);
router.delete('/cursos/:id', ADMIN, cursosCtrl.remove);

// ================== PLANES ESTUDIO ==================
router.get('/planes-estudio', ANY, peCtrl.getAll);
router.get('/planes-estudio/:id', ANY, peCtrl.getById);
router.post('/planes-estudio', ADMIN, peCtrl.create);
router.patch('/planes-estudio/:id', ADMIN, peCtrl.update);
router.delete('/planes-estudio/:id', ADMIN, peCtrl.remove);

// ================== PLAN_ESTUDIO_CURSOS ==================
router.get('/plan-estudio-cursos', ANY, pecCtrl.getAll);
router.get('/plan-estudio-cursos/:id', ANY, pecCtrl.getById);
router.post('/plan-estudio-cursos', ADMIN, pecCtrl.create);
router.patch('/plan-estudio-cursos/:id', ADMIN, pecCtrl.update);
router.delete('/plan-estudio-cursos/:id', ADMIN, pecCtrl.remove);

// ================== DOCENTES (admin) ==================
router.get('/docentes', ANY, docCtrl.getAll);
router.get('/docentes/:id', ANY, docCtrl.getById);
router.post('/docentes', ADMIN, docCtrl.create);
router.patch('/docentes/:id', ADMIN, docCtrl.update);
router.delete('/docentes/:id', ADMIN, docCtrl.remove);

// ================== PROGRAMA ↔ DOCENTE ==================
router.get('/programas-docente', ADMIN, pdocCtrl.getAll);
router.get('/programas-docente/:id', ADMIN, pdocCtrl.getById);
router.post('/programas-docente', ADMIN, pdocCtrl.create);
router.patch('/programas-docente/:id', ADMIN, pdocCtrl.update);
router.delete('/programas-docente/:id', ADMIN, pdocCtrl.remove);

// ================== COHORTES ==================
router.get('/cohortes', ANY, cohCtrl.getAll);
router.get('/cohortes/:id', ANY, cohCtrl.getById);
router.post('/cohortes', ADMIN, cohCtrl.create);
router.patch('/cohortes/:id', ADMIN, cohCtrl.update);
router.delete('/cohortes/:id', ADMIN, cohCtrl.remove);

// ================== PROGRAMA CURSO ==================
router.get('/programas-curso', ANY, pcCtrl.getAll);
router.get('/programas-curso/:id', ANY, pcCtrl.getById);
router.post('/programas-curso', ADMIN, pcCtrl.create);
router.patch('/programas-curso/:id', ADMIN, pcCtrl.update);
router.delete('/programas-curso/:id', ADMIN, pcCtrl.remove);

// avanzado: coordinadores + admin (por ahora)
router.post('/programas-curso/:id/avanzado', COORD, pcCtrl.upsertAvanzado);

// requisitos (lectura: todos; escritura: coord+admin o solo admin según tu política)
router.get('/programas-curso/:programaCursoId/requisitos', ANY, pcrCtrl.listByProgramaCurso);
router.post('/programas-curso/:programaCursoId/requisitos', COORD, pcrCtrl.create);
router.delete('/programas-curso/:programaCursoId/requisitos', COORD, pcrCtrl.remove);
router.post('/programas-curso/:programaCursoId/requisitos/bulk', COORD, pcrCtrl.bulkCreate);

// horas
router.get('/programas-curso/:programaCursoId/horas', ANY, hcCtrl.listByProgramaCurso);
router.post('/programas-curso/:programaCursoId/horas', COORD, hcCtrl.createForProgramaCurso);
router.get('/horas-curso/:id', ANY, hcCtrl.getById);
router.patch('/horas-curso/:id', COORD, hcCtrl.update);
router.delete('/horas-curso/:id', COORD, hcCtrl.remove);

// docx
router.post('/programas-curso/:id/docx', ANY, ProgramaDocxController.generate);

// ================== CRONOGRAMAS ==================
router.get('/cronogramas/curso/:cursoId', ANY, cronCtrl.getByCurso);
router.put('/cronogramas/curso/:cursoId', COORD, cronCtrl.replaceForCurso);
router.get('/cronogramas/excel', ANY, cronExcelCtrl.export);

// ================== ESTADOS SERVIDOR (admin) ==================
router.get('/estados-servidor/active', ANY, estadoSrvCtrl.getActive);
router.get('/estados-servidor/effective', ANY, estadoSrvCtrl.effective);
router.post('/estados-servidor/recalc', ADMIN, estadoSrvCtrl.recalc);
router.post('/estados-servidor/flows/full', ADMIN, estadoSrvCtrl.activateFlow1);
router.post('/estados-servidor/flows/cronogramas-only', ADMIN, estadoSrvCtrl.activateCronogramasOnly);
router.get('/estados-servidor', ADMIN, estadoSrvCtrl.list);
router.post('/estados-servidor', ADMIN, estadoSrvCtrl.create);
router.get('/estados-servidor/:id', ADMIN, estadoSrvCtrl.getById);
router.patch('/estados-servidor/:id', ADMIN, estadoSrvCtrl.update);
router.delete('/estados-servidor/:id', ADMIN, estadoSrvCtrl.remove);

// ================== USUARIOS ↔ CURSOS (admin) ==================
router.get('/usuarios/:usuarioId/cursos/disponibles', ADMIN, ucCtrl.listDisponibles);
router.get('/usuarios/:usuarioId/cursos', ADMIN, ucCtrl.listByUsuario);
router.put('/usuarios/:usuarioId/cursos', ADMIN, ucCtrl.setForUsuario);
router.post('/usuarios/:usuarioId/cursos', ADMIN, ucCtrl.addToUsuario);
router.delete('/usuarios/:usuarioId/cursos/:cursoId', ADMIN, ucCtrl.removeOne);
router.get('/mi/cursos', COORD, ucCtrl.listMine);

// ================== SOLICITUDES DE CAMBIO ==================

// Admin: listar pendientes
router.get('/solicitudes-cambio/pendientes', ADMIN, scCtrl.pendientes);
router.get('/solicitudes-cambio/mias', COORD, scCtrl.mias);
router.get('/solicitudes-cambio/:id', COORD, scCtrl.getById);
router.post('/solicitudes-cambio', COORD, scCtrl.crear);
router.post('/solicitudes-cambio/:id/aprobar', ADMIN, scCtrl.aprobar);
router.post('/solicitudes-cambio/:id/rechazar', ADMIN, scCtrl.rechazar);

export default router;