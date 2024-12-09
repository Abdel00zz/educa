import { Router } from 'express';
import { body } from 'express-validator';
import { auth, checkRole } from '../middleware/auth';
import {
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
  enrollStudent,
  unenrollStudent
} from '../controllers/class.controller';

const router = Router();

// Protection de toutes les routes
router.use(auth);

// Routes pour les classes
router.post(
  '/',
  checkRole(['TEACHER', 'ADMIN']),
  [
    body('name').notEmpty(),
    body('description').optional()
  ],
  createClass
);

router.get('/', getClasses);
router.get('/:id', getClass);

router.put(
  '/:id',
  checkRole(['TEACHER', 'ADMIN']),
  [
    body('name').optional(),
    body('description').optional()
  ],
  updateClass
);

router.delete('/:id', checkRole(['TEACHER', 'ADMIN']), deleteClass);

// Routes pour les inscriptions
router.post(
  '/:id/enroll',
  checkRole(['STUDENT']),
  enrollStudent
);

router.delete(
  '/:id/enroll',
  checkRole(['STUDENT']),
  unenrollStudent
);

export default router;
