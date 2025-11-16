import React from 'react';
import { Trash2 as TrashIcon } from 'lucide-react';
import DeleteFocusSessionModal from './ConfirmDeleteModal';
import { useFocusSessionList } from '../../hooks/focus-timer/useFocusTimerList.hook';
import { FocusSession } from '../../types/focus-timer/response/focus-timer.response';
import { useFocusTimerContext } from '../../contexts/FocusTimer.context';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const FocusTimerList: React.FC = () => {
  const { t } = useAppTranslate('focus');
  const {
    focusSessions,
    loading,
    sessionToDelete,
    setSessionToDelete,
    fetchSessions,
  } = useFocusSessionList();
  const { setOnSessionSaved } = useFocusTimerContext();
  React.useEffect(() => {
    setOnSessionSaved(() => fetchSessions);
    return () => setOnSessionSaved(null);
  }, [setOnSessionSaved, fetchSessions]);

  function formatTimeRange(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.getHours().toString().padStart(2, '0')}:${s.getMinutes().toString().padStart(2, '0')} - ${e.getHours().toString().padStart(2, '0')}:${e.getMinutes().toString().padStart(2, '0')}`;
  }

  function getSessionMinutes(session: FocusSession): number {
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    return Math.round((end.getTime() - start.getTime()) / 60000);
  }

  function groupSessionsByDate(
    sessions: FocusSession[]
  ): Record<string, FocusSession[]> {
    return sessions.reduce((acc: Record<string, FocusSession[]>, session) => {
      const d = new Date(session.start_time);
      const key =
        d.getFullYear() +
        '-' +
        (d.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        d.getDate().toString().padStart(2, '0');
      if (!acc[key]) acc[key] = [];
      acc[key].push(session);
      return acc;
    }, {});
  }

  function isToday(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  }

  function isYesterday(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    );
  }

  function formatSectionDate(dateStr: string) {
    const d = new Date(dateStr);
    if (isToday(dateStr)) {
      return `${t('today')}, ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
    if (isYesterday(dateStr)) {
      return `${t('yesterday')}, ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatSessionDuration(session: FocusSession): string {
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    const totalSeconds = Math.round((end.getTime() - start.getTime()) / 1000);
    if (totalSeconds >= 3600) {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours}${t('hours_short')} ${minutes}${t('minutes_short')}`;
    } else {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}${t('minutes_short')} ${seconds}${t('seconds_short')}`;
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-4 md:p-8">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-cyan-200/50 border border-white/40 p-6 md:p-8 w-full max-w-3xl md:max-w-4xl mx-auto mt-8">
        {/* Header với icon */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-[#21B4CA] to-[#1a8fa3] rounded-2xl flex items-center justify-center shadow-lg shadow-[#21B4CA]/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#21B4CA] to-[#1a8fa3] bg-clip-text text-transparent">{t('focus_timers_title')}</h1>
        </div>
      {loading ? (
        <p>{t('loading')}</p>
      ) : focusSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#21B4CA]/10 to-[#1a8fa3]/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#21B4CA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">{t('no_sessions')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupSessionsByDate(focusSessions))
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([date, sessions]) => (
              <div key={date} className="bg-gradient-to-r from-[#21B4CA]/5 to-transparent rounded-xl p-4">
                <div className="font-semibold text-lg mb-3 text-[#21B4CA] flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatSectionDate(sessions[0].start_time)}
                </div>
                <div className="space-y-2">
                  {sessions.map(session => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-[#21B4CA]/20 hover:border-[#21B4CA]/40 hover:shadow-md hover:shadow-[#21B4CA]/10 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#21B4CA] to-[#1a8fa3] rounded-lg flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-base text-gray-800">
                            {formatSessionDuration(session)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTimeRange(
                              session.start_time,
                              session.end_time
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSessionToDelete(session)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title={t('delete_session')}
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
      {sessionToDelete && (
        <DeleteFocusSessionModal
          session={sessionToDelete}
          onClose={() => setSessionToDelete(null)}
          onSessionDeleted={fetchSessions}
        />
      )}
    </div>
    </div>
  );
};

export default FocusTimerList;
