import { Router } from 'express';
import { body } from 'express-validator';
import { auth, checkRole } from '../middleware/auth';
import {
  createChapter,
  getChapters,
  getChapter,
  updateChapter,
  deleteChapter,
  reorderChapters
} from '../controllers/chapter.controller';

const router = Router({ mergeParams: true }); // Pour accéder aux params de la route parent

// Protection de toutes les routes
router.use(auth);

// Routes pour les chapitres
router.post(
  '/',
  checkRole(['TEACHER', 'ADMIN']),
  [
    body('title').notEmpty(),
    body('content').notEmpty(),
    body('order').isInt({ min: 0 })
  ],
  createChapter
);

router.get('/', getChapters);
router.get('/:chapterId', getChapter);

router.put(
  '/:chapterId',
  checkRole(['TEACHER', 'ADMIN']),
  [
    body('title').optional(),
    body('content').optional(),
    body('order').optional().isInt({ min: 0 })
  ],
  updateChapter
);

router.delete(
  '/:chapterId',
  checkRole(['TEACHER', 'ADMIN']),
  deleteChapter
);

router.put(
  '/reorder',
  checkRole(['TEACHER', 'ADMIN']),
  [
    body('orders').isArray(),
    body('orders.*.id').notEmpty(),
    body('orders.*.order').isInt({ min: 0 })
  ],
  reorderChapters
);

export default router;
