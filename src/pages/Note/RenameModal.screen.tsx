import React from 'react';
import Modal from 'react-modal';
import { RenameModalProps } from '../../types/note/props/component.props';



const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  renameInput,
  setRenameInput,
  selectedItem,
  onRename,
  errorMessage
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-[2000] outline-none"
      overlayClassName="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Rename {selectedItem?.type === 'file' ? 'note' : 'folder'} – <span className="font-normal text-gray-600">{selectedItem?.type === 'file' ? selectedItem?.title : selectedItem?.name}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg transition-colors"
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
          <label
            htmlFor="rename-input"
            className={`absolute select-none outline-none pointer-events-none duration-400 left-3 text-xs z-10 block transition-all bg-white px-1
              ${errorMessage ? 'text-red-500 -top-2' : (isFocused || renameInput ? 'text-blue-600 -top-2' : 'text-gray-500 top-1/2 text-[16px] bg-transparent px-0')}
              ${isFocused || renameInput || errorMessage ? '' : '-translate-y-1/2'}`}
          >
            New Name
          </label>

          <div className={`relative w-full h-14 border-2 rounded-xl transition-colors duration-200 ${errorMessage ? 'border-red-500' : 'border-gray-200 focus-within:border-blue-600'}`}>
            <input
              id="rename-input"
              type="text"
              value={renameInput}
              onChange={e => setRenameInput(e.target.value)}
              className="w-full h-full  bg-transparent px-3 pt-4 pb-4 outline-none text-gray-900"
              autoFocus
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={e => {
                if (e.key === 'Enter' && renameInput.trim()) {
                  onRename();
                }
              }}
            />
          </div>

          {errorMessage && (
            <p className="mt-2 text-sm text-red-500 animate-in slide-in-from-top-1 duration-200">{errorMessage}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onRename}
            disabled={!renameInput.trim()}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-400 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RenameModal;