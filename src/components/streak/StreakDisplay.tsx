import React from 'react';
import { StreakResponse } from '../../types/streak/streak.types';

interface StreakDisplayProps {
  streakData: StreakResponse | null;
  className?: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streakData, className = '' }) => {
  if (!streakData) {
    return null;
  }

  // Extract streak values
  const loginStreak = streakData.loginStreak || 0;
  const taskStreak = streakData.taskStreak || 0;
  const flashcardStreak = streakData.flashcardStreak || 0;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex flex-col items-center px-3 py-2 bg-orange-50 rounded-md border border-orange-100">
        <span className="text-xs text-orange-500 font-semibold">LOGIN</span>
        <div className="flex items-center">
          <span className="text-lg font-bold text-orange-600">{loginStreak}</span>
          <span className="ml-1 text-orange-500">🔥</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center px-3 py-2 bg-green-50 rounded-md border border-green-100">
        <span className="text-xs text-green-500 font-semibold">TASKS</span>
        <div className="flex items-center">
          <span className="text-lg font-bold text-green-600">{taskStreak}</span>
          <span className="ml-1 text-green-500">✅</span>
        </div>
      </div>
      
      <div className="flex flex-col items-center px-3 py-2 bg-blue-50 rounded-md border border-blue-100">
        <span className="text-xs text-blue-500 font-semibold">CARDS</span>
        <div className="flex items-center">
          <span className="text-lg font-bold text-blue-600">{flashcardStreak}</span>
          <span className="ml-1 text-blue-500">🎯</span>
        </div>
      </div>
    </div>
  );
};

export default StreakDisplay; 