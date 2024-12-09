import { Router } from 'express';
import { body } from 'express-validator';
import { auth, checkRole } from '../middleware/auth';
import {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults
} from '../controllers/quiz.controller';

const router = Router();

// Protection de toutes les routes
router.use(auth);

// Routes pour les quiz
router.post(
  '/',
  checkRole(['TEACHER', 'ADMIN']),
  [
    body('title').notEmpty(),
    body('gradeLevel').notEmpty(),
    body('subject').notEmpty(),
    body('lesson').notEmpty(),
    body('questions').isArray(),
    body('questions.*.type').isIn(['truefalse', 'mcq', 'fillblank']),
    body('questions.*.text').notEmpty(),
    body('questions.*.answer').notEmpty(),
    body('questions.*.options').optional().isArray()
  ],
  createQuiz
);

router.get('/', getQuizzes);
router.get('/:id', getQuiz);

router.put(
  '/:id',
  checkRole(['TEACHER', 'ADMIN']),
  [
    body('title').optional(),
    body('gradeLevel').optional(),
    body('subject').optional(),
    body('lesson').optional(),
    body('questions').optional().isArray(),
    body('questions.*.type').optional().isIn(['truefalse', 'mcq', 'fillblank']),
    body('questions.*.text').optional(),
    body('questions.*.answer').optional(),
    body('questions.*.options').optional().isArray()
  ],
  updateQuiz
);

router.delete('/:id', checkRole(['TEACHER', 'ADMIN']), deleteQuiz);

// Routes pour les soumissions de quiz
router.post(
  '/:id/submit',
  checkRole(['STUDENT']),
  [
    body('answers').isArray(),
    body('answers.*.questionId').notEmpty(),
    body('answers.*.answer').notEmpty()
  ],
  submitQuiz
);

router.get(
  '/:id/results',
  getQuizResults
);

export default router;
