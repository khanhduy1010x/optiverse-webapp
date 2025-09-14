import React from 'react';
import Modal from 'react-modal';
import { DeleteModalProps } from '../../types/note/props/component.props';

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  selectedItem,
  onDelete,
  loading = false
}) => {
  const [localLoading, setLocalLoading] = React.useState(false);


  const isButtonLoading = loading || localLoading;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[360px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
    >
      <div className="">

        <div className="text-center mb-6 px-6 pt-6">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Item</h3>
          <p className="text-gray-600">
            Are you sure you want to delete "<span className="font-medium">
              {selectedItem?.type === 'folder' ? selectedItem.name : selectedItem?.title}
            </span>"? This action cannot be undone.
          </p>
        </div>
        <div className="space-y-3 px-6 pb-6">
          <button
            onClick={async () => {
              setLocalLoading(true);
              try {
                await onDelete();
              } finally {
                setLocalLoading(false);
              }
            }}
            disabled={isButtonLoading}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:bg-red-300"
          >
            {isButtonLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Delete Permanently</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isButtonLoading}
            className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>
    </Modal>
  );
};

export default DeleteModal;