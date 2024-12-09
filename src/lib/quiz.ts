import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import { createNotification } from './notifications';
import type { QuizData } from '../types/quiz';
import { filterQuizzes } from './filters';
import type { QuizFilters } from './filters';

export async function createQuiz(data: QuizData) {
  const now = new Date().toISOString();
  const quiz = {
    ...data,
    id: data.id || uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  await db.put('quizzes', quiz);
  
  // Notify all students in the same grade level
  const students = await db.getAll('students');
  const gradeStudents = students.filter(s => s.gradeLevel === quiz.gradeLevel);
  
  await Promise.all(gradeStudents.map(student =>
    createNotification(student.id, {
      title: 'Nouveau Quiz',
      message: `Un nouveau quiz a été ajouté pour ${quiz.chapter}`,
      type: 'quiz'
    })
  ));
  
  return quiz;
}

export async function updateQuiz(data: QuizData) {
  const existing = await db.get('quizzes', data.id);
  if (!existing) {
    throw new Error('Quiz not found');
  }

  const quiz = {
    ...data,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await db.put('quizzes', quiz);
  return quiz;
}

export async function getQuizzes(filters?: QuizFilters) {
  const quizzes = await db.getAll('quizzes');
  return filterQuizzes(quizzes, filters);
}

export async function getQuizById(id: string) {
  return db.get('quizzes', id);
}

export async function deleteQuiz(id: string) {
  return db.delete('quizzes', id);
}

export async function saveQuizProgress(studentId: string, quizId: string, data: {
  answers: Record<string, string>;
  blankAnswers: Record<string, string[]>;
  timeSpent: number;
  isComplete?: boolean;
  score?: number;
}) {
  const progress = {
    id: `progress-${studentId}-${quizId}`,
    studentId,
    quizId,
    answers: data.answers,
    timeSpent: data.timeSpent,
    isComplete: data.isComplete,
    score: data.score || 0,
    completedAt: new Date().toISOString(),
  };

  await db.put('progress', progress);
  
  // Create notification if quiz is completed
  if (data.isComplete) {
    await createNotification(studentId, {
      title: 'Quiz Terminé',
      message: `Vous avez terminé le quiz avec un score de ${data.score}%`,
      type: 'quiz'
    });
  }
  
  return progress;
}

export async function getQuizProgress(studentId: string, quizId: string) {
  const key = `progress-${studentId}-${quizId}`;
  return db.get('progress', key);
}