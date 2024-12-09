import React from 'react';
import { X } from 'lucide-react';
import { MathJax } from 'better-react-mathjax';
import { getExerciseNumber } from '../../lib/exercise';
import type { Exercise } from '../../types/exercise';

interface ExercisePreviewProps {
  exercise: Exercise;
  onClose: () => void;
}

export function ExercisePreview({ exercise, onClose }: ExercisePreviewProps) {
  const renderText = (text: string) => {
    const parts = text.split(/(\$.*?\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathContent = part.slice(1, -1);
        return <MathJax key={i} inline>{`\\(${mathContent}\\)`}</MathJax>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 max-w-4xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Exercice {getExerciseNumber(exercise)}</h2>
            <p className="text-gray-600">
              {exercise.gradeLevel} - {exercise.chapter}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          {exercise.statement && (
            <div className="mb-6 text-lg font-serif">
              {renderText(exercise.statement)}
            </div>
          )}
        </div>

        <div className="space-y-8 font-serif">
          {exercise.questions.map((question) => (
            <div key={question.id}>
              <div className="mb-4">
                <span className="font-bold mr-2">{question.number}.</span>
                {renderText(question.text)}
              </div>

              {question.subQuestions.length > 0 && (
                <div className="ml-8 space-y-4">
                  {question.subQuestions.map((subQ) => (
                    <div key={subQ.id}>
                      <span className="font-medium mr-2">{subQ.label})</span>
                      {renderText(subQ.text)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}