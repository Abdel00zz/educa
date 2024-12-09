import React, { useState, useEffect } from 'react';
import { Clock, Book, GraduationCap, PlayCircle, ArrowRightCircle, Lock } from 'lucide-react';
import { getQuizProgress } from '../../lib/quiz';
import { getStudentSession } from '../../lib/student';
import type { QuizData } from '../../types/quiz';

interface QuizCardProps {
  quiz: QuizData;
  onStart: (quiz: QuizData) => void;
}

export function QuizCard({ quiz, onStart }: QuizCardProps) {
  const [quizStatus, setQuizStatus] = useState<{
    hasProgress: boolean;
    isComplete: boolean;
    score?: number;
    lastAttempt?: string;
  }>({ hasProgress: false, isComplete: false });

  useEffect(() => {
    checkProgress();
  }, [quiz.id]);

  const checkProgress = async () => {
    const studentSession = getStudentSession();
    if (!studentSession) return;
    
    const progress = await getQuizProgress(studentSession.id, quiz.id);
    setQuizStatus({
      hasProgress: !!progress,
      isComplete: progress?.isComplete || false,
      score: progress?.score,
      lastAttempt: progress?.completedAt
    });
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <GraduationCap className="h-4 w-4 mr-1" />
              <span>Niveau {quiz.gradeLevel}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Book className="h-4 w-4 mr-1" />
              <span>{quiz.chapter}</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>{quiz.questions.length * 2}min</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Niveau</span>
            <span className="font-medium">{quiz.gradeLevel}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Chapitre</span>
            <span className="font-medium">{quiz.chapter}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2 mt-2">
            <span className="text-gray-600">Questions</span>
            <span className="font-medium">{quiz.questions.length}</span>
          </div>
        </div>

        <button
          onClick={() => onStart(quiz)}
          disabled={quizStatus.isComplete}
          className={`w-full inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md ${
            quizStatus.isComplete 
              ? 'text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed'
              : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {quizStatus.isComplete ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Quiz Terminé
            </>
          ) : quizStatus.hasProgress ? (
            <>
              <ArrowRightCircle className="h-4 w-4 mr-2" />
              Continuer le Quiz
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-2" />
              Commencer le Quiz
            </>
          )}
        </button>
        {quizStatus.isComplete && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-500">Score final:</span>
            <span className={`font-medium px-2 py-1 rounded-full ${
              quizStatus.score >= 80 ? 'bg-green-100 text-green-700' :
              quizStatus.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {quizStatus.score}%
            </span>
          </div>
        )}
        {quizStatus.hasProgress && !quizStatus.isComplete && quizStatus.lastAttempt && (
          <p className="mt-2 text-xs text-center text-gray-500">
            Dernière activité: {new Date(quizStatus.lastAttempt).toLocaleString()}
          </p>
        )}
        {quizStatus.isComplete && (
          <p className="mt-2 text-xs text-center text-gray-500">
            Quiz terminé le {new Date(quizStatus.lastAttempt!).toLocaleString()} avec un score de {quizStatus.score}%
          </p>
        )}
      </div>
    </div>
  );
}