import { Router } from 'express';
import { body } from 'express-validator';
import { auth, checkRole } from '../middleware/auth';
import {
  createExercise,
  getExercises,
  getExercise,
  updateExercise,
  deleteExercise,
  submitSolution,
  getSolutions
} from '../controllers/exercise.controller';

const router = Router();

// Protection de toutes les routes
router.use(auth);

// Routes pour les exercices
router.post(
  '/',
  checkRole(['TEACHER', 'ADMIN']),
  [
    body('gradeLevel').notEmpty(),
    body('lesson').notEmpty(),
    body('statement').optional(),
    body('problems').isArray(),
    body('problems.*.number').isInt({ min: 1 }),
    body('problems.*.text').notEmpty(),
    body('problems.*.subProblems').optional().isArray(),
    body('problems.*.subProblems.*.label').optional(),
    body('problems.*.subProblems.*.text').optional()
  ],
  createExercise
);

router.get('/', getExercises);
router.get('/:id', getExercise);

router.put(
  '/:id',
  checkRole(['TEACHER', 'ADMIN']),
  [
    body('gradeLevel').optional(),
    body('lesson').optional(),
    body('statement').optional(),
    body('problems').optional().isArray(),
    body('problems.*.number').optional().isInt({ min: 1 }),
    body('problems.*.text').optional(),
    body('problems.*.subProblems').optional().isArray(),
    body('problems.*.subProblems.*.label').optional(),
    body('problems.*.subProblems.*.text').optional()
  ],
  updateExercise
);

router.delete('/:id', checkRole(['TEACHER', 'ADMIN']), deleteExercise);

// Routes pour les solutions
router.post(
  '/:id/solutions',
  checkRole(['STUDENT']),
  [
    body('solutions').isArray(),
    body('solutions.*.problemId').notEmpty(),
    body('solutions.*.solution').notEmpty(),
    body('solutions.*.subProblemId').optional()
  ],
  submitSolution
);

router.get(
  '/:id/solutions',
  getSolutions
);

export default router;
