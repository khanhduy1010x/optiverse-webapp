import React, { useState, useRef, useEffect } from 'react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

type Props = {
  onClose: () => void;
  onSetDuration: (seconds: number) => void;
};

export default function DurationPickerModal({ onClose, onSetDuration }: Props) {
  const { t } = useAppTranslate('focus');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);

  // Đóng modal khi bấm bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmit = () => {
    const total = hours * 3600 + minutes * 60 + seconds;
    if (total > 0 && total <= 3600) {
      onSetDuration(total);
      onClose();
    } else {
      alert(t('time_validation_error'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {t('choose_your_focus_time')}
          </h3>
          {/* <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button> */}
        </div>

        <div className="flex gap-2 mb-4 justify-center">
          <input
            type="number"
            min={0}
            max={1}
            value={hours}
            onChange={e => setHours(+e.target.value)}
            className="w-16 p-2 border rounded text-center"
            placeholder={t('hours_placeholder')}
          />
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={e => setMinutes(+e.target.value)}
            className="w-16 p-2 border rounded text-center"
            placeholder={t('minutes_placeholder')}
          />
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={e => setSeconds(+e.target.value)}
            className="w-16 p-2 border rounded text-center"
            placeholder={t('seconds_placeholder')}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={hours * 3600 + minutes * 60 + seconds === 0}
            className={`px-4 py-2 rounded text-white ${
              hours * 3600 + minutes * 60 + seconds > 0
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
