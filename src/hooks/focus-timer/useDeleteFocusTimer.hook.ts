import { useState } from 'react';
import { token } from '../../utils/apitest';

export function useDeleteFocusSession() {
  const [loading, setLoading] = useState(false);

  const deleteSession = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:81/productivity/focus-session/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (res.ok) return true;
      else {
        alert('Failed to delete session.');
        return false;
      }
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
