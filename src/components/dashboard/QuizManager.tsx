import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import type { Quiz } from '../../types';

interface QuizManagerProps {
  quizzes: Quiz[];
  onCreateQuiz: () => void;
}

export function QuizManager({ quizzes, onCreateQuiz }: QuizManagerProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 text-gray-400" />
          <h2 className="ml-2 text-lg font-medium text-gray-900">Quiz Management</h2>
        </div>
        <button
          onClick={onCreateQuiz}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Quiz
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{quiz.title}</p>
                <p className="text-sm text-gray-500">{quiz.description}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {quiz.questions} questions
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}