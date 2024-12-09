import React from 'react';
import { MathJax } from 'better-react-mathjax';
import { X } from 'lucide-react';
import { DifficultyBar } from './DifficultyBar';
import type { Exercise } from '../../types/exercise';
import type { Student } from '../../types';

interface ExerciseFeedbackViewProps {
  exercise: Exercise;
  students: Student[];
  onClose: () => void;
}

export function ExerciseFeedbackView({ exercise, students, onClose }: ExerciseFeedbackViewProps) {
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

  const getFeedbackStats = (questionId: string, subQuestionId?: string) => {
    let easy = 0, medium = 0, hard = 0, total = 0;

    students.forEach(student => {
      const feedback = student.progress?.exerciseFeedback?.find(f => {
        if (subQuestionId) {
          return f.questionId === questionId && f.subQuestionId === subQuestionId;
        }
        return f.questionId === questionId && !f.subQuestionId;
      });

      if (feedback) {
        total++;
        if (feedback.difficulty === 'easy') easy++;
        if (feedback.difficulty === 'medium') medium++;
        if (feedback.difficulty === 'hard') hard++;
      }
    });

    return { easy, medium, hard, total };
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 max-w-4xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Exercice {exercise.id.split('-')[1]}</h2>
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

        {exercise.statement && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="prose prose-indigo">
              {renderText(exercise.statement)}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {exercise.questions.map((question) => (
            <div key={question.id} className="border-b pb-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <span className="font-bold text-lg mr-2">{question.number}.</span>
                    <span className="text-lg">{renderText(question.text)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Niveau de difficulté</h4>
                <DifficultyBar stats={getFeedbackStats(question.id)} showLegend={true} />
                </div>
              </div>

              {question.subQuestions.length > 0 && (
                <div className="ml-8 space-y-4">
                  {question.subQuestions.map((subQ) => (
                    <div key={subQ.id} className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <span className="font-medium mr-2">{subQ.label})</span>
                          {renderText(subQ.text)}
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Niveau de difficulté</h4>
                      <DifficultyBar stats={getFeedbackStats(question.id, subQ.id)} showLegend={true} />
                      </div>
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