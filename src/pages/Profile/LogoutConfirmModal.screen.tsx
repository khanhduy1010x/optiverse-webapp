import React from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmModal({
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
}: LogoutConfirmModalProps) {
  const { t } = useAppTranslate('profile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200/80 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t('confirm_logout') || 'Confirm Logout'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('logout_confirmation_message') || 'Are you sure you want to log out?'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-700 font-medium">
            {t('logout_confirmation_description') || 'You will be signed out from your account and returned to the login page.'}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200/80 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            {t('cancel') || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('logging_out') || 'Logging out...'}
              </span>
            ) : (
              t('logout') || 'Logout'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
