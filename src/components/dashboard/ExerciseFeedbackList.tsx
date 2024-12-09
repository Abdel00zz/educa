import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BarChart2, Book } from 'lucide-react';
import { ExerciseFeedbackView } from './ExerciseFeedbackView';
import type { Exercise } from '../../types/exercise';
import type { Student } from '../../types';

interface ExerciseFeedbackListProps {
  exercises: Exercise[];
  students: Student[];
}

export function ExerciseFeedbackList({ exercises, students }: ExerciseFeedbackListProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);

  // Group exercises by chapter
  const exercisesByChapter = exercises.reduce((acc, exercise) => {
    const chapter = exercise.chapter;
    if (!acc[chapter]) {
      acc[chapter] = [];
    }
    acc[chapter].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const toggleChapter = (chapter: string) => {
    setExpandedChapters(prev =>
      prev.includes(chapter)
        ? prev.filter(c => c !== chapter)
        : [...prev, chapter]
    );
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center">
          <Book className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Feedback des Exercices</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {Object.entries(exercisesByChapter).map(([chapter, chapterExercises]) => (
            <div key={chapter}>
              <button
                onClick={() => toggleChapter(chapter)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center">
                  {expandedChapters.includes(chapter) ? (
                    <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                  )}
                  <span className="ml-2 font-medium text-gray-900 group-hover:text-indigo-600">{chapter}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({chapterExercises.length} exercices)
                  </span>
                </div>
              </button>
              
              {expandedChapters.includes(chapter) && (
                <div className="bg-gray-50 px-6 py-3">
                  <div className="grid gap-2">
                    {chapterExercises
                      .sort((a, b) => {
                        const aNum = parseInt(a.id.split('-')[1]);
                        const bNum = parseInt(b.id.split('-')[1]);
                        return aNum - bNum;
                      })
                      .map(exercise => (
                        <button
                          key={exercise.id}
                          onClick={() => setSelectedExercise(exercise)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg hover:shadow-md transition-all hover:bg-indigo-50 group"
                        >
                          <div className="flex items-center">
                            <span className="text-gray-900">
                              Exercice {exercise.id.split('-')[1]}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">
                              ({exercise.questions.length} questions)
                            </span>
                          </div>
                          <div className="flex items-center text-gray-400 group-hover:text-indigo-600">
                            <BarChart2 className="h-5 w-5 transform group-hover:scale-110 transition-transform" />
                          </div>
                        </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedExercise && (
        <ExerciseFeedbackView
          exercise={selectedExercise}
          students={students}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </>
  );
}