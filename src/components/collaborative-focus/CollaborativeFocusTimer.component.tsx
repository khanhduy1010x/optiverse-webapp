/**
 * CollaborativeFocusTimer Component
 * Component hiển thị đồng hồ đếm thời gian cộng tác với Firebase sync
 */

import React, { useState, useEffect } from 'react';
import {
  FirebaseFocusSession,
  FocusSessionStatus,
} from '../../types/collaborative-focus/collaborative-focus.types';

interface CollaborativeFocusTimerProps {
  session: FirebaseFocusSession;
  onStart: () => void;
  onPause: (currentTime: number) => void;
  onResume: () => void;
  onComplete: () => void;
  onLeave: () => void;
  isCreator: boolean;
}

export const CollaborativeFocusTimer: React.FC<
  CollaborativeFocusTimerProps
> = ({ session, onStart, onPause, onResume, onComplete, onLeave, isCreator }) => {
  const [currentTime, setCurrentTime] = useState(0);

  // Calculate current time based on session status
  useEffect(() => {
    if (session.status === FocusSessionStatus.ACTIVE && session.startedAt) {
      // Active: calculate elapsed time from startedAt
      const baseTime = session.currentTime || 0;
      const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
      const totalTime = baseTime + elapsed;
      
      setCurrentTime(Math.min(totalTime, session.duration));
    } else {
      // Not active: use stored currentTime
      setCurrentTime(session.currentTime || 0);
    }
  }, [session.status, session.startedAt, session.currentTime, session.duration]);

  // Timer tick for active sessions
  useEffect(() => {
    if (session.status === FocusSessionStatus.ACTIVE && session.startedAt) {
      const interval = setInterval(() => {
        const baseTime = session.currentTime || 0;
        const elapsed = Math.floor((Date.now() - session.startedAt!) / 1000);
        const totalTime = baseTime + elapsed;
        
        setCurrentTime(Math.min(totalTime, session.duration));

        // Auto complete when time is up
        if (totalTime >= session.duration && isCreator) {
          onComplete();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session.status, session.startedAt, session.currentTime, session.duration, isCreator, onComplete]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = (currentTime / session.duration) * 100;

  // Get status color
  const getStatusColor = () => {
    switch (session.status) {
      case FocusSessionStatus.ACTIVE:
        return 'text-green-600 bg-green-100';
      case FocusSessionStatus.PAUSED:
        return 'text-yellow-600 bg-yellow-100';
      case FocusSessionStatus.WAITING:
        return 'text-blue-600 bg-blue-100';
      case FocusSessionStatus.COMPLETED:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (session.status) {
      case FocusSessionStatus.ACTIVE:
        return 'Đang tập trung';
      case FocusSessionStatus.PAUSED:
        return 'Tạm dừng';
      case FocusSessionStatus.WAITING:
        return 'Chờ bắt đầu';
      case FocusSessionStatus.COMPLETED:
        return 'Đã hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  // Convert participants object to array
  const participantsList = Object.values(session.participants || {});

  return (
    <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      {/* Session Info Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {session.title}
        </h3>
        {session.description && (
          <p className="text-gray-600 text-sm">{session.description}</p>
        )}
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-3 ${getStatusColor()}`}
        >
          <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
          {getStatusText()}
        </span>
      </div>

      {/* Circular Timer */}
      <div className="relative w-64 h-64 mx-auto mb-8">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress Circle */}
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
            className="text-blue-600 transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-gray-500">
            / {formatTime(session.duration)}
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-3">
          <svg
            className="w-5 h-5 text-gray-600 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {participantsList.length} người đang tham gia
          </span>
        </div>

        {/* Participant Avatars */}
        <div className="flex justify-center -space-x-2">
          {participantsList.slice(0, 5).map((participant) => (
            <div
              key={participant.userId}
              className="relative"
              title={participant.userName}
            >
              {participant.userAvatar ? (
                <img
                  src={participant.userAvatar}
                  alt={participant.userName}
                  className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {participant.userName.charAt(0).toUpperCase()}
                </div>
              )}
              {participant.isActive && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
          ))}
          {participantsList.length > 5 && (
            <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">
              +{participantsList.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        {/* Start Button */}
        {isCreator && session.status === FocusSessionStatus.WAITING && (
          <button
            onClick={onStart}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Bắt đầu
            </span>
          </button>
        )}

        {/* Pause/Resume Button */}
        {isCreator &&
          (session.status === FocusSessionStatus.ACTIVE ||
            session.status === FocusSessionStatus.PAUSED) && (
            <button
              onClick={() => 
                session.status === FocusSessionStatus.ACTIVE 
                  ? onPause(currentTime) 
                  : onResume()
              }
              className={`flex-1 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
                session.status === FocusSessionStatus.ACTIVE
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              }`}
            >
              <span className="flex items-center justify-center">
                {session.status === FocusSessionStatus.ACTIVE ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tạm dừng
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tiếp tục
                  </>
                )}
              </span>
            </button>
          )}

        {/* Complete Button */}
        {isCreator &&
          session.status !== FocusSessionStatus.COMPLETED &&
          session.status !== FocusSessionStatus.WAITING && (
            <button
              onClick={onComplete}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hoàn thành
              </span>
            </button>
          )}

        {/* Leave Button */}
        {session.status !== FocusSessionStatus.COMPLETED && (
          <button
            onClick={onLeave}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Rời khỏi
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CollaborativeFocusTimer;
