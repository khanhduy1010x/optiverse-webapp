import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { useAppTranslate } from '../../hooks/useAppTranslate';

type FocusSession = {
  _id: string;
  start_time: string;
  end_time: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sessions: FocusSession[];
  date: string | null;
};

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ViewFocustimeListModal({
  isOpen,
  onClose,
  sessions,
  date,
}: Props) {
  const { t } = useAppTranslate('focus');

  if (!isOpen || !date) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-50 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/20 border border-white/40 max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all duration-200 hover:scale-110 active:scale-95"
          title={t('close')}
          aria-label={t('close')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{formatDate(date)}</h2>
              <p className="text-xs text-slate-500 font-medium">{sessions.length} {t('sessions')}</p>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="overflow-y-auto flex-1">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
                <Clock size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">{t('no_focus_session')}</p>
              <p className="text-xs text-slate-400 mt-2">Start a focus session to see your progress</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {sessions.map((s, index) => {
                const start = new Date(s.start_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const end = new Date(s.end_time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const duration = Math.floor(
                  (new Date(s.end_time).getTime() -
                    new Date(s.start_time).getTime()) /
                    60000
                );
                return (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/50 hover:from-blue-50 hover:to-blue-100/50 border border-slate-100/60 hover:border-blue-200/60 rounded-2xl px-4 py-3 transition-all duration-300 hover:shadow-md hover:shadow-blue-200/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-400/40 transition-all duration-300">
                        <Clock size={18} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {start} <span className="text-slate-400">→</span> {end}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">{duration} {t('min')}</p>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full border border-blue-200/60">
                        <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                          {duration}m
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100/50 px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            ✓ {t('close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
