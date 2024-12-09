import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, CheckCircle, Clock, GraduationCap, Brain, Search, Filter } from 'lucide-react';
import { Navigation } from '../components/shared/Navigation';
import { getQuizzes } from '../lib/quiz';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../lib/notifications';
import { getMessages, markMessageAsRead } from '../lib/messages';
import { getExercises } from '../lib/exercise';
import { getStudentStats } from '../lib/stats';
import { QuizCard } from '../components/student/QuizCard';
import { ExerciseCard } from '../components/student/ExerciseCard';
import { QuizTaker } from '../components/student/QuizTaker';
import { ExerciseSolver } from '../components/student/ExerciseSolver';
import type { QuizData } from '../types/quiz';
import type { Exercise } from '../types/exercise';

export function StudentDashboard() {
  const navigate = useNavigate();
  
  useLayoutEffect(() => {
    const studentSession = localStorage.getItem('studentSession');
    if (!studentSession) {
      navigate('/login');
    }
  }, [navigate]);

  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({
    completedQuizzes: 0,
    totalQuizzes: 0,
    completionRate: 0,
    averageScore: 0,
  });
  const [activeTab, setActiveTab] = useState<'quizzes' | 'exercises'>('quizzes');
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const handleExerciseFeedback = async (
    questionId: string,
    subQuestionId: string | null,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => {
    if (!activeExercise) return;

    const updatedExercise = {
      ...activeExercise,
      questions: activeExercise.questions.map(q => {
        if (q.id === questionId) {
          if (subQuestionId) {
            return {
              ...q,
              subQuestions: q.subQuestions.map(sq =>
                sq.id === subQuestionId ? { ...sq, difficulty } : sq
              ),
            };
          }
          return { ...q, difficulty };
        }
        return q;
      }),
    };

    setActiveExercise(updatedExercise);
    // TODO: Save feedback to database
  };
  const [selectedChapter, setSelectedChapter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadContent();
    const interval = setInterval(loadContent, 60000);
    
    // Listen for quiz completion events
    const handleQuizComplete = () => {
      loadContent();
    };
    window.addEventListener('quiz-completed', handleQuizComplete);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('quiz-completed', handleQuizComplete);
    };
  }, []);

  const loadContent = async () => {
    const studentSession = localStorage.getItem('studentSession');
    if (!studentSession) {
      navigate('/login');
      return;
    }
    const { id: studentId } = JSON.parse(studentSession);

    const [quizData, exerciseData, statsData, notificationData, messageData] = await Promise.all([
      getQuizzes(),
      getExercises(),
      getStudentStats(studentId),
      getNotifications(studentId),
      getMessages(studentId)
    ]);
    
    setQuizzes(quizData);
    setExercises(exerciseData);
    setStats(statsData);
    setNotifications(notificationData);
    setMessages(messageData);
  };

  const handleClearNotification = async (id: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkMessageRead = async (id: string) => {
    await markMessageAsRead(id);
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, read: true } : m
    ));
  };

  const chapters = [
    'Ordre dans R',
    'Trigonometrie',
    'Droite'
  ];

  const filteredContent = (activeTab === 'quizzes' ? quizzes : exercises)
    .filter(item => {
      const matchesChapter = !selectedChapter || item.chapter === selectedChapter;
      const matchesSearch = !searchTerm || 
        item.chapter.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesChapter && matchesSearch;
    });

  const handleQuizSubmit = async (answers: Record<string, string>) => {
    // TODO: Save quiz answers and update progress
    setActiveQuiz(null);
    await loadContent(); // Refresh stats
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        userType="student" 
        onRefresh={loadContent}
        notifications={notifications}
        messages={messages}
        onClearNotification={handleClearNotification}
        onMarkMessageRead={handleMarkMessageRead}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Quiz Complétés</h3>
                <p className="text-2xl font-semibold text-indigo-600">
                  {stats.completedQuizzes}/{stats.totalQuizzes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Taux de Réussite</h3>
                <p className="text-2xl font-semibold text-green-600">
                  {stats.completionRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <GraduationCap className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Score Moyen</h3>
                <p className="text-2xl font-semibold text-yellow-600">
                  {stats.averageScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Temps Total</h3>
                <p className="text-2xl font-semibold text-purple-600">
                  {Math.floor(stats.completedQuizzes * 15)}min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'quizzes'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Quiz ({quizzes.length})
              </button>
              <button
                onClick={() => setActiveTab('exercises')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'exercises'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Exercices ({exercises.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Tous les chapitres</option>
                {chapters.map(chapter => (
                  <option key={chapter} value={chapter}>{chapter}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.length > 0 ? (
            filteredContent.map((item) => (
              activeTab === 'quizzes' ? (
                <QuizCard
                  key={item.id}
                  quiz={item}
                  onStart={setActiveQuiz}
                />
              ) : (
                <ExerciseCard
                  key={item.id}
                  exercise={item}
                  onStart={setActiveExercise}
                />
              )
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Book className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun contenu</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'quizzes' 
                    ? 'Aucun quiz disponible pour le moment'
                    : 'Aucun exercice disponible pour le moment'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {activeQuiz && (
        <QuizTaker
          quiz={activeQuiz}
          onSubmit={handleQuizSubmit}
          onClose={() => setActiveQuiz(null)}
        />
      )}
      
      {activeExercise && (
        <ExerciseSolver
          exercise={activeExercise}
          onFeedback={handleExerciseFeedback}
          onClose={() => setActiveExercise(null)}
        />
      )}
    </div>
  );
}