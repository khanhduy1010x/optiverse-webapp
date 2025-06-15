import React from 'react';
import { useFocusTimer } from '../../hooks/focus-timer/useFocusTimer.hook';

export default function FocusTimerPage() {
  const {
    seconds,
    isFocusTime,
    isRunning,
    startSession,
    stopSession,
    formatTime,
  } = useFocusTimer();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white text-black border border-gray-200 rounded-2xl w-64 h-64 flex items-center justify-center mb-6 shadow-md">
        <img src="logo.png" alt="Optiverse" className="w-40 h-40" />
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-md text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          {isFocusTime ? '⏳ Focus Time' : '☕ Break Time'}
        </h2>
        <div className="text-5xl font-bold text-blue-600 mb-4">
          {formatTime(seconds)}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={isRunning ? stopSession : startSession}
            className={`px-6 py-2 rounded-md text-white transition-colors ${isRunning
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
              }`}
          >
            {isRunning ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  );
}
