import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import { createNotification } from './notifications';
import type { Exercise } from '../types/exercise';

export function getExerciseNumber(exercise: Exercise): number {
  return parseInt(exercise.id.split('-')[1]) || 1;
}

export async function createExercise(data: Exercise) {
  const now = new Date().toISOString();
  
  // Get all exercises for this chapter
  const exercises = await getExercises({ chapter: data.chapter });
  const exerciseNumber = exercises.length + 1;
  
  const exercise = {
    ...data,
    id: `${data.chapter}-${exerciseNumber}-${uuidv4()}`,
    createdAt: now,
    updatedAt: now,
  };

  await db.put('exercises', exercise);
  
  // Notify all students in the same grade level
  const students = await db.getAll('students');
  const gradeStudents = students.filter(s => s.gradeLevel === exercise.gradeLevel);
  
  await Promise.all(gradeStudents.map(student =>
    createNotification(student.id, {
      title: 'Nouvel Exercice',
      message: `Un nouvel exercice a été ajouté pour ${exercise.chapter}`,
      type: 'exercise'
    })
  ));
  
  return exercise;
}

export async function updateExercise(data: Exercise) {
  const existing = await db.get('exercises', data.id);
  if (!existing) {
    throw new Error('Exercise not found');
  }

  const exercise = {
    ...data,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await db.put('exercises', exercise);
  return exercise;
}

export async function getExercises(filters?: { gradeLevel?: string; chapter?: string; lesson?: string }) {
  const exercises = await db.getAll('exercises');
  
  if (!filters) return exercises;
  
  return exercises.filter(exercise => {
    if (filters.gradeLevel && exercise.gradeLevel !== filters.gradeLevel) return false;
    if (filters.chapter && exercise.chapter !== filters.chapter) return false;
    return true;
  });
}

export async function getExerciseById(id: string) {
  return db.get('exercises', id);
}

export async function deleteExercise(id: string) {
  return db.delete('exercises', id);
}