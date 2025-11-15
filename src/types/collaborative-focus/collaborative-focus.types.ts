/**
 * Collaborative Focus Session Types
 * Simplified version with Firebase real-time sync
 */

export enum FocusSessionStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export interface FocusParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: number; // timestamp
  isActive: boolean;
}

export interface CollaborativeFocusSession {
  id: string;
  workspaceId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description?: string;
  duration: number; // Duration in seconds
  status: FocusSessionStatus;
  participants: Record<string, FocusParticipant>; // userId -> participant
  currentTime: number; // Current elapsed time in seconds
  startedAt?: number; // timestamp when started
  pausedAt?: number; // timestamp when paused
  createdAt: number;
  updatedAt: number;
}

export interface CreateFocusSessionDto {
  workspaceId: string;
  title: string;
  description?: string;
  duration: number; // Duration in minutes
}

// Firebase real-time session data (stored in Firebase)
export interface FirebaseFocusSession {
  id: string;
  workspaceId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description?: string;
  duration: number;
  status: FocusSessionStatus;
  participants: Record<string, FocusParticipant>;
  currentTime: number;
  startedAt?: number;
  pausedAt?: number;
  completedAt?: number; // timestamp when completed
  createdAt: number;
  updatedAt: number;
}

