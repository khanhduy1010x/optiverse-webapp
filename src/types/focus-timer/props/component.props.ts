import React from 'react';
import { FocusSession } from '../response/focus-timer.response';

export interface FocusTimerProps {
  onTimerComplete: (startTime: Date, endTime: Date) => void;
  initialTime?: number; // in seconds
}

export interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export interface TimerDisplayProps {
  minutes: number;
  seconds: number;
}

export interface FocusSessionListProps {
  sessions: FocusSession[];
  onDeleteSession: (id: string) => void;
}

export interface FocusSessionItemProps {
  session: FocusSession;
  onDelete: (id: string) => void;
}

export interface DeleteFocusSessionModalProps {
  session: FocusSession;
  onClose: () => void;
  onSessionDeleted: () => void;
}
