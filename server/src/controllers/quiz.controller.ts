import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { ValidationError, NotFoundError, AuthorizationError } from '../middleware/error';

export const createQuiz = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', errors.array());
  }

  const { title, gradeLevel, subject, lesson, questions } = req.body;
  const createdBy = req.user!.id;

  const quiz = await prisma.quiz.create({
    data: {
      title,
      gradeLevel,
      subject,
      lesson,
      createdBy,
      questions: {
        create: questions.map((q: any) => ({
          type: q.type,
          text: q.text,
          answer: q.answer,
          options: q.options ? JSON.stringify(q.options) : null
        }))
      }
    },
    include: {
      questions: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  res.status(201).json(quiz);
};

export const getQuizzes = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const quizzes = await prisma.quiz.findMany({
    where: userRole === 'TEACHER' ? { createdBy: userId } : undefined,
    include: {
      _count: {
        select: {
          questions: true
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  res.json(quizzes);
};

export const getQuiz = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        select: {
          id: true,
          type: true,
          text: true,
          options: true,
          // Ne pas inclure la réponse pour les étudiants
          answer: userRole !== 'STUDENT'
        }
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  if (!quiz) {
    throw new NotFoundError('Quiz not found');
  }

  // Transformer les options de string JSON en objet
  const formattedQuiz = {
    ...quiz,
    questions: quiz.questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null
    }))
  };

  res.json(formattedQuiz);
};

export const updateQuiz = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', errors.array());
  }

  const { id } = req.params;
  const { title, gradeLevel, subject, lesson, questions } = req.body;
  const userId = req.user!.id;

  const quiz = await prisma.quiz.findUnique({
    where: { id }
  });

  if (!quiz) {
    throw new NotFoundError('Quiz not found');
  }

  if (quiz.createdBy !== userId) {
    throw new AuthorizationError('Not authorized to update this quiz');
  }

  // Utiliser une transaction pour mettre à jour le quiz et ses questions
  const updatedQuiz = await prisma.$transaction(async (tx) => {
    // Supprimer les questions existantes
    if (questions) {
      await tx.question.deleteMany({
        where: { quizId: id }
      });
    }

    // Mettre à jour le quiz et créer les nouvelles questions
    return tx.quiz.update({
      where: { id },
      data: {
        title,
        gradeLevel,
        subject,
        lesson,
        updatedAt: new Date(),
        questions: questions ? {
          create: questions.map((q: any) => ({
            type: q.type,
            text: q.text,
            answer: q.answer,
            options: q.options ? JSON.stringify(q.options) : null
          }))
        } : undefined
      },
      include: {
        questions: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });
  });

  res.json(updatedQuiz);
};

export const deleteQuiz = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const quiz = await prisma.quiz.findUnique({
    where: { id }
  });

  if (!quiz) {
    throw new NotFoundError('Quiz not found');
  }

  if (quiz.createdBy !== userId) {
    throw new AuthorizationError('Not authorized to delete this quiz');
  }

  await prisma.quiz.delete({
    where: { id }
  });

  res.status(204).send();
};

// Modèle pour les résultats de quiz
interface QuizSubmission {
  questionId: string;
  answer: string;
}

export const submitQuiz = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input', errors.array());
  }

  const { id: quizId } = req.params;
  const { answers } = req.body as { answers: QuizSubmission[] };
  const studentId = req.user!.id;

  // Récupérer le quiz avec les questions
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: true
    }
  });

  if (!quiz) {
    throw new NotFoundError('Quiz not found');
  }

  // Vérifier les réponses et calculer le score
  let correctAnswers = 0;
  const results = answers.map(submission => {
    const question = quiz.questions.find(q => q.id === submission.questionId);
    if (!question) {
      throw new ValidationError(`Question ${submission.questionId} not found`);
    }

    const isCorrect = submission.answer.toLowerCase() === question.answer.toLowerCase();
    if (isCorrect) correctAnswers++;

    return {
      questionId: submission.questionId,
      isCorrect,
      submittedAnswer: submission.answer,
      correctAnswer: question.answer
    };
  });

  const score = (correctAnswers / quiz.questions.length) * 100;

  // Enregistrer les résultats
  const submission = await prisma.quizSubmission.create({
    data: {
      quizId,
      studentId,
      score,
      answers: JSON.stringify(results)
    }
  });

  res.status(201).json({
    submission,
    results,
    score
  });
};

export const getQuizResults = async (req: Request, res: Response) => {
  const { id: quizId } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId }
  });

  if (!quiz) {
    throw new NotFoundError('Quiz not found');
  }

  // Pour les enseignants, montrer tous les résultats
  // Pour les étudiants, montrer uniquement leurs résultats
  const submissions = await prisma.quizSubmission.findMany({
    where: {
      quizId,
      ...(userRole === 'STUDENT' ? { studentId: userId } : {})
    },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Transformer les réponses de string JSON en objet
  const formattedSubmissions = submissions.map(s => ({
    ...s,
    answers: JSON.parse(s.answers as string)
  }));

  res.json(formattedSubmissions);
};
