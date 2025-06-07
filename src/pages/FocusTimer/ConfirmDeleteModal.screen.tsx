import React from 'react';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Delete Session</h2>
        <p>Are you sure you want to delete this focus session?</p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-md"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFocusSessionModal;
