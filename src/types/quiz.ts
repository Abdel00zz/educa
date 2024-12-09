export type QuestionType = 'truefalse' | 'mcq' | 'fillblank';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  answer: string | string[];
  options?: string[];
}

export interface QuizData {
  id: string;
  title: string;
  gradeLevel: string;
  chapter: string;
  questions: Question[];
}

export interface QuizFormData {
  title: string;
  gradeLevel: string;
  chapter: string;
}

export interface QuizSubmission {
  answers: Record<string, string | string[]>;
  completedAt: string;
  timeSpent: number;
  isComplete: boolean;
}