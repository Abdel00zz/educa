import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import type { StudentProfile, StudentProgress, ExerciseFeedback } from '../types/student';

export async function deleteStudent(studentId: string) {
  try {
    // Delete student record
    await db.delete('students', studentId);
    
    // Delete all progress records for this student
    const progress = await db.getAll('progress');
    const studentProgress = progress.filter(p => p.studentId === studentId);
    
    await Promise.all(
      studentProgress.map(p => db.delete('progress', p.id))
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw new Error('Failed to delete student');
  }
}

export async function registerStudent(data: Omit<StudentProfile, 'id' | 'joinedDate'> & { password: string }) {
  try {
    // Check if email already exists using the index
    const existingStudent = await db.getByIndex('students', 'by-email', data.email);
    if (existingStudent) {
      throw new Error('Un compte existe déjà avec cet email');
    }

    const student: StudentProfile & { password: string } = {
      id: uuidv4(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      gradeLevel: data.gradeLevel,
      joinedDate: new Date().toISOString(),
      password: data.password // In a real app, this should be hashed
    };

    await db.put('students', student);

    // Return student data without password
    const { password, ...studentProfile } = student;
    return studentProfile;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur lors de l\'inscription');
  }
}

export async function loginStudent(email: string, password: string) {
  try {
    const student = await db.getByIndex('students', 'by-email', email);
    
    if (!student || student.password !== password) {
      throw new Error('Email ou mot de passe incorrect');
    }
    
    // Return student data without password
    const { password: _, ...studentProfile } = student;
    return studentProfile;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur lors de la connexion');
  }
}

export function getStudentSession() {
  const session = localStorage.getItem('studentSession');
  if (!session) return null;
  return JSON.parse(session);
}

export async function saveProgress(studentId: string, progress: StudentProgress) {
  const key = `progress-${studentId}-${progress.quizId}`;
  await db.put('progress', { ...progress, id: key });
}

export async function getExerciseFeedback(studentId: string, exerciseId: string) {
  const key = `progress-${studentId}-${exerciseId}`;
  return db.get('progress', key);
}

export async function saveExerciseFeedback(
  studentId: string,
  exerciseId: string,
  feedback: Omit<ExerciseFeedback, 'timestamp'>
) {
  const key = `progress-${studentId}-${exerciseId}`;
  const existing = await db.get('progress', key);
  
  // Check if feedback for this question/subquestion already exists
  const existingFeedback = existing?.exerciseFeedback || [];
  const feedbackKey = feedback.subQuestionId 
    ? `${feedback.questionId}-${feedback.subQuestionId}`
    : feedback.questionId;
    
  const updatedFeedback = existingFeedback.filter(f => {
    const currentKey = f.subQuestionId
      ? `${f.questionId}-${f.subQuestionId}`
      : f.questionId;
    return currentKey !== feedbackKey;
  });
  
  const progress = {
    id: key,
    studentId,
    exerciseId,
    score: 0,
    answers: {},
    completedAt: new Date().toISOString(),
    exerciseFeedback: [
      ...updatedFeedback,
      { ...feedback, timestamp: new Date().toISOString() }
    ]
  };

  await db.put('progress', progress);
  return progress;
}
export async function getStudentProgress(studentId: string) {
  const allProgress = await db.getAll('progress');
  return allProgress.filter(p => p.id.startsWith(`progress-${studentId}`));
}