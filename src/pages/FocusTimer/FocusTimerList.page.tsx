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
    <div className="bg-white rounded-lg shadow p-8 w-full max-w-3xl md:max-w-4xl mx-auto mt-8 px-4 md:px-8">
      <h1 className="text-3xl font-bold mb-6">{t('focus_timers_title')}</h1>
      {loading ? (
        <p>{t('loading')}</p>
      ) : focusSessions.length === 0 ? (
        <p className="text-gray-500">{t('no_sessions')}</p>
      ) : (
        <div>
          {Object.entries(groupSessionsByDate(focusSessions))
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([date, sessions]) => (
              <div key={date} className="mb-6">
                <div className="font-semibold text-lg mb-2">
                  {formatSectionDate(sessions[0].start_time)}
                </div>
                <div className="divide-y">
                  {sessions.map(session => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between py-4"
                    >
                      <div>
                        <div className="font-semibold text-base text-gray-800">
                          {formatSessionDuration(session)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimeRange(
                            session.start_time,
                            session.end_time
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSessionToDelete(session)}
                        className="text-red-500 hover:text-red-700"
                        title={t('delete_session')}
                      >
                        <TrashIcon size={20} />
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
  );
};

export default FocusTimerList;
