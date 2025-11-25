import React, { useState } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface DeleteAccountModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteAccountModalProps) {
  const { t } = useAppTranslate('profile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-gray-900 mb-3">
          {t('delete_my_account')}
        </h2>

        {/* Description */}
        <p className="text-gray-600 font-semibold mb-8 text-base">
          {t('permanently_delete_account_description')}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {/* Delete Button */}
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-full transition-all active:scale-95 uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('deleting')}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {t('delete')}
              </>
            )}
          </button>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-black rounded-full transition-all active:scale-95 uppercase tracking-wide text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
