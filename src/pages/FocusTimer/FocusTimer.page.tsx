import React from 'react';
import DurationPickerModal from './SetDurationModal';
import ConfirmModal from './ConfirmModal';
import { useFocusTimerContext } from '../../contexts/FocusTimer.context';
import { useAppTranslate } from '../../hooks/useAppTranslate';

export default function FocusTimerPage() {
  const {
    mode,
    setMode,
    isRunning,
    isPaused,
    timeDisplay,
    start,
    pause,
    resume,
    reset,
    stop,
    setCustomDuration,
    formatTime,
    showDurationModal,
    setShowDurationModal,
    pendingAction,
    confirmAction,
    cancelAction,
    showCountdownEndModal,
    closeCountdownEndModal,
    showCongratsModal,
    setShowCongratsModal,
  } = useFocusTimerContext();

  const { t } = useAppTranslate('focus');

  const handleStart = () => {
    if (mode === 'countdown' && timeDisplay <= 0) {
      setShowDurationModal(true);
    } else {
      start();
    }
  };

  const handleSetDuration = (val: number) => {
    setCustomDuration(val);
    setShowDurationModal(false);
    // Wait for user to press Start after choosing duration
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 h-full bg-gray-50">
      {/* Logo */}
      <div className="bg-white text-black border border-gray-200 rounded-2xl w-64 h-64 flex items-center justify-center mb-6 shadow-md">
        <img src="logo.png" alt="Optiverse" className="w-40 h-40" />
      </div>

      <h1 className="text-3xl font-bold">{t('title')}</h1>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          disabled={isRunning}
          className={`px-4 py-2 rounded ${mode === 'countup' ? 'bg-blue-600 text-white' : 'bg-white border'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setMode('countup')}
        >
          {t('mode.countup')}
        </button>
        <button
          disabled={isRunning}
          className={`px-4 py-2 rounded ${mode === 'countdown' ? 'bg-blue-600 text-white' : 'bg-white border'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => setMode('countdown')}
        >
          {t('mode.countdown')}
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-6xl font-mono text-blue-600">
        {formatTime(timeDisplay)}
      </div>

      {/* Countdown: chọn thời gian nếu chưa chạy */}
      {mode === 'countdown' && !isRunning && (
        <button
          onClick={() => setShowDurationModal(true)}
          className="px-4 py-2 bg-indigo-500 text-white rounded"
        >
          {t('choose_time')}
        </button>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning && (
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleStart}
          >
            {t('start')}
          </button>
        )}
        {isRunning && !isPaused && (
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded"
            onClick={pause}
          >
            {t('pause')}
          </button>
        )}
        {isRunning && isPaused && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={resume}
          >
            {t('continue')}
          </button>
        )}
        <button
          disabled={!isRunning}
          className={`px-4 py-2 bg-gray-500 text-white rounded ${!isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={mode === 'countup' ? stop : reset}
        >
          {mode === 'countup' ? t('stop') : t('reset')}
        </button>
      </div>

      {/* Modal: Chọn thời lượng */}
      {showDurationModal && (
        <DurationPickerModal
          onClose={() => setShowDurationModal(false)}
          onSetDuration={handleSetDuration}
        />
      )}

      {/* Modal: Xác nhận Stop / Reset */}
      {pendingAction && (
        <ConfirmModal
          message={
            pendingAction === 'stop'
              ? t('confirm_stop')
              : t('confirm_reset')
          }
          onConfirm={confirmAction}
          onCancel={cancelAction}
        />
      )}

      {/* Modal: Thông báo khi countdown kết thúc */}
      {showCountdownEndModal && (
        <ConfirmModal
          message={t('countdown_finished')}
          onConfirm={closeCountdownEndModal}
          onCancel={closeCountdownEndModal}
        />
      )}

      {/* Modal: Chúc mừng khi dừng count up */}
      {showCongratsModal && (
        <ConfirmModal
          message={t('congrats_saved')}
          onConfirm={() => setShowCongratsModal(false)}
          onCancel={() => setShowCongratsModal(false)}
        />
      )}
    </div>
  );
}
