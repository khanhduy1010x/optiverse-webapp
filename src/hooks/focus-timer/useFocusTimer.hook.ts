import { useEffect, useState, useRef } from 'react';
import focusService from '../../services/focus.service';

type TimerMode = 'countup' | 'countdown';

const STORAGE_KEY = 'focus_timer_state';

function saveToStorage(data: any) {
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

  const saveFocusSession = async (start: Date, end: Date) => {
    await focusService.createFocusTimer({ start_time: start, end_time: end });
  };

  // Auto restore
  useEffect(() => {
    const saved = loadFromStorage();
    if (!saved) return;

    const { isRunning, mode: savedMode, startTime, duration, paused, lastTime } = saved;
    if (!isRunning || savedMode !== mode) return;

    const now = new Date().getTime();
    const start = new Date(startTime);
    const elapsed = Math.floor((now - new Date(lastTime).getTime()) / 1000);

    startTimeRef.current = start;
    setIsRunning(true);
    setIsPaused(paused);

    if (mode === 'countup') {
      setSeconds(saved.seconds + (paused ? 0 : elapsed));
    } else {
      durationRef.current = duration;
      setDuration(duration);
      setRemaining(Math.max(0, saved.remaining - (paused ? 0 : elapsed)));
    }
  }, []);

  useEffect(() => {
    if (!isRunning || isPaused) return;

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
            lastTime: new Date().toISOString(),
          });
          return updated;
        });
      }, 1000);
    } else {
      intervalRef.current = window.setInterval(() => {
        setRemaining((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            clear();
            setIsRunning(false);
            const end = new Date();
            if (startTimeRef.current) saveFocusSession(startTimeRef.current, end);
            localStorage.removeItem(STORAGE_KEY);
            return 0;
          }

          saveToStorage({
            isRunning: true,
            mode,
            startTime: startTimeRef.current?.toISOString(),
            duration: durationRef.current,
            remaining: next,
            paused: false,
            lastTime: new Date().toISOString(),
          });

          return next;
        });
      }, 1000);
    }

    return clear;
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
        lastTime: now.toISOString(),
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
        lastTime: now.toISOString(),
      });
    }
  };

  const pause = () => {
    setIsPaused(true);
    clear();
    const now = new Date().toISOString();

    const saved = loadFromStorage();
    if (saved) {
      saveToStorage({ ...saved, paused: true, lastTime: now });
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

  const performStop = async () => {
    const now = new Date();
    if (startTimeRef.current) {
      await saveFocusSession(startTimeRef.current, now);
    }
    performReset();
  };

  // const stop = () => {
  //   // Thực hiện lưu thời gian ngay khi bấm Stop
  //   const now = new Date();
  //   if (startTimeRef.current) {
  //     saveFocusSession(startTimeRef.current, now);
  //   }
  //   setPendingAction('stop');
  // };

  //stop có thể dừng đồng hồ
  const stop = () => {
  pause(); // Dừng ngay lập tức khi mở modal xác nhận

  // Lưu thời điểm nhấn stop (trước xác nhận)
  const now = new Date();
  if (startTimeRef.current) {
    saveFocusSession(startTimeRef.current, now);
  }

  setPendingAction('stop');
};

  const confirmAction = async () => {
    if (pendingAction === 'stop') {
      performReset(); // Đã lưu session rồi khi bấm Stop
    } else if (pendingAction === 'reset') {
      performReset();
    }
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
    stop,
    confirmAction,
    cancelAction,
    pendingAction,
    formatTime,
    setCustomDuration,
    timeDisplay: mode === 'countup' ? seconds : remaining,
  };
}