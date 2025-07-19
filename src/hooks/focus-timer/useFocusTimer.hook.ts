import { useEffect, useRef, useState } from 'react';
import focusService from '../../services/focus.service';

type TimerMode = 'countup' | 'countdown';

const STORAGE_KEY = 'focus_timer_state';

function saveToStorage(data: unknown) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useFocusTimer(mode: TimerMode = 'countup', onSessionSaved?: () => void) {
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

  const saveFocusSession = async (start: Date, end: Date) => {
    try {
      await focusService.createFocusTimer({ start_time: start, end_time: end });
      console.log('Session saved!', start, end);
      if (onSessionSaved) onSessionSaved();
    } catch (e) {
      console.log('Error saving session:', e);
    }
  };

  // Restore state
  useEffect(() => {
    const saved = loadFromStorage();
    if (!saved || saved.mode !== mode || !saved.isRunning) return;

    const {
      startTime,
      duration: savedDuration,
      remaining: savedRemaining,
      seconds: savedSeconds,
      paused: savedPaused,
    } = saved;

    const now = Date.now();
    const startedAt = new Date(startTime).getTime();
    const elapsed = Math.floor((now - startedAt) / 1000);

    startTimeRef.current = new Date(startTime);
    setIsRunning(true);
    setIsPaused(savedPaused);

    if (mode === 'countup') {
      setSeconds(savedPaused ? savedSeconds : savedSeconds + elapsed);
    } else {
      durationRef.current = savedDuration;
      setDuration(savedDuration);

      const newRemaining = savedPaused
        ? savedRemaining
        : savedDuration - elapsed;

      if (newRemaining <= 0) {
        clear();
        setIsRunning(false);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setRemaining(newRemaining);
      }
    }
  }, []);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    // Clear interval trước khi tạo mới
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (mode === 'countup') {
      intervalRef.current = window.setInterval(() => {
        setSeconds((s) => {
          const updated = s + 1;
          saveToStorage({
            isRunning: true,
            mode,
            startTime: startTimeRef.current?.toISOString(),
            seconds: updated,
            paused: false,
          });
          return updated;
        });
      }, 1000);
    } else {
      intervalRef.current = window.setInterval(() => {
        setRemaining((prev) => {
          const updated = prev - 1;
          if (updated <= 0) {
            clear();
            setIsRunning(false);
            if (startTimeRef.current) saveFocusSession(startTimeRef.current, new Date());
            localStorage.removeItem(STORAGE_KEY);
            return 0;
          }
          saveToStorage({
            isRunning: true,
            mode,
            startTime: startTimeRef.current?.toISOString(),
            duration: durationRef.current,
            remaining: updated,
            paused: false,
          });
          return updated;
        });
      }, 1000);
    }

    // Cleanup interval khi unmount hoặc khi deps thay đổi
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, mode]);

  const start = () => {
    const now = new Date();
    startTimeRef.current = now;
    setIsRunning(true);
    setIsPaused(false);

    if (mode === 'countup') {
      setSeconds(0);
      saveToStorage({
        isRunning: true,
        mode,
        startTime: now.toISOString(),
        seconds: 0,
        paused: false,
      });
    } else {
      setRemaining(duration);
      saveToStorage({
        isRunning: true,
        mode,
        startTime: now.toISOString(),
        duration: durationRef.current,
        remaining: duration,
        paused: false,
      });
    }
  };

  const pause = () => {
    setIsPaused(true);
    clear();

    const saved = loadFromStorage();
    if (saved) {
      saveToStorage({ ...saved, paused: true });
    }
  };

  const resume = () => {
    setIsPaused(false);
  };

  const performReset = () => {
    clear();
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setRemaining(durationRef.current);
    startTimeRef.current = null;
    localStorage.removeItem(STORAGE_KEY);
  };

  const stop = () => {
    pause(); // Dừng ngay lập tức
    if (startTimeRef.current) {
      saveFocusSession(startTimeRef.current, new Date());
    }
    setPendingAction('stop');
  };

  const confirmAction = () => {
    if (pendingAction === 'stop') performReset();
    if (pendingAction === 'reset') performReset();
    setPendingAction(null);
  };

  const cancelAction = () => {
    if (pendingAction === 'stop') resume();
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
    stop,
    confirmAction,
    cancelAction,
    pendingAction,
    formatTime,
    setCustomDuration,
    timeDisplay: mode === 'countup' ? seconds : remaining,
  };
}