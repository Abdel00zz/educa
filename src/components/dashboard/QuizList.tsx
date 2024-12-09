import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { getQuizzes, deleteQuiz } from '../../lib/quiz';
import { QuizPreview } from '../quiz/QuizPreview';
import type { QuizData } from '../../types/quiz';

interface QuizListProps {
  onEdit: (quiz: QuizData) => void;
}

export function QuizList({ onEdit }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [previewQuiz, setPreviewQuiz] = useState<QuizData | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    const data = await getQuizzes();
    setQuizzes(data);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      await deleteQuiz(id);
      await loadQuizzes();
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quiz Management</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{quiz.title}</h3>
                  <p className="text-sm text-gray-500">
                    Grade {quiz.gradeLevel} - {quiz.lesson}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {quiz.questions.length} questions
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setPreviewQuiz(quiz)}
                    className="text-gray-400 hover:text-gray-500"
                    title="Preview"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEdit(quiz)}
                    className="text-gray-400 hover:text-gray-500"
                    title="Edit"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="text-red-400 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {quizzes.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500">
              No quizzes created yet
            </div>
          )}
        </div>
      </div>

      {previewQuiz && (
        <QuizPreview
          quiz={previewQuiz}
          onClose={() => setPreviewQuiz(null)}
        />
      )}
    </>
  );
}