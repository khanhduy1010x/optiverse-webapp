/**
 * useCollaborativeFocus Hook - Firebase Version
 * Real-time sync với Firebase, backend chỉ để notify
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthState } from './useAuthState.hook';
import collaborativeFocusService from '../services/collaborative-focus.service';
import firebaseFocusService from '../services/firebase-focus.service';
import {
  FirebaseFocusSession,
  FocusSessionStatus,
  CreateFocusSessionDto,
} from '../types/collaborative-focus/collaborative-focus.types';

export const useCollaborativeFocus = (workspaceId: string) => {
  const { user } = useAuthState();
  const [sessions, setSessions] = useState<FirebaseFocusSession[]>([]);
  const [activeSession, setActiveSession] = useState<FirebaseFocusSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSessionListener = useRef<(() => void) | null>(null);
  const presenceInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load tất cả phiên của workspace
   */
  const loadSessions = useCallback(async () => {
    if (!workspaceId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await firebaseFocusService.getWorkspaceSessions(workspaceId);
      setSessions(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  /**
   * Tạo session mới
   */
  const createSession = useCallback(
    async (data: Omit<CreateFocusSessionDto, 'workspaceId'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        setLoading(true);
        setError(null);

        // Get user ID - handle both _id and user_id
        const userId = user._id || user.user_id;
        const userName = user.full_name || user.name || user.email || 'Unknown';
        const userAvatar = user.avatar || user.avatar_url;

        console.log('🔍 User object:', { 
          userId, 
          userName, 
          userAvatar,
          fullUser: user 
        });

        if (!userId) {
          throw new Error('User ID not found');
        }

        // 1. Call backend để tạo session (lưu DB)
        const { sessionId } = await collaborativeFocusService.createSession({
          ...data,
          workspaceId,
        });

        console.log('✅ Backend session created:', sessionId);

        // 2. Tạo session trong Firebase
        await firebaseFocusService.createSession(
          sessionId,
          workspaceId,
          userId,
          userName,
          data.title,
          data.description || '',
          data.duration * 60 // Convert to seconds
        );

        console.log('✅ Firebase session created');

        // 3. Auto join
        await firebaseFocusService.joinSession(
          sessionId,
          userId,
          userName,
          userAvatar
        );

        console.log('✅ User joined session');

        // 4. Reload sessions
        await loadSessions();

        // 5. Set as active and listen
        const session = await firebaseFocusService.getSession(sessionId);
        if (session) {
          setActiveSession(session);
          startListening(sessionId);
        }

        return session;
      } catch (err: any) {
        console.error('❌ Error creating session:', err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, workspaceId, loadSessions]
  );

  /**
   * Join session
   */
  const joinSession = useCallback(
    async (sessionId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🔵 joinSession called with sessionId:', sessionId);

        // Get user ID - handle both _id and user_id
        const userId = user._id || user.user_id;
        const userName = user.full_name || user.name || user.email || 'Unknown';
        const userAvatar = user.avatar || user.avatar_url;

        if (!userId) {
          throw new Error('User ID not found');
        }

        // Join trong Firebase
        console.log('Adding user to Firebase participants...');
        await firebaseFocusService.joinSession(
          sessionId,
          userId,
          userName,
          userAvatar
        );

        // Get session và set active
        console.log('Fetching session data...');
        const session = await firebaseFocusService.getSession(sessionId);
        console.log('Session fetched:', session);
        
        if (session) {
          console.log('Setting activeSession...');
          setActiveSession(session);
          console.log('Starting listener...');
          startListening(sessionId);
          console.log('✅ ActiveSession set and listening');
        }

        await loadSessions();
        return session;
      } catch (err: any) {
        console.error('❌ Error in joinSession:', err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, loadSessions]
  );

  /**
   * Leave session
   */
  const leaveSession = useCallback(
    async (sessionId: string) => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Get user ID - handle both _id and user_id
        const userId = user._id || user.user_id;

        if (!userId) {
          throw new Error('User ID not found');
        }

        // Leave trong Firebase
        await firebaseFocusService.leaveSession(sessionId, userId);

        // Stop listening
        stopListening();
        setActiveSession(null);

        await loadSessions();
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, loadSessions]
  );

  /**
   * Start session
   */
  const startSession = useCallback(
    async (sessionId: string) => {
      try {
        console.log('🚀 startSession called with sessionId:', sessionId);
        
        // 1. Notify backend
        console.log('📡 Calling backend startSession...');
        await collaborativeFocusService.startSession(sessionId);
        console.log('✅ Backend notified');

        // 2. Update Firebase
        console.log('🔥 Updating Firebase...');
        await firebaseFocusService.startSession(sessionId);
        console.log('✅ Firebase updated');

        console.log('✅ Session started successfully');
      } catch (err: any) {
        console.error('❌ Error in startSession:', err);
        setError(err.message);
        throw err;
      }
    },
    []
  );

  /**
   * Pause session
   */
  const pauseSession = useCallback(async (sessionId: string, currentTime: number) => {
    try {
      // Update Firebase
      await firebaseFocusService.pauseSession(sessionId, currentTime);

      console.log('✅ Session paused');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Resume session
   */
  const resumeSession = useCallback(async (sessionId: string) => {
    try {
      // Update Firebase
      await firebaseFocusService.resumeSession(sessionId);

      console.log('✅ Session resumed');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Complete session
   */
  const completeSession = useCallback(
    async (sessionId: string) => {
      try {
        // 1. Notify backend
        await collaborativeFocusService.stopSession(sessionId, true);

        // 2. Update Firebase
        await firebaseFocusService.completeSession(sessionId, workspaceId);

        // 3. Cleanup
        stopListening();
        setActiveSession(null);

        await loadSessions();
        console.log('✅ Session completed');
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    [workspaceId, loadSessions]
  );

  /**
   * Delete session
   */
  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        setLoading(true);
        setError(null);

        // 1. Delete from backend
        await collaborativeFocusService.deleteSession(sessionId);

        // 2. Delete from Firebase
        await firebaseFocusService.deleteSession(sessionId, workspaceId);

        // 3. Cleanup if it was active
        if (activeSession?.id === sessionId) {
          stopListening();
          setActiveSession(null);
        }

        await loadSessions();
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [activeSession, workspaceId, loadSessions]
  );

  /**
   * Start listening to active session changes
   */
  const startListening = useCallback(
    (sessionId: string) => {
      // Stop previous listener
      stopListening();

      // Start new listener
      const unsubscribe = firebaseFocusService.listenToSession(
        sessionId,
        (session) => {
          if (session) {
            setActiveSession(session);
          } else {
            setActiveSession(null);
          }
        }
      );

      activeSessionListener.current = unsubscribe;

      // Start presence updates
      startPresenceUpdates(sessionId);
    },
    []
  );

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (activeSessionListener.current) {
      activeSessionListener.current();
      activeSessionListener.current = null;
    }
    stopPresenceUpdates();
  }, []);

  /**
   * Update presence (active status) định kỳ
   */
  const startPresenceUpdates = useCallback(
    (sessionId: string) => {
      if (!user || presenceInterval.current) return;

      // Get user ID - handle both _id and user_id
      const userId = user._id || user.user_id;

      if (!userId) {
        console.error('User ID not found for presence updates');
        return;
      }

      // Update immediately
      firebaseFocusService.updateParticipantStatus(sessionId, userId, true);

      // Update every 30 seconds
      presenceInterval.current = setInterval(() => {
        firebaseFocusService.updateParticipantStatus(sessionId, userId, true);
      }, 30000);
    },
    [user]
  );

  /**
   * Stop presence updates
   */
  const stopPresenceUpdates = useCallback(() => {
    if (presenceInterval.current) {
      clearInterval(presenceInterval.current);
      presenceInterval.current = null;
    }
  }, []);

  /**
   * Load sessions on mount
   */
  useEffect(() => {
    if (workspaceId) {
      loadSessions();
    }
  }, [workspaceId, loadSessions]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopListening();
      firebaseFocusService.cleanup();
    };
  }, [stopListening]);

  return {
    sessions,
    activeSession,
    loading,
    error,
    createSession,
    joinSession,
    leaveSession,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    deleteSession,
    refreshSessions: loadSessions,
  };
};

