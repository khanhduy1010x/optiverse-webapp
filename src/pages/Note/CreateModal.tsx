import React from 'react';
import Modal from 'react-modal';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  setItemName: (name: string) => void;
  createType: 'folder' | 'note';
  onCreate: () => Promise<void>;
  loading: boolean;
  errorMessage?: string;
}

const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  itemName,
  setItemName,
  createType,
  onCreate,
  loading,
  errorMessage,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[3000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[3000]"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Create {createType === 'folder' ? 'Folder' : 'Note'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4 relative">
          {/* Floating label nằm bên ngoài, phía trên input */}
          <label
            htmlFor="create-input"
            className={`absolute select-none outline-none pointer-events-none duration-300 left-3 text-xs z-10 block transition-all bg-white px-1
              ${errorMessage ? 'text-red-500 -top-2' : (isFocused || itemName ? 'text-blue-600 -top-2' : 'text-gray-500 top-1/2 text-[16px] bg-transparent px-0')}
              ${isFocused || itemName || errorMessage ? '' : '-translate-y-1/2'}`}
          >
            {createType === 'folder' ? 'Folder' : 'Note'} Name
          </label>

          <div className={`relative w-full h-14 border-2 rounded-xl transition-colors duration-200 ${errorMessage ? 'border-red-500' : 'border-gray-200 focus-within:border-blue-600'}`}>
            <input
              id="create-input"
              type="text"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              className="w-full h-full bg-transparent px-3 pt-4 pb-4 outline-none text-gray-900 disabled:bg-gray-100"
              autoFocus
              disabled={loading}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={e => {
                if (e.key === 'Enter' && itemName.trim() && !loading) {
                  onCreate();
                }
              }}
            />

            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            )}
          </div>
          {errorMessage && (
            <p className="mt-2 text-sm text-red-500 animate-in slide-in-from-top-1 duration-200">{errorMessage}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 disabled:bg-gray-300 disabled:text-gray-400 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!itemName.trim() || loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 4V20M4 12H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Create {createType === 'folder' ? 'Folder' : 'Note'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateModal;