import React from 'react';
import { Trash2 as TrashIcon } from 'lucide-react';
import DeleteFocusSessionModal from './ConfirmDeleteModal.screen';
import { useFocusSessionList } from '../../hooks/focus-timer/useFocusTimerList.hook';

const FocusTimerList: React.FC = () => {
  const {
    focusSessions,
    loading,
    sessionToDelete,
    setSessionToDelete,
    fetchSessions,
  } = useFocusSessionList();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">Your Focus Sessions</h1>

      {loading ? (
        <p>Loading...</p>
      ) : focusSessions.length === 0 ? (
        <p className="text-gray-500">No focus sessions yet.</p>
      ) : (
        <div className="space-y-3">
          {focusSessions.map(session => (
            <div
              key={session._id}
              className="relative p-4 border border-gray-300 rounded-md shadow-sm"
            >
              <div>
                <p>
                  <strong>Start:</strong>{' '}
                  {new Date(session.start_time).toLocaleString()}
                </p>
                <p>
                  <strong>End:</strong>{' '}
                  {new Date(session.end_time).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSessionToDelete(session)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <TrashIcon size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {sessionToDelete && (
        <DeleteFocusSessionModal
          session={sessionToDelete}
          onClose={() => setSessionToDelete(null)}
          onSessionDeleted={fetchSessions}
        />
      )}
    </div>
  );
};

export default FocusTimerList;
