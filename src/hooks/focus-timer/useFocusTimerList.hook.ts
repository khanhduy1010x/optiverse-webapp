import { useEffect, useState, useCallback } from 'react';
import { FocusSession } from '../../types/focus-timer/response/focus-timer.response';
import focusService from '../../services/focus.service';

export function useFocusSessionList() {
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<FocusSession | null>(
    null
  );

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const data = await focusService.getFocusTimerList();
    setFocusSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    focusSessions,
    loading,
    sessionToDelete,
    setSessionToDelete,
    fetchSessions,
  };
}
