export interface Student {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: number;
}

export interface Statistics {
  totalStudents: number;
  activeQuizzes: number;
  activeExercises: number;
  completionRate: number;
  averageScore: number;
  totalTimeSpent: number;
  weeklyActiveUsers: number;
  monthlyGrowth: number;
}