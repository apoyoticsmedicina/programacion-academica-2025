// src/controllers/catalogosController.ts
import { Router } from 'express';
import { AppDataSource } from '../config/data-source';

// Entidades actuales
import { CaracteristicasCurso } from '../entities/CaracteristicasCurso';
import { ClaseCurso } from '../entities/ClaseCurso';
import { ModalidadCurso } from '../entities/ModalidadCurso';
import { TipoCurso } from '../entities/TipoCurso';

// Estrategia Didáctica (usa campo `estrategia`)
import { EstrategiaDidactica } from '../entities/EstrategiaDidactica';

const router = Router();

/** Características del curso */
router.get('/catalogos/caracteristicas-curso', async (_req, res) => {
  const repo = AppDataSource.getRepository(CaracteristicasCurso);
  const items = await repo.find({ order: { id: 'ASC' } as any });
  res.json({ items });
});

/** Clases del curso */
router.get('/catalogos/clases-curso', async (_req, res) => {
  const repo = AppDataSource.getRepository(ClaseCurso);
  const items = await repo.find({ order: { id: 'ASC' } as any });
  res.json({ items });
});

/** Modalidades del curso */
router.get('/catalogos/modalidades-curso', async (_req, res) => {
  const repo = AppDataSource.getRepository(ModalidadCurso);
  const items = await repo.find({ order: { id: 'ASC' } as any });
  res.json({ items });
});

/** Tipos de curso */
router.get('/catalogos/tipos-curso', async (_req, res) => {
  const repo = AppDataSource.getRepository(TipoCurso);
  const items = await repo.find({ order: { id: 'ASC' } as any });
  res.json({ items });
});

/** Estrategias didácticas (según entidad con campo `estrategia`) */
router.get('/catalogos/estrategias-didacticas', async (_req, res) => {
  const repo = AppDataSource.getRepository(EstrategiaDidactica);
  // Selecciona sólo los campos que necesitas (id, estrategia)
  const items = await repo.find({
    select: {
      id: true,
      estrategia: true,
    },
    order: { estrategia: 'ASC' } as any,
  });
  res.json({ items });
});

export default router;
