export interface SubQuestion {
  id: string;
  label: string;
  text: string;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  subQuestions: SubQuestion[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Exercise {
  id: string;
  gradeLevel: string;
  chapter: string;
  statement: string;
  questions: Question[];
}