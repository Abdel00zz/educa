import React, { useState } from 'react';
import { X, Award, Clock, BarChart2, ThumbsUp, BookOpen, TrendingUp, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { MathJax } from 'better-react-mathjax';
import { DifficultyBar } from './DifficultyBar';
import type { Student } from '../../types';

interface StudentStatsProps {
  student: Student;
  onClose: () => void;
}

export function StudentStats({ student, onClose }: StudentStatsProps) {
  const [showFeedback, setShowFeedback] = useState(true);
  const [showQuizResults, setShowQuizResults] = useState(true);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 max-w-6xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
            <div className="mt-1 space-y-1">
              <p className="text-gray-600">{student.email}</p>
              <p className="text-gray-600">Niveau: {student.gradeLevel}</p>
              <p className="text-gray-500 text-sm">
                Inscrit le: {new Date(student.joinedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Score Global</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {student.progress?.averageScore || 0}%
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {student.progress?.completedExercises || 0} exercices complétés
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Temps d'Étude</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.floor((student.progress?.timeSpent || 0) / 60)}h {(student.progress?.timeSpent || 0) % 60}m
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Dernière activité: {student.lastLogin ? new Date(student.lastLogin).toLocaleString() : 'Jamais'}
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Progression</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {student.progress?.completionRate || 0}%
                </p>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-yellow-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${student.progress?.completionRate || 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Quiz Complétés</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {student.progress?.completedQuizzes || 0}/{student.progress?.totalQuizzes || 0}
                </p>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span className="flex items-center">
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                {student.progress?.successfulQuizzes || 0} réussis
              </span>
              <span className="flex items-center">
                <XCircle className="h-3 w-3 text-red-500 mr-1" />
                {student.progress?.failedQuizzes || 0} échoués
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-white">
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="flex items-center justify-between w-full"
              >
                <BarChart2 className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium">Feedback des Exercices</h3>
                {showFeedback ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <p className="text-sm text-gray-500 mt-1">Évaluation de la difficulté par l'élève</p>
            </div>
            <div className={`transition-all duration-300 ${showFeedback ? 'p-6' : 'h-0 p-0 overflow-hidden'}`}>
              {student.progress?.exerciseFeedback?.length ? (
                <div className="space-y-4">
                  {student.progress.exerciseFeedback.map((feedback, index) => (
                    <div 
                      key={`${feedback.questionId}-${feedback.timestamp}`} 
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          Exercice {feedback.exerciseNumber} - Question {feedback.questionNumber}
                          {feedback.subQuestionId && ` (${feedback.subQuestionId})`}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          feedback.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          feedback.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {feedback.difficulty === 'easy' ? 'Facile' :
                           feedback.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(feedback.timestamp).toLocaleString('fr-FR', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucun feedback disponible
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-white">
              <button
                onClick={() => setShowQuizResults(!showQuizResults)}
                className="flex items-center justify-between w-full"
              >
                <Award className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium">Résultats des Quiz</h3>
                {showQuizResults ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <p className="text-sm text-gray-500 mt-1">Historique des performances</p>
            </div>
            <div className={`transition-all duration-300 ${showQuizResults ? 'p-6' : 'h-0 p-0 overflow-hidden'}`}>
              {student.progress?.quizResults?.length ? (
                <div className="space-y-4">
                  {student.progress.quizResults.map((result, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{result.quizTitle}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          !result.isComplete ? 'bg-gray-100 text-gray-700' :
                          result.score >= 80 ? 'bg-green-100 text-green-700' :
                          result.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {!result.isComplete ? 'Non terminé' : `${result.score}%`}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Chapitre: {result.chapter}</span>
                        <span>{new Date(result.completedAt).toLocaleString()}</span>
                      </div>
                      {result.isComplete && <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            result.score >= 80 ? 'bg-green-500' :
                            result.score >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${result.score}%` }}
                        />
                      </div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucun quiz complété
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}