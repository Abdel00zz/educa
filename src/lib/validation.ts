import { ValidationError } from '../types/errors';
import type { QuizData } from '../types/quiz';
import type { Exercise } from '../types/exercise';

export function validateQuiz(quiz: QuizData): void {
  if (!quiz.title?.trim()) {
    throw new ValidationError('Quiz title is required');
  }
  if (!quiz.gradeLevel?.trim()) {
    throw new ValidationError('Grade level is required');
  }
  if (!quiz.chapter?.trim()) {
    throw new ValidationError('Chapter is required');
  }
  if (!quiz.questions?.length) {
    throw new ValidationError('Quiz must have at least one question');
  }

  quiz.questions.forEach((question, index) => {
    if (!question.text?.trim()) {
      throw new ValidationError(`Question ${index + 1} text is required`);
    }
    if (!question.type) {
      throw new ValidationError(`Question ${index + 1} type is required`);
    }
    if (question.type === 'mcq' && (!question.options?.length || question.options.length < 2)) {
      throw new ValidationError(`Question ${index + 1} must have at least 2 options`);
    }
    if (question.type === 'fillblank') {
      const blanks = question.text.match(/\[(.*?)\]/g);
      if (!blanks?.length) {
        throw new ValidationError(`Fill-in-the-blank question ${index + 1} must contain at least one blank between [ ]`);
      }
      blanks.forEach((blank, blankIndex) => {
        if (blank.slice(1, -1).trim() === '') {
          throw new ValidationError(`Blank ${blankIndex + 1} in question ${index + 1} cannot be empty`);
        }
      });
    }
    if (!question.answer) {
      throw new ValidationError(`Question ${index + 1} answer is required`);
    }
  });
}

export function validateExercise(exercise: Exercise): void {
  if (!exercise.gradeLevel?.trim()) {
    throw new ValidationError('Grade level is required');
  }
  if (!exercise.lesson?.trim()) {
    throw new ValidationError('Lesson is required');
  }
  if (!exercise.questions?.length) {
    throw new ValidationError('Exercise must have at least one question');
  }

  exercise.questions.forEach((question, index) => {
    if (!question.text?.trim()) {
      throw new ValidationError(`Question ${index + 1} text is required`);
    }
    question.subQuestions?.forEach((subQ, subIndex) => {
      if (!subQ.text?.trim()) {
        throw new ValidationError(`Sub-question ${subIndex + 1} of question ${index + 1} text is required`);
      }
    });
  });
}