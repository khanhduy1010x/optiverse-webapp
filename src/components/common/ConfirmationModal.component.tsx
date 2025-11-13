import React from 'react';
import Modal from 'react-modal';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  const { t } = useAppTranslate('common');

  // Use provided props or fallback to translated defaults
  const modalTitle = title || t('confirmation');
  const modalConfirmText = confirmText || t('confirm');
  const modalCancelText = cancelText || t('cancel');
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      ariaHideApp={false}
      className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
      overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 z-[9998]"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{modalTitle}</h3>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
            >
              {modalCancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200 font-medium"
            >
              {modalConfirmText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};