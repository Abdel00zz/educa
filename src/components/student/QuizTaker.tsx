import React, { useState, useEffect } from 'react';
import { MathJax } from 'better-react-mathjax';
import { ChevronLeft, ChevronRight, Check, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveQuizProgress } from '../../lib/quiz';
import { getStudentSession } from '../../lib/student';
import type { QuizData, Question } from '../../types/quiz';

interface QuizTakerProps {
  quiz: QuizData;
  onClose: () => void;
}

export function QuizTaker({ quiz, onClose }: QuizTakerProps) {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string[]>>({});

  // Load saved progress when component mounts
  useEffect(() => {
    const loadProgress = async () => {
      const studentSession = getStudentSession();
      if (!studentSession) return;
      
      const progress = await getQuizProgress(studentSession.id, quiz.id);
      if (progress) {
        setAnswers(progress.answers || {});
        setTimeSpent(progress.timeSpent || 0);
      }
    };
    
    loadProgress();
  }, [quiz.id]);

  // Track time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleClose = () => {
    if (Object.keys(answers).length > 0) {
      setShowSaveDialog(true);
    } else {
      onClose();
    }
  };

  const handleSaveProgress = async () => {
    const studentSession = getStudentSession();
    if (!studentSession) return;
    
    const { id: studentId } = studentSession;
    
    try {
      setIsSubmitting(true);
      await saveQuizProgress(studentId, quiz.id, {
        answers,
        timeSpent,
        isComplete: false,
        score: calculateScore()
      });
      onClose();
    } catch (error) {
      console.error('Error saving progress:', error);
      setError('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = () => {
    const totalQuestions = quiz.questions.length;
    let correctAnswers = 0;

    quiz.questions.forEach(question => {
      if (question.type === 'fillblank') {
        const blanks = blankAnswers[question.id] || [];
        const correctBlanks = (question.answer as string[]).filter((ans, idx) => 
          blanks[idx]?.toLowerCase().trim() === ans.toLowerCase().trim()
        ).length;
        correctAnswers += correctBlanks / (question.answer as string[]).length;
      } else {
        if (answers[question.id]?.toLowerCase() === question.answer.toString().toLowerCase()) {
          correctAnswers++;
        }
      }
    });

    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const handleFinishQuiz = async () => {
    const studentSession = getStudentSession();
    if (!studentSession) return;
    
    const { id: studentId } = studentSession;
    
    try {
      setIsSubmitting(true);
      const score = calculateScore();
      await saveQuizProgress(studentId, quiz.id, {
        answers,
        timeSpent,
        isComplete: true,
        score
      });
      onClose();
      // Force refresh parent component
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('quiz-completed', { 
          detail: { quizId: quiz.id, score } 
        }));
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Une erreur est survenue lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleBlankAnswer = (questionId: string, blankIndex: number, value: string) => {
    const currentAnswers = (answers[questionId] as string[]) || [];
    const newAnswers = [...currentAnswers];
    newAnswers[blankIndex] = value;
    setAnswers(prev => ({
      ...prev, 
      [questionId]: newAnswers
    }));
  };

  const renderQuestion = (question: Question) => {
    const parts = question.text.split(/(\$.*?\$|\[.*?\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathContent = part.slice(1, -1);
        return <MathJax key={i} inline>{`\\(${mathContent}\\)`}</MathJax>;
      }
      if (part.startsWith('[') && part.endsWith(']')) {
        const blankIndex = (question.text.slice(0, question.text.indexOf(part)).match(/\[.*?\]/g) || []).length;
        return (
          <input
            key={i}
            type="text"
            value={(answers[question.id] as string[])?.[blankIndex] || ''}
            onChange={(e) => handleBlankAnswer(question.id, blankIndex, e.target.value)}
            className="mx-1 w-24 px-2 py-1 border border-gray-300 rounded-md text-center"
            placeholder="Your answer"
          />
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 max-w-4xl bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
          <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
          <p className="text-gray-600">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mt-4 mb-8">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        <div className="mb-8">
          {renderQuestion(quiz.questions[currentQuestion])}
        </div>

        {quiz.questions[currentQuestion].type === 'mcq' && (
          <div className="space-y-4">
            {quiz.questions[currentQuestion].options?.map((option, index) => (
              <label
                key={index}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[quiz.questions[currentQuestion].id] === option
                    ? 'bg-indigo-50 border-indigo-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${quiz.questions[currentQuestion].id}`}
                    value={option}
                    checked={answers[quiz.questions[currentQuestion].id] === option}
                    onChange={(e) => handleAnswer(quiz.questions[currentQuestion].id, e.target.value)}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-3">{renderQuestion({ ...quiz.questions[currentQuestion], text: option })}</span>
                </div>
              </label>
            ))}
          </div>
        )}

        {quiz.questions[currentQuestion].type === 'truefalse' && (
          <div className="flex space-x-4">
            {['true', 'false'].map((value) => (
              <label
                key={value}
                className={`flex-1 p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[quiz.questions[currentQuestion].id] === value
                    ? 'bg-indigo-50 border-indigo-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="radio"
                    name={`question-${quiz.questions[currentQuestion].id}`}
                    value={value}
                    checked={answers[quiz.questions[currentQuestion].id] === value}
                    onChange={(e) => handleAnswer(quiz.questions[currentQuestion].id, e.target.value)}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-3 capitalize">{value}</span>
                </div>
              </label>
            ))}
          </div>
        )}

        {quiz.questions[currentQuestion].type === 'fillblank' && (
          <div className="space-y-4">
            {(quiz.questions[currentQuestion].text.match(/\[(.*?)\]/g) || []).map((blank, index) => (
              <div key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                <span className="text-sm text-gray-600">Trou {index + 1}:</span>
                <input
                  type="text"
                  value={blankAnswers[quiz.questions[currentQuestion].id]?.[index] || ''}
                  onChange={(e) => handleBlankAnswer(quiz.questions[currentQuestion].id, index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Votre réponse"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </button>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={() => setShowFinishDialog(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <Check className="h-4 w-4 mr-2" />
              Terminer
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>
      
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Sauvegarder votre progression ?
            </h3>
            <p className="text-gray-600 mb-6">
              Voulez-vous sauvegarder votre progression pour continuer plus tard ?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Ne pas sauvegarder
              </button>
              <button
                onClick={handleSaveProgress}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showFinishDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Terminer le Quiz ?
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir terminer ce quiz ? Une fois terminé :
            </p>
            <ul className="list-disc list-inside mb-6 text-gray-600">
              <li>Le quiz sera marqué comme terminé</li>
              <li>Vous ne pourrez plus le reprendre</li>
              <li>Vos réponses seront définitivement enregistrées</li>
            </ul>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {error}
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowFinishDialog(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                onClick={handleFinishQuiz}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Terminer le Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}