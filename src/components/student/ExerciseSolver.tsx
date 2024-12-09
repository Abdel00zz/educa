import React, { useState, useEffect } from 'react';
import { MathJax } from 'better-react-mathjax';
import { X, ThumbsUp } from 'lucide-react';
import { saveExerciseFeedback, getExerciseFeedback } from '../../lib/student';
import type { Exercise } from '../../types/exercise';

interface ExerciseSolverProps {
  exercise: Exercise;
  onClose: () => void;
  onFeedback?: (questionId: string, subQuestionId: string | null, difficulty: 'easy' | 'medium' | 'hard') => void;
}

export function ExerciseSolver({ exercise, onClose, onFeedback }: ExerciseSolverProps) {
  const [feedbackState, setFeedbackState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExistingFeedback();
  }, [exercise.id]);

  const loadExistingFeedback = async () => {
    const studentSession = localStorage.getItem('studentSession');
    if (!studentSession) return;
    
    const { id: studentId } = JSON.parse(studentSession);
    
    try {
      const feedback = await getExerciseFeedback(studentId, exercise.id);
      if (feedback?.exerciseFeedback) {
        const feedbackMap: Record<string, string> = {};
        feedback.exerciseFeedback.forEach(f => {
          const key = f.subQuestionId ? `${f.questionId}-${f.subQuestionId}` : f.questionId;
          feedbackMap[key] = f.difficulty;
        });
        setFeedbackState(feedbackMap);
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (questionId: string, subQuestionId: string | null, difficulty: 'easy' | 'medium' | 'hard') => {
    const studentSession = localStorage.getItem('studentSession');
    if (!studentSession) return;
    
    const { id: studentId } = JSON.parse(studentSession);
    const feedbackKey = subQuestionId ? `${questionId}-${subQuestionId}` : questionId;
    
    try {
      setFeedbackState(prev => ({ ...prev, [feedbackKey]: difficulty }));
      
      await saveExerciseFeedback(studentId, exercise.id, {
        questionId,
        subQuestionId: subQuestionId || undefined,
        difficulty
      });

      if (onFeedback) {
        onFeedback(questionId, subQuestionId, difficulty);
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

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
  
  const DifficultyButtons = ({ questionId, subQuestionId = null }) => {
    const feedbackKey = subQuestionId ? `${questionId}-${subQuestionId}` : questionId;
    const currentDifficulty = feedbackState[feedbackKey];
    
    return (
      <div className="flex gap-2 ml-auto">
        <button
          onClick={() => handleFeedback(questionId, subQuestionId, 'easy')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            currentDifficulty === 'easy'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600'
          }`}
        >
          Facile
        </button>
        <button
          onClick={() => handleFeedback(questionId, subQuestionId, 'medium')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            currentDifficulty === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-50 text-gray-600 hover:bg-yellow-50 hover:text-yellow-600'
          }`}
        >
          Moyen
        </button>
        <button
          onClick={() => handleFeedback(questionId, subQuestionId, 'hard')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            currentDifficulty === 'hard'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          Difficile
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 max-w-4xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Exercise</h2>
            <p className="text-gray-600">
              {exercise.gradeLevel} - {exercise.lesson}
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
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1 flex items-start justify-between">
                  <div>
                    <span className="font-bold text-lg mr-2">{question.number}.</span>
                    <span className="text-lg">{renderText(question.text)}</span>
                  </div>
                  {question.subQuestions.length === 0 && (
                    <DifficultyButtons questionId={question.id} />
                  )}
                </div>
              </div>

              {question.subQuestions.length > 0 && (
                <div className="ml-8 space-y-6">
                  {question.subQuestions.map((subQ) => (
                    <div key={subQ.id}>
                      <div className="mb-2 flex items-start">
                        <div className="flex-1 flex items-start justify-between">
                          <div>
                            <span className="font-medium mr-2">{subQ.label})</span>
                            {renderText(subQ.text)}
                          </div>
                          <DifficultyButtons questionId={question.id} subQuestionId={subQ.id} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={onClose}
          >
            <span className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Terminer
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}