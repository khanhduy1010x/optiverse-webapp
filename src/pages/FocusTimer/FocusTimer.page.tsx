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
    <div className="h-[calc(100vh-57px)] bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
      {/* Background blur effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-purple-100/20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        {/* Header Section */}
        <div className="text-center space-y-3 mt-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#21B4CA] to-[#1a8fa3] rounded-3xl flex items-center justify-center shadow-lg shadow-[#21B4CA]/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">{t('title')}</h1>
          <p className="text-sm text-slate-500 font-medium">{t('subtitle')}</p>
        </div>

      {/* Mode Toggle */}
      <div className="w-full bg-white/80 backdrop-blur-xl rounded-2xl p-1 flex gap-1 shadow-lg shadow-slate-200/50 border border-white/40">
          <button
            disabled={isRunning}
            onClick={() => setMode('countup')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === 'countup'
                ? 'bg-gradient-to-r from-[#21B4CA] to-[#1a8fa3] text-white shadow-lg shadow-[#21B4CA]/40'
                : 'text-slate-600 hover:text-slate-900'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {t('mode.countup')}
          </button>
          <button
            disabled={isRunning}
            onClick={() => setMode('countdown')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === 'countdown'
                ? 'bg-gradient-to-r from-[#21B4CA] to-[#1a8fa3] text-white shadow-lg shadow-[#21B4CA]/40'
                : 'text-slate-600 hover:text-slate-900'
            } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {t('mode.countdown')}
          </button>
        </div>

        {/* Timer Display - Large & Bold */}
        <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-white/40">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
              {mode === 'countup' ? t('mode.countup') : t('mode.countdown')}
            </p>
            <div className="text-7xl font-mono font-bold bg-gradient-to-r from-[#21B4CA] to-[#1a8fa3] bg-clip-text text-transparent tabular-nums">
              {formatTime(timeDisplay)}
            </div>
          </div>

          {/* Choose duration button for countdown */}
          {mode === 'countdown' && !isRunning && (
            <button
              onClick={() => setShowDurationModal(true)}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-[#21B4CA] to-[#1a8fa3] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#21B4CA]/40 hover:shadow-lg hover:shadow-[#21B4CA]/60 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('choose_time')}
            </button>
          )}
        </div>

        {/* Control Buttons */}
        <div className="w-full space-y-3">
          {/* Primary Action Button */}
          {!isRunning && (
            <button
              onClick={handleStart}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/60 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('start')}
            </button>
          )}

          {/* Pause / Resume Buttons */}
          {isRunning && (
            <div className="flex gap-3">
              {!isPaused && (
                <button
                  onClick={pause}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-amber-500/40 hover:shadow-xl hover:shadow-amber-500/60 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('pause')}
                </button>
              )}
              {isPaused && (
                <button
                  onClick={resume}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-[#21B4CA] to-[#1a8fa3] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#21B4CA]/40 hover:shadow-xl hover:shadow-[#21B4CA]/60 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('continue')}
                </button>
              )}
              <button
                onClick={mode === 'countup' ? stop : reset}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-red-500/40 hover:shadow-xl hover:shadow-red-500/60 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                {mode === 'countup' ? t('stop') : t('reset')}
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
        <div className="w-full text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p>{t('stats_info')}</p>
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
