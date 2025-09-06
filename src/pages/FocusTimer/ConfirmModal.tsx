import React, { useEffect, useRef } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

type Props = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  const { t } = useAppTranslate('focus');
  const modalRef = useRef<HTMLDivElement>(null);

  // Đóng modal nếu click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('confirm_action_title')}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-700 mb-6 text-center">{message}</p>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
