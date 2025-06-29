import React from 'react';
import Modal from 'react-modal';
import { CreateModalProps } from '../../types/note/props/component.props';
import { GROUP_CLASSNAMES } from '../../styles';

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
  const [localLoading, setLocalLoading] = React.useState(false);

  const handleCreate = async () => {
    setLocalLoading(true);
    try {
      await onCreate();
    } finally {
      setLocalLoading(false);
    }
  };

  const isButtonLoading = loading || localLoading;
  const remainingChars = 30 - itemName.length;

  const isMaxLength = remainingChars <= -1;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 30) {
      setItemName(value);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={GROUP_CLASSNAMES.modalContainer}
      overlayClassName={GROUP_CLASSNAMES.modalOverlay}
    >
      <div className="p-6">
        <div className={GROUP_CLASSNAMES.flexJustifyBetween + " mb-4"}>
          <h3 className="text-lg font-semibold text-gray-900">
            Create {createType === 'folder' ? 'Folder' : 'Note'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer hover:text-gray-700 p-1 rounded-lg"
            disabled={isButtonLoading}
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
            htmlFor="create-input"
            className={`absolute select-none outline-none pointer-events-none duration-300 left-3 text-xs z-10 block transition-all bg-white px-1
              ${errorMessage ? 'text-red-500 -top-2' : (isFocused || itemName ? 'text-[#21b4ca] -top-2' : 'text-gray-500 top-[38%] text-[16px] bg-transparent px-0')}
              ${isFocused || itemName || errorMessage ? '' : '-translate-y-1/2'}`}
          >
            {createType === 'folder' ? 'Folder' : 'Note'} Name
          </label>

          <div className={`relative w-full h-14 border-2 rounded-xl transition-colors duration-200 ${errorMessage ? 'border-red-500' : isMaxLength ? 'border-red-500' : 'border-gray-200 focus-within:border-[#21b4ca]'}`}>
            <input
              id="create-input"
              type="text"
              value={itemName}
              onChange={handleInputChange}
              className={GROUP_CLASSNAMES.inputTransparent}
              autoFocus
              disabled={isButtonLoading}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={e => {
                if (e.key === 'Enter' && itemName.trim() && !isButtonLoading && !isMaxLength) {
                  handleCreate();
                }
              }}
            />

            {isButtonLoading && (
              <div className={GROUP_CLASSNAMES.absoluteCenter}>
                <div className={GROUP_CLASSNAMES.loadingSpinner}></div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-1">
            {errorMessage && (
              <p className="text-sm text-red-500 animate-in slide-in-from-top-1 duration-200">{errorMessage}</p>
            )}
            <div className={`text-xs ${remainingChars <= 0 ? 'text-red-500 font-medium' : remainingChars <= 5 ? 'text-yellow-500' : 'text-gray-400'}`}>
              {remainingChars} characters left
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={GROUP_CLASSNAMES.buttonSecondary + " flex-1 cursor-pointer"}
            disabled={isButtonLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!itemName.trim() || isButtonLoading || isMaxLength}
            className={GROUP_CLASSNAMES.buttonPrimary + " flex-1 bg-[#21b4ca] flex items-center justify-center gap-2 cursor-pointer"}
          >
            {isButtonLoading ? (
              <>
                <div className={GROUP_CLASSNAMES.loadingSpinnerSmall}></div>
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