import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import focusService from '../services/focus.service';

export type TimerMode = 'countup' | 'countdown';

interface FocusTimerContextType {
  mode: TimerMode;
  setMode: (mode: TimerMode) => void;
  isRunning: boolean;
  isPaused: boolean;
  timeDisplay: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stop: () => void;
  setCustomDuration: (val: number) => void;
  formatTime: (s: number) => string;
  duration: number;
  setShowDurationModal: (show: boolean) => void;
  showDurationModal: boolean;
  pendingAction: 'stop' | 'reset' | null;
  confirmAction: () => Promise<void>;
  cancelAction: () => void;
  showCountdownEndModal: boolean;
  closeCountdownEndModal: () => void;
  setOnSessionSaved: (cb: (() => void) | null) => void;
  showCongratsModal: boolean;
  setShowCongratsModal: (show: boolean) => void;
}

const FocusTimerContext = createContext<FocusTimerContextType | undefined>(undefined);

const STORAGE_KEY = 'focus_timer_state_v2';

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

export const FocusTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<TimerMode>('countup');
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'stop' | 'reset' | null>(null);
  const [endTimePending, setEndTimePending] = useState<Date | null>(null);
  const [showCountdownEndModal, setShowCountdownEndModal] = useState(false);
  const [onSessionSaved, setOnSessionSaved] = useState<(() => void) | null>(null);
  const [showCongratsModal, setShowCongratsModal] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const durationRef = useRef<number>(0);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // Restore state
  useEffect(() => {
    const saved = loadFromStorage();
    if (!saved) return;
    setMode(saved.mode || 'countup');
    setIsRunning(saved.isRunning);
    setIsPaused(saved.paused);
    if (saved.mode === 'countup') {
      setSeconds(saved.paused ? saved.seconds : saved.seconds + Math.floor((Date.now() - new Date(saved.startTime).getTime()) / 1000));
      startTimeRef.current = saved.startTime ? new Date(saved.startTime) : null;
    } else {
      setDuration(saved.duration);
      durationRef.current = saved.duration;
      const elapsed = Math.floor((Date.now() - new Date(saved.startTime).getTime()) / 1000);
      setRemaining(saved.paused ? saved.remaining : saved.duration - elapsed);
      startTimeRef.current = saved.startTime ? new Date(saved.startTime) : null;
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
            duration,
            remaining,
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
            localStorage.removeItem(STORAGE_KEY);
            setShowCountdownEndModal(true);
            // Play sound
            try {
              const audio = new Audio('/notification.mp3');
              audio.play();
            } catch (e) {}
            // Lưu session khi countdown kết thúc
            if (startTimeRef.current) {
              focusService.createFocusTimer({
                start_time: startTimeRef.current,
                end_time: new Date(),
              }).then(() => {
                console.log('Session saved after countdown!');
                if (onSessionSaved) onSessionSaved();
              }).catch((e) => {
                console.log('Error saving session after countdown:', e);
              });
            }
            return 0;
          }
          saveToStorage({
            isRunning: true,
            mode,
            startTime: startTimeRef.current?.toISOString(),
            duration: durationRef.current,
            remaining: updated,
            paused: false,
            seconds,
          });
          return updated;
        });
      }, 1000);
    }
    return clear;
    // eslint-disable-next-line
  }, [isRunning, isPaused, mode]);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

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
        duration,
        remaining,
      });
    } else {
      setRemaining(durationRef.current);
      saveToStorage({
        isRunning: true,
        mode,
        startTime: now.toISOString(),
        duration: durationRef.current,
        remaining: durationRef.current,
        paused: false,
        seconds,
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

  const stop = () => {
    pause();
    setEndTimePending(new Date());
    setPendingAction('stop');
  };

  const reset = () => {
    pause();
    setEndTimePending(new Date());
    setPendingAction('reset');
  };

  const confirmAction = async () => {
    if (pendingAction === 'stop') {
      await doStop();
    } else if (pendingAction === 'reset') {
      await doReset();
    }
    setPendingAction(null);
    setEndTimePending(null);
  };

  const cancelAction = () => {
    setPendingAction(null);
  };

  // Tách logic thực hiện thật sự
  const doStop = async () => {
    if (startTimeRef.current && isRunning && endTimePending) {
      try {
        await focusService.createFocusTimer({
          start_time: startTimeRef.current,
          end_time: endTimePending,
        });
        console.log('Session saved after stop!');
        if (onSessionSaved) onSessionSaved();
        if (mode === 'countup') {
          setShowCongratsModal(true);
          try {
            const audio = new Audio('/congratulations.mp3');
            audio.play();
          } catch {}
        }
      } catch (e) {}
    }
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setRemaining(durationRef.current);
    startTimeRef.current = null;
    localStorage.removeItem(STORAGE_KEY);
  };

  const doReset = async () => {
    if (startTimeRef.current && isRunning && endTimePending) {
      try {
        await focusService.createFocusTimer({
          start_time: startTimeRef.current,
          end_time: endTimePending,
        });
        console.log('Session saved after reset!');
        if (onSessionSaved) onSessionSaved();
      } catch (e) {}
    }
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setRemaining(durationRef.current);
    startTimeRef.current = null;
    localStorage.removeItem(STORAGE_KEY);
  };

  const setCustomDuration = (val: number) => {
    setDuration(val);
    durationRef.current = val;
    setRemaining(val); // Đảm bảo khi chọn lại thời gian, remaining cũng được cập nhật
  };

  const closeCountdownEndModal = () => setShowCountdownEndModal(false);

  return (
    <FocusTimerContext.Provider
      value={{
        mode,
        setMode,
        isRunning,
        isPaused,
        timeDisplay: mode === 'countup' ? seconds : remaining,
        start,
        pause,
        resume,
        reset,
        stop,
        setCustomDuration,
        formatTime,
        duration,
        setShowDurationModal,
        showDurationModal,
        pendingAction,
        confirmAction,
        cancelAction,
        showCountdownEndModal,
        closeCountdownEndModal,
        setOnSessionSaved,
        showCongratsModal,
        setShowCongratsModal,
      }}
    >
      {children}
    </FocusTimerContext.Provider>
  );
};

export function useFocusTimerContext() {
  const ctx = useContext(FocusTimerContext);
  if (!ctx) throw new Error('useFocusTimerContext must be used within FocusTimerProvider');
  return ctx;
} 