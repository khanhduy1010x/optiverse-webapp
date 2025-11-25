import React from 'react';
import { StreakResponse } from '../../types/streak/streak.types';

interface StreakDisplayProps {
  streakData: StreakResponse | null;
  className?: string;
}

interface StreakItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streakData, className = '' }) => {
  // Extract streak values, default to 0 if streakData is null
  const loginStreak = streakData?.loginStreak || 0;
  const taskStreak = streakData?.taskStreak || 0;
  const flashcardStreak = streakData?.flashcardStreak || 0;

  const streaks: StreakItem[] = [
    {
      label: 'LOGIN',
      value: loginStreak,
      icon: '🔥',
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      label: 'TASKS',
      value: taskStreak,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          <path d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm2 0h14v14H5V5z" />
        </svg>
      ),
      bgColor: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      label: 'CARDS',
      value: flashcardStreak,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 16H7V4h10v14z" />
        </svg>
      ),
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
  ];

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest">Streaks</h3>
      
      {streaks.map((streak, index) => (
        <div
          key={index}
          className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200"
        >
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${streak.bgColor} flex items-center justify-center text-white shadow-sm`}>
            {typeof streak.icon === 'string' ? (
              <span className="text-lg">{streak.icon}</span>
            ) : (
              streak.icon
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              {streak.label}
            </p>
            <p className={`text-xl font-black ${streak.textColor}`}>
              {streak.value} 
            </p>
          </div>

          {/* Days */}
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400 font-medium">days</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StreakDisplay; 