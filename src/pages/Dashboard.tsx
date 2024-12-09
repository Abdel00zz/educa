import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Activity, GraduationCap, Plus, TrendingUp, Clock, Award, Settings } from 'lucide-react';
import { Navigation } from '../components/shared/Navigation';
import { StatCard } from '../components/dashboard/StatCard';
import { MessageSender } from '../components/dashboard/MessageSender';
import { QuizList } from '../components/dashboard/QuizList';
import { ClassChapterManager } from '../components/dashboard/ClassChapterManager';
import { GlobalFeedbackStats } from '../components/dashboard/GlobalFeedbackStats';
import { StudentList } from '../components/dashboard/StudentList';
import { ExerciseList } from '../components/dashboard/ExerciseList';
import { QuizEditor } from '../components/quiz/QuizEditor';
import { ExerciseEditor } from '../components/exercise/ExerciseEditor';
import { getAdminStats } from '../lib/stats';
import { getExercises } from '../lib/exercise';
import { getStudents } from '../lib/stats';
import type { Statistics } from '../types';
import type { Student } from '../types';
import type { QuizData } from '../types/quiz';
import type { Exercise } from '../types/exercise';

type EditorState = {
  type: 'none' | 'quiz' | 'exercise';
  data?: QuizData | Exercise;
};

export function Dashboard() {
  const navigate = useNavigate();
  
  useLayoutEffect(() => {
    const isAdmin = localStorage.getItem('adminSession');
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [navigate]);

  const [activeSection, setActiveSection] = useState<'students' | 'quizzes' | 'exercises' | 'feedback'>('students');
  const [editor, setEditor] = useState<EditorState>({ type: 'none' });
  const [showClassManager, setShowClassManager] = useState(false);
  const [showMessageSender, setShowMessageSender] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [stats, setStats] = useState<Statistics>({
    totalStudents: 0,
    activeQuizzes: 0,
    activeExercises: 0,
    completionRate: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    weeklyActiveUsers: 0,
    monthlyGrowth: 0
  });
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadStats = async () => {
    const [newStats, studentList, exerciseList] = await Promise.all([
      getAdminStats(),
      getStudents(),
      getExercises()
    ]);
    setStats(newStats);
    setStudents(studentList);
    setExercises(exerciseList);
  };

  const handleCreateQuiz = () => {
    setEditor({ type: 'quiz' });
  };

  const handleCreateExercise = () => {
    setEditor({ type: 'exercise' });
  };

  const handleEditQuiz = (quiz: QuizData) => {
    setEditor({ type: 'quiz', data: quiz });
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditor({ type: 'exercise', data: exercise });
  };

  const handleCloseEditor = () => {
    setEditor({ type: 'none' });
    loadStats();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation 
        userType="admin" 
        onRefresh={loadStats}
        onManageClasses={() => setShowClassManager(true)}
        onOpenMessageSender={() => setShowMessageSender(true)}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de Bord Administrateur</h1>
        
        <div className="mb-6 text-sm text-gray-500">
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Élèves"
            value={stats.totalStudents}
            icon={Users}
          />
          <StatCard
            title="Quiz Actifs"
            value={stats.activeQuizzes}
            icon={BookOpen}
          />
          <StatCard
            title="Taux de Complétion"
            value={`${stats.completionRate}%`}
            icon={Activity}
            trend={stats.monthlyGrowth}
          />
          <StatCard
            title="Score Moyen"
            value={`${stats.averageScore}%`}
            icon={GraduationCap}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Exercices Actifs"
            value={stats.activeExercises}
            icon={Award}
          />
          <StatCard
            title="Utilisateurs Actifs"
            value={stats.weeklyActiveUsers}
            icon={TrendingUp}
            subtitle="Cette semaine"
          />
          <StatCard
            title="Temps Total"
            value={`${Math.floor(stats.totalTimeSpent / 60)}h`}
            icon={Clock}
            subtitle="Tous les élèves"
          />
          <StatCard
            title="Croissance"
            value={`${stats.monthlyGrowth}%`}
            icon={TrendingUp}
            trend={stats.monthlyGrowth}
            subtitle="Ce mois"
          />
        </div>

        <div className="flex justify-between items-center mb-8">
          <div className="grid grid-cols-4 gap-4 flex-1">
            <button
              onClick={() => setActiveSection('students')}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeSection === 'students'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="font-medium">Gestion des Élèves</span>
            </button>

            <button
              onClick={() => setActiveSection('quizzes')}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeSection === 'quizzes'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <BookOpen className="h-6 w-6 mb-2" />
              <span className="font-medium">Gestion des Quiz</span>
            </button>

            <button
              onClick={() => setActiveSection('exercises')}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeSection === 'exercises'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <Activity className="h-6 w-6 mb-2" />
              <span className="font-medium">Gestion des Exercices</span>
            </button>

            <button
              onClick={() => setActiveSection('feedback')}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeSection === 'feedback'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="font-medium">Statistiques Globales</span>
            </button>
          </div>

        </div>

        {activeSection === 'students' && (
          <StudentList 
            students={students} 
            onUpdate={loadStats}
          />
        )}

        {activeSection === 'quizzes' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleCreateQuiz}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Quiz
              </button>
            </div>
            <QuizList onEdit={handleEditQuiz} />
          </div>
        )}

        {activeSection === 'exercises' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleCreateExercise}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Exercice
              </button>
            </div>
            <ExerciseList onEdit={handleEditExercise} />
          </div>
        )}

        {activeSection === 'feedback' && (
          <GlobalFeedbackStats
            exercises={exercises}
            students={students}
          />
        )}
      </div>

      {editor.type === 'quiz' && (
        <QuizEditor
          onClose={handleCloseEditor}
          initialData={editor.data as QuizData}
        />
      )}
      {editor.type === 'exercise' && (
        <ExerciseEditor
          onClose={handleCloseEditor}
          initialData={editor.data as Exercise}
        />
      )}
      
      {showClassManager && (
        <ClassChapterManager
          onClose={() => setShowClassManager(false)}
        />
      )}
      
      {showMessageSender && (
        <MessageSender
          students={students}
          onClose={() => setShowMessageSender(false)}
        />
      )}
    </div>
  );
}