/**
 * Firebase Focus Service
 * Quản lý real-time sync cho collaborative focus sessions
 */

import { ref, set, onValue, off, update, remove, get } from 'firebase/database';
import { db } from '../firebase';
import {
  FirebaseFocusSession,
  FocusParticipant,
  FocusSessionStatus,
} from '../types/collaborative-focus/collaborative-focus.types';

class FirebaseFocusService {
  private listeners: Map<string, () => void> = new Map();

  /**
   * Lấy reference đến session trong Firebase
   */
  private getSessionRef(sessionId: string) {
    return ref(db, `focusSessions/${sessionId}`);
  }

  /**
   * Lấy reference đến workspace sessions
   */
  private getWorkspaceSessionsRef(workspaceId: string) {
    return ref(db, `workspaceSessions/${workspaceId}`);
  }

  /**
   * Tạo session mới trong Firebase
   */
  async createSession(
    sessionId: string,
    workspaceId: string,
    creatorId: string,
    creatorName: string,
    title: string,
    description: string,
    duration: number
  ): Promise<void> {
    const now = Date.now();
    const session: FirebaseFocusSession = {
      id: sessionId,
      workspaceId,
      creatorId,
      creatorName,
      title,
      description,
      duration,
      status: FocusSessionStatus.WAITING,
      participants: {},
      currentTime: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Lưu vào cả 2 nơi để dễ query
    await Promise.all([
      set(this.getSessionRef(sessionId), session),
      set(ref(db, `workspaceSessions/${workspaceId}/${sessionId}`), true),
    ]);

    console.log('✅ Firebase session created:', sessionId);
  }

  /**
   * Join session - thêm participant
   */
  async joinSession(
    sessionId: string,
    userId: string,
    userName: string,
    userAvatar?: string
  ): Promise<void> {
    const participant: FocusParticipant = {
      userId,
      userName,
      userAvatar,
      joinedAt: Date.now(),
      isActive: true,
    };

    await update(this.getSessionRef(sessionId), {
      [`participants/${userId}`]: participant,
      updatedAt: Date.now(),
    });

    console.log('✅ Joined session:', sessionId);
  }

  /**
   * Leave session - xóa participant
   */
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    await remove(ref(db, `focusSessions/${sessionId}/participants/${userId}`));
    await update(this.getSessionRef(sessionId), {
      updatedAt: Date.now(),
    });

    console.log('✅ Left session:', sessionId);
  }

  /**
   * Start session
   */
  async startSession(sessionId: string): Promise<void> {
    await update(this.getSessionRef(sessionId), {
      status: FocusSessionStatus.ACTIVE,
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log('✅ Session started:', sessionId);
  }

  /**
   * Pause session
   */
  async pauseSession(sessionId: string, currentTime: number): Promise<void> {
    await update(this.getSessionRef(sessionId), {
      status: FocusSessionStatus.PAUSED,
      currentTime,
      pausedAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log('✅ Session paused:', sessionId);
  }

  /**
   * Resume session
   */
  async resumeSession(sessionId: string): Promise<void> {
    await update(this.getSessionRef(sessionId), {
      status: FocusSessionStatus.ACTIVE,
      startedAt: Date.now(),
      pausedAt: null,
      updatedAt: Date.now(),
    });

    console.log('✅ Session resumed:', sessionId);
  }

  /**
   * Complete session
   */
  async completeSession(sessionId: string, workspaceId: string): Promise<void> {
    await update(this.getSessionRef(sessionId), {
      status: FocusSessionStatus.COMPLETED,
      currentTime: 0,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Không xóa khỏi workspace index để vẫn có thể truy vấn lịch sử
    // Chỉ update status, frontend sẽ filter theo status

    console.log('✅ Session completed:', sessionId);
  }

  /**
   * Update current time (dùng khi pause)
   */
  async updateCurrentTime(sessionId: string, currentTime: number): Promise<void> {
    await update(this.getSessionRef(sessionId), {
      currentTime,
      updatedAt: Date.now(),
    });
  }

  /**
   * Update participant active status
   */
  async updateParticipantStatus(
    sessionId: string,
    userId: string,
    isActive: boolean
  ): Promise<void> {
    await update(ref(db, `focusSessions/${sessionId}/participants/${userId}`), {
      isActive,
    });
  }

  /**
   * Listen to session changes
   */
  listenToSession(
    sessionId: string,
    callback: (session: FirebaseFocusSession | null) => void
  ): () => void {
    const sessionRef = this.getSessionRef(sessionId);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      callback(data as FirebaseFocusSession | null);
    });

    // Store unsubscribe function
    this.listeners.set(sessionId, unsubscribe);

    // Return cleanup function
    return () => {
      off(sessionRef);
      this.listeners.delete(sessionId);
    };
  }

  /**
   * Get workspace sessions list
   */
  async getWorkspaceSessions(
    workspaceId: string
  ): Promise<FirebaseFocusSession[]> {
    const workspaceRef = this.getWorkspaceSessionsRef(workspaceId);
    const snapshot = await get(workspaceRef);

    if (!snapshot.exists()) {
      return [];
    }

    const sessionIds = Object.keys(snapshot.val());
    const sessions: FirebaseFocusSession[] = [];

    // Fetch each session
    for (const sessionId of sessionIds) {
      const sessionSnapshot = await get(this.getSessionRef(sessionId));
      if (sessionSnapshot.exists()) {
        sessions.push(sessionSnapshot.val() as FirebaseFocusSession);
      }
    }

    return sessions;
  }

  /**
   * Get single session
   */
  async getSession(sessionId: string): Promise<FirebaseFocusSession | null> {
    const snapshot = await get(this.getSessionRef(sessionId));
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.val() as FirebaseFocusSession;
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string, workspaceId: string): Promise<void> {
    await Promise.all([
      remove(this.getSessionRef(sessionId)),
      remove(ref(db, `workspaceSessions/${workspaceId}/${sessionId}`)),
    ]);

    console.log('✅ Session deleted:', sessionId);
  }

  /**
   * Cleanup all listeners
   */
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
  }
}

export const firebaseFocusService = new FirebaseFocusService();
export default firebaseFocusService;
