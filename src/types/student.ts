export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel: string;
  joinedDate: string;
}

export interface ExerciseFeedback {
  questionId: string;
  subQuestionId?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp: string;
}

export interface StudentProgress {
  quizId: string;
  score: number;
  isComplete: boolean;
  status: 'in_progress' | 'completed';
  lastLogin?: string;
  completedAt: string;
  timeSpent: number;
  exerciseFeedback: ExerciseFeedback[];
}

export interface StudentSession {
  profile: StudentProfile;
  progress: StudentProgress[];
}

export interface StudentAnalytics {
  completionRate: number;
  averageScore: number;
  completedQuizzes: number;
  totalQuizzes: number;
  successfulQuizzes: number;
  failedQuizzes: number;
  inProgressQuizzes: number;
  recentActivity: Array<{
    type: 'quiz' | 'exercise';
    title: string;
    chapter: string;
    status: 'in_progress' | 'completed';
    score?: number;
    timestamp: string;
  }>;
  quizResults?: Array<{
    quizId: string;
    quizTitle: string;
    chapter: string;
    score: number;
    isComplete: boolean;
    status: 'in_progress' | 'completed';
    completedAt: string;
  }>;
}