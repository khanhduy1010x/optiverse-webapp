import React, { useEffect, useState } from 'react';
import { token } from '../../utils/apitest';

const FOCUS_DURATION = 25 * 60; // 25 phút
const BREAK_DURATION = 5 * 60; // 5 phút

export default function FocusTimerPage() {
  const [seconds, setSeconds] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [isFocusTime, setIsFocusTime] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const startSession = async () => {
    const now = new Date();
    setStartTime(now);

    setIsRunning(true);
    const id = window.setInterval(() => setSeconds(s => s + 1), 1000);
    setIntervalId(id);
  };

  const stopSession = async () => {
    console.log(startTime);
    if (!startTime) return;

    const end = new Date();
    const res = await fetch('http://localhost:81/productivity/focus-session', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_time: startTime.toISOString(),
        end_time: end.toISOString(),
      }),
    });

    if (intervalId) clearInterval(intervalId);
    setSeconds(0);
    setIntervalId(null);
    setIsRunning(false);
    setStartTime(null);
  };

  // Auto chuyển trạng thái Pomodoro và thông báo
  useEffect(() => {
    if (!isRunning) return;

    const duration = isFocusTime ? FOCUS_DURATION : BREAK_DURATION;

    if (seconds >= duration) {
      // Thông báo
      if (Notification.permission === 'granted') {
        new Notification(
          isFocusTime
            ? 'Hết giờ tập trung! Nghỉ ngơi đi nào 🧘‍♂️'
            : 'Nghỉ đủ rồi! Tập trung tiếp thôi 💪'
        );
      }
      setIsFocusTime(!isFocusTime);
      setSeconds(0);
    }
  }, [seconds, isFocusTime, isRunning]);

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

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
            className={`px-6 py-2 rounded-md text-white transition-colors ${
              isRunning
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
