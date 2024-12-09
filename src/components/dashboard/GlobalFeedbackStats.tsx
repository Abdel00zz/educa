import React from 'react';
import { BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';
import { DifficultyBar } from './DifficultyBar';
import type { Exercise } from '../../types/exercise';
import type { Student } from '../../types';

interface GlobalFeedbackStatsProps {
  exercises: Exercise[];
  students: Student[];
}

export function GlobalFeedbackStats({ exercises, students }: GlobalFeedbackStatsProps) {
  const calculateGlobalStats = () => {
    let totalEasy = 0, totalMedium = 0, totalHard = 0, totalResponses = 0;
    let chapterStats: Record<string, { easy: number; medium: number; hard: number; total: number }> = {};

    students.forEach(student => {
      student.progress?.exerciseFeedback?.forEach(feedback => {
        totalResponses++;
        
        const exercise = exercises.find(e => 
          e.questions.some(q => q.id === feedback.questionId)
        );
        
        if (exercise) {
          if (!chapterStats[exercise.chapter]) {
            chapterStats[exercise.chapter] = { easy: 0, medium: 0, hard: 0, total: 0 };
          }
          
          chapterStats[exercise.chapter].total++;
          
          if (feedback.difficulty === 'easy') {
            totalEasy++;
            chapterStats[exercise.chapter].easy++;
          } else if (feedback.difficulty === 'medium') {
            totalMedium++;
            chapterStats[exercise.chapter].medium++;
          } else if (feedback.difficulty === 'hard') {
            totalHard++;
            chapterStats[exercise.chapter].hard++;
          }
        }
      });
    });

    return {
      global: { easy: totalEasy, medium: totalMedium, hard: totalHard, total: totalResponses },
      chapters: chapterStats
    };
  };

  const stats = calculateGlobalStats();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Statistiques Globales des Feedback</h3>
        <BarChart2 className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Difficulté Globale</h4>
          <DifficultyBar stats={stats.global} showLegend={true} />
        </div>

        <div className="border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Par Chapitre</h4>
          <div className="space-y-4">
            {Object.entries(stats.chapters).map(([chapter, chapterStats]) => (
              <div key={chapter}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{chapter}</span>
                  <span className="text-xs text-gray-500">{chapterStats.total} réponses</span>
                </div>
                <DifficultyBar stats={chapterStats} />
              </div>
            ))}
          </div>
        </div>

        {stats.global.total === 0 && (
          <div className="flex items-center justify-center text-gray-500 py-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Aucune donnée disponible</span>
          </div>
        )}
      </div>
    </div>
  );
}