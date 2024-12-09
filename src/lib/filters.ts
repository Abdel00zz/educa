import type { QuizData } from '../types/quiz';
import type { Exercise } from '../types/exercise';

export interface QuizFilters {
  gradeLevel?: string;
  subject?: string;
}

export interface ExerciseFilters {
  gradeLevel?: string;
  lesson?: string;
}

export function filterQuizzes(quizzes: QuizData[], filters?: QuizFilters): QuizData[] {
  if (!filters) return quizzes;
  
  return quizzes.filter(quiz => {
    if (filters.gradeLevel && quiz.gradeLevel !== filters.gradeLevel) return false;
    if (filters.subject && quiz.subject !== filters.subject) return false;
    return true;
  });
}

export function filterExercises(exercises: Exercise[], filters?: ExerciseFilters): Exercise[] {
  if (!filters) return exercises;
  
  return exercises.filter(exercise => {
    if (filters.gradeLevel && exercise.gradeLevel !== filters.gradeLevel) return false;
    if (filters.lesson && exercise.lesson !== filters.lesson) return false;
    return true;
  });
}