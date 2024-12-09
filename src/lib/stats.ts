import { db } from './db';
import type { Statistics } from '../types';
import type { Student } from '../types';
import type { StudentAnalytics } from '../types/student';

export async function getAdminStats(): Promise<Statistics> {
  const [students, quizzes, progress] = await Promise.all([
    db.getAll('students'),
    db.getAll('quizzes'),
    db.getAll('progress')
  ]);

  const totalStudents = students.length;
  const activeQuizzes = quizzes.length;
  const activeExercises = 0; // TODO: Add exercise count

  // Calculate completion rate
  const totalAttempts = progress.length;
  const completionRate = totalStudents > 0 && activeQuizzes > 0
    ? Math.round((totalAttempts / (totalStudents * activeQuizzes)) * 100) 
    : 0;

  // Calculate average score
  const averageScore = progress.length > 0
    ? Math.round(progress.reduce((acc, curr) => acc + curr.score, 0) / progress.length)
    : 0;

  // Calculate total time spent
  const totalTimeSpent = progress.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);

  // Calculate weekly active users
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyActiveUsers = progress.filter(p => 
    new Date(p.completedAt) > weekAgo
  ).length;

  // Calculate monthly growth
  const monthlyGrowth = 5; // TODO: Implement actual calculation

  return {
    totalStudents,
    activeQuizzes,
    activeExercises,
    completionRate,
    averageScore,
    totalTimeSpent,
    weeklyActiveUsers,
    monthlyGrowth
  };
}

export async function getStudentStats(studentId: string) {
  const [quizzes, progress] = await Promise.all([
    db.getAll('quizzes'),
    db.getAll('progress'),
  ]);

  const studentProgress = progress.filter(p => p.studentId === studentId);
  
  const completedQuizzes = studentProgress.filter(p => p.isComplete).length;
  const successfulQuizzes = studentProgress.filter(p => p.isComplete && p.score >= 80).length;
  const failedQuizzes = studentProgress.filter(p => p.isComplete && p.score < 50).length;
  const inProgressQuizzes = studentProgress.filter(p => !p.isComplete).length;
  const totalQuizzes = quizzes.length;
  
  const completionRate = totalQuizzes > 0 
    ? Math.round((completedQuizzes / totalQuizzes) * 100)
    : 0;

  const averageScore = studentProgress.length > 0
    ? Math.round(studentProgress.filter(p => p.isComplete)
        .reduce((acc, curr) => acc + curr.score, 0) / 
        studentProgress.filter(p => p.isComplete).length)
    : 0;

  // Get student's recent activity
  const recentActivity = studentProgress
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5)
    .map(activity => ({
      type: activity.quizId ? 'quiz' : 'exercise',
      title: activity.quizTitle || `Exercise ${activity.exerciseId}`,
      chapter: activity.chapter || '',
      status: activity.isComplete ? 'completed' : 'in_progress',
      score: activity.score,
      timestamp: activity.completedAt
    }));

  const quizResults = studentProgress
    .filter(p => p.quizId)
    .map(p => {
      const quiz = quizzes.find(q => q.id === p.quizId);
      return {
        quizId: p.quizId,
        quizTitle: quiz?.title || 'Quiz inconnu',
        chapter: quiz?.chapter || '',
        score: p.score,
        isComplete: p.isComplete,
        status: p.status || (p.isComplete ? 'completed' : 'in_progress'),
        completedAt: p.completedAt,
      };
    })
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  return {
    completedQuizzes,
    totalQuizzes,
    completionRate,
    successfulQuizzes,
    failedQuizzes,
    inProgressQuizzes,
    quizResults,
    recentActivity
  };
}

export async function getStudents(): Promise<Student[]> {
  const students = await db.getAll('students') as any[];
  const progress = await db.getAll('progress');
  
  return students.map(student => ({
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    gradeLevel: student.gradeLevel,
    joinedDate: student.joinedDate,
    lastLogin: progress.find(p => p.studentId === student.id)?.completedAt,
    progress: {
      completionRate: calculateCompletionRate(progress.filter(p => p.studentId === student.id)),
      timeSpent: calculateTimeSpent(progress.filter(p => p.studentId === student.id)),
      completedExercises: progress.filter(p => p.studentId === student.id && p.exerciseId).length,
      averageScore: calculateAverageScore(progress.filter(p => p.studentId === student.id)),
      exerciseFeedback: extractExerciseFeedback(progress.filter(p => p.studentId === student.id))
    }
  }));
}

function calculateCompletionRate(progress: any[]): number {
  if (progress.length === 0) return 0;
  const completed = progress.filter(p => p.isComplete).length;
  return Math.round((completed / progress.length) * 100);
}

function calculateTimeSpent(progress: any[]): number {
  return progress.reduce((total, p) => total + (p.timeSpent || 0), 0);
}

function calculateAverageScore(progress: any[]): number {
  if (progress.length === 0) return 0;
  const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
  return Math.round(totalScore / progress.length);
}

function extractExerciseFeedback(progress: any[]) {
  return progress
    .filter(p => p.exerciseFeedback?.length > 0)
    .flatMap(p => p.exerciseFeedback)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}