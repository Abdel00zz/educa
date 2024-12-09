import React from 'react';

interface DifficultyStats {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

interface DifficultyBarProps {
  stats: DifficultyStats;
  showLegend?: boolean;
}

export function DifficultyBar({ stats, showLegend = false }: DifficultyBarProps) {
  if (stats.total === 0) {
    return <div className="text-sm text-gray-500">Aucun feedback</div>;
  }

  const percentages = {
    easy: (stats.easy / stats.total) * 100,
    medium: (stats.medium / stats.total) * 100,
    hard: (stats.hard / stats.total) * 100,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-green-500 transition-all duration-300" 
              style={{ width: `${percentages.easy}%` }}
            />
            <div 
              className="bg-yellow-500 transition-all duration-300" 
              style={{ width: `${percentages.medium}%` }}
            />
            <div 
              className="bg-red-500 transition-all duration-300" 
              style={{ width: `${percentages.hard}%` }}
            />
          </div>
        </div>
        <div className="text-sm text-gray-600 min-w-[80px] text-right">
          {stats.total} {stats.total > 1 ? 'réponses' : 'réponse'}
        </div>
      </div>

      {showLegend && (
        <div className="flex justify-between text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
            <span>Facile ({Math.round(percentages.easy)}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1" />
            <span>Moyen ({Math.round(percentages.medium)}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-1" />
            <span>Difficile ({Math.round(percentages.hard)}%)</span>
          </div>
        </div>
      )}
    </div>
  );
}