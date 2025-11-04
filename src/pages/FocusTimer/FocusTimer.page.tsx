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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
      {/* Background blur effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-purple-100/20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        {/* Header Section */}
        <div className="text-center space-y-3 mt-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">{t('title')}</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your focus time with ease</p>
        </div>

      {/* Mode Toggle */}
      <div className="w-full bg-white/80 backdrop-blur-xl rounded-2xl p-1 flex gap-1 shadow-lg shadow-slate-200/50 border border-white/40">
          <button
            disabled={isRunning}
            onClick={() => setMode('countup')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
              mode === 'countup'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40'
                : 'text-slate-600 hover:text-slate-900'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            ⬆️ {t('mode.countup')}
          </button>
          <button
            disabled={isRunning}
            onClick={() => setMode('countdown')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
              mode === 'countdown'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40'
                : 'text-slate-600 hover:text-slate-900'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            ⬇️ {t('mode.countdown')}
          </button>
        </div>

        {/* Timer Display - Large & Bold */}
        <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-white/40">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
              {mode === 'countup' ? t('mode.countup') : t('mode.countdown')}
            </p>
            <div className="text-7xl font-mono font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent tabular-nums">
              {formatTime(timeDisplay)}
            </div>
          </div>

          {/* Choose duration button for countdown */}
          {mode === 'countdown' && !isRunning && (
            <button
              onClick={() => setShowDurationModal(true)}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/60 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              ⏱️ {t('choose_time')}
            </button>
          )}
        </div>

        {/* Control Buttons */}
        <div className="w-full space-y-3">
          {/* Primary Action Button */}
          {!isRunning && (
            <button
              onClick={handleStart}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/60 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              ▶️ {t('start')}
            </button>
          )}

          {/* Pause / Resume Buttons */}
          {isRunning && (
            <div className="flex gap-3">
              {!isPaused && (
                <button
                  onClick={pause}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-amber-500/40 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  ⏸️ {t('pause')}
                </button>
              )}
              {isPaused && (
                <button
                  onClick={resume}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  ▶️ {t('continue')}
                </button>
              )}
              <button
                onClick={mode === 'countup' ? stop : reset}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/60 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                ⏹️ {mode === 'countup' ? t('stop') : t('reset')}
              </button>
            </div>
          )}

          {/* Stop/Reset button when not running */}
          {!isRunning && isRunning === false && (
            <button
              className="w-full py-3 px-4 bg-slate-900/5 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-900/10 transition-all duration-300"
              onClick={mode === 'countup' ? stop : reset}
            >
              {mode === 'countup' ? t('stop') : t('reset')}
            </button>
          )}
        </div>

        {/* Stats info */}
        <div className="w-full text-center text-xs text-slate-400">
          <p>💡 Focus sessions help boost productivity</p>
        </div>
      </div>

      {/* Modals */}
      {showDurationModal && (
        <DurationPickerModal
          onClose={() => setShowDurationModal(false)}
          onSetDuration={handleSetDuration}
        />
      )}

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

      {showCountdownEndModal && (
        <ConfirmModal
          message={t('countdown_finished')}
          onConfirm={closeCountdownEndModal}
          onCancel={closeCountdownEndModal}
        />
      )}

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
