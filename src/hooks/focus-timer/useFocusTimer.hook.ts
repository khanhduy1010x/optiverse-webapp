import { useEffect, useState } from 'react';
import focusService from '../../services/focus.service';

const FOCUS_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;

export function useFocusTimer() {
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

  const startSession = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    const id = window.setInterval(() => setSeconds(s => s + 1), 1000);
    setIntervalId(id);
  };

  const stopSession = async () => {
    if (!startTime) return;

    const end = new Date();
    await focusService.createFocusTimer({
      start_time: startTime,
      end_time: end,
    });

    if (intervalId) clearInterval(intervalId);
    setSeconds(0);
    setIntervalId(null);
    setIsRunning(false);
    setStartTime(null);
  };

  useEffect(() => {
    if (!isRunning) return;

    const duration = isFocusTime ? FOCUS_DURATION : BREAK_DURATION;

    if (seconds >= duration) {
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

  return {
    seconds,
    isFocusTime,
    isRunning,
    startSession,
    stopSession,
    formatTime,
  };
}
