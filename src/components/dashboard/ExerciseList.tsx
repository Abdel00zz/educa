import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Eye, BarChart2 } from 'lucide-react';
import { getExercises, deleteExercise } from '../../lib/exercise';
import { getStudents } from '../../lib/stats';
import { ExercisePreview } from '../exercise/ExercisePreview';
import { ExerciseFeedbackList } from './ExerciseFeedbackList';
import type { Exercise } from '../../types/exercise';
import type { Student } from '../../types';

interface ExerciseListProps {
  onEdit: (exercise: Exercise) => void;
}

export function ExerciseList({ onEdit }: ExerciseListProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'feedback'>('list');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const [data, studentData] = await Promise.all([
      getExercises(),
      getStudents()
    ]);
    setExercises(data);
    setStudents(studentData);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this exercise?')) {
      await deleteExercise(id);
      await loadExercises();
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'list'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Liste des Exercices
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'feedback'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Feedback des Élèves
            </button>
          </div>
        </div>

        {activeTab === 'list' ? (
          <div className="divide-y divide-gray-200">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Exercice {exercise.id.split('-')[1]} - {exercise.gradeLevel} - {exercise.chapter}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {exercise.questions.length} questions
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setPreviewExercise(exercise)}
                      className="text-gray-400 hover:text-gray-500"
                      title="Preview"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEdit(exercise)}
                      className="text-gray-400 hover:text-gray-500"
                      title="Edit"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="text-red-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {exercises.length === 0 && (
              <div className="px-6 py-4 text-center text-gray-500">
                No exercises created yet
              </div>
            )}
          </div>
        ) : (
          <ExerciseFeedbackList
            exercises={exercises}
            students={students}
          />
        )}
      </div>

      {previewExercise && (
        <ExercisePreview
          exercise={previewExercise}
          onClose={() => setPreviewExercise(null)}
        />
      )}
    </>
  );
}