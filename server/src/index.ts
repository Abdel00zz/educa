import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import classRoutes from './routes/class.routes';
import chapterRoutes from './routes/chapter.routes';
import quizRoutes from './routes/quiz.routes';
import exerciseRoutes from './routes/exercise.routes';
import { errorHandler } from './middleware/error';

// Charger les variables d'environnement
config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/classes/:classId/chapters', chapterRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/exercises', exerciseRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
