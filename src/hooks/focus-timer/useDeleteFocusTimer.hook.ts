import { useState } from 'react';
import focusService from '../../services/focus.service';

export function useDeleteFocusSession() {
  const [loading, setLoading] = useState(false);

  const deleteSession = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await focusService.deleteFocusTimer(id);
      return true;
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteSession,
    loading,
  };
}
