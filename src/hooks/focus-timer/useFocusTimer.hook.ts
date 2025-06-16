import { useEffect, useState, useRef } from 'react';
import focusService from '../../services/focus.service';

type TimerMode = 'countup' | 'countdown';

export function useFocusTimer(mode: TimerMode = 'countup') {
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pendingAction, setPendingAction] = useState<'stop' | 'reset' | null>(null);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const durationRef = useRef<number>(0);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const saveFocusSession = async () => {
    const start = startTimeRef.current;
    const end = new Date();
    if (start) {
      await focusService.createFocusTimer({ start_time: start, end_time: end });
    }
  };

  useEffect(() => {
    if (!isRunning || isPaused) return;

    if (mode === 'countup') {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      intervalRef.current = window.setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clear();
            setIsRunning(false);
            saveFocusSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return clear;
  }, [isRunning, isPaused, mode]);

  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
    const now = new Date();
    startTimeRef.current = now;

    if (mode === 'countup') {
      setSeconds(0);
    } else {
      setRemaining(duration);
    }
  };

  const pause = () => {
    setIsPaused(true);
    clear();
  };

  const resume = () => {
    setIsPaused(false);
  };

  const performReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    clear();
    setSeconds(0);
    setRemaining(durationRef.current);
    startTimeRef.current = null;
  };

  const performStop = async () => {
    if (mode === 'countup' && startTimeRef.current) {
      await saveFocusSession();
    }
    performReset();
  };

  const confirmAction = async () => {
    if (pendingAction === 'stop') await performStop();
    else if (pendingAction === 'reset') performReset();
    setPendingAction(null);
  };

  const cancelAction = () => {
    setPendingAction(null);
  };

  const setCustomDuration = (sec: number) => {
    if (sec <= 3600) {
      setDuration(sec);
      setRemaining(sec);
      durationRef.current = sec;
    }
  };

  return {
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    reset: () => setPendingAction('reset'),
    stop: () => setPendingAction('stop'),
    confirmAction,
    cancelAction,
    pendingAction,
    formatTime,
    setCustomDuration,
    timeDisplay: mode === 'countup' ? seconds : remaining,
  };
}