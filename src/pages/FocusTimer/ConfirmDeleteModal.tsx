import React from 'react';
import ReactDOM from 'react-dom';

import { DeleteFocusSessionModalProps } from '../../types/focus-timer/props/component.props';
import { useDeleteFocusSession } from '../../hooks/focus-timer/useDeleteFocusTimer.hook';

const DeleteFocusSessionModal: React.FC<DeleteFocusSessionModalProps> = ({
  session,
  onClose,
  onSessionDeleted,
}) => {
  const { deleteSession, loading } = useDeleteFocusSession();

  const handleDelete = async () => {
    const success = await deleteSession(session._id);
    if (success) {
      onSessionDeleted();
      onClose();
    }
  };

  // Sử dụng portal để render modal ra cuối body
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Delete Session</h2>
        <p className="text-gray-600">Are you sure you want to delete this focus session?</p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-60"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteFocusSessionModal;