import React, { useEffect, useState } from 'react';
import { Trash2 as TrashIcon } from 'lucide-react';
// import AddFocusSessionModal from './CreateFocusModal';
import DeleteFocusSessionModal from './ConfirmDeleteModal.screen';
import { FocusSession } from '../../types/global.types';
import { token } from '../../utils/apitest';

const FocusSessionListPage: React.FC = () => {
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(false);
  //   const [showAddModal, setShowAddModal] = useState(false);
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

      {/* Add Button */}
      {/* <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition"
        aria-label="Add session"
      >
        <PlusIcon size={24} />
      </button> */}

      {/* Add Modal */}
      {/* {showAddModal && (
        <AddFocusSessionModal
          onClose={() => setShowAddModal(false)}
          onSessionAdded={fetchSessions}
        />
      )} */}

      {/* Delete Modal */}
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

export default FocusSessionListPage;
