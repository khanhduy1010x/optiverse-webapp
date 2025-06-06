import { useEffect, useState } from 'react';
import { token } from '../../utils/apitest';
import { FocusSession } from '../../types/focus-timer/response/focus-timer.response';

export function useFocusSessionList() {
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<FocusSession | null>(
    null
  );

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        'http://localhost:81/productivity/focus-session',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await res.json();
      setFocusSessions(data.data || []);
    } catch (err) {
      console.error('Failed to fetch focus sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    focusSessions,
    loading,
    sessionToDelete,
    setSessionToDelete,
    fetchSessions,
  };
}
