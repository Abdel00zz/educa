import React from 'react';
import { BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import type { Exercise } from '../../types/exercise';

interface ExerciseCardProps {
  exercise: Exercise;
  onStart: (exercise: Exercise) => void;
}

export function ExerciseCard({ exercise, onStart }: ExerciseCardProps) {
  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <GraduationCap className="h-4 w-4 mr-1" />
              <span>Niveau {exercise.gradeLevel}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{exercise.chapter}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="prose prose-sm">
            <p className="text-gray-600 line-clamp-3">
              {exercise.statement}
            </p>
          </div>
          
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-gray-600">Exercice {exercise.id.split('-')[1]}</span>
            <span className="font-medium">{exercise.questions.length}</span>
          </div>
        </div>

        <button
          onClick={() => onStart(exercise)}
          className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        > 
          <ArrowRight className="h-4 w-4 mr-2" />
          Voir l'Exercice
        </button>
      </div>
    </div>
  );
}