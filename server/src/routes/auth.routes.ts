import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/auth.controller';
import { auth } from '../middleware/auth';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('fullName').notEmpty(),
    body('role').isIn(['STUDENT', 'TEACHER', 'ADMIN'])
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').exists()
  ],
  login
);

router.get('/me', auth, me);

export default router;
