import { useEffect, useState } from 'react';
type FocusSession = {
  _id: string;
  user_id: string;
  start_time: string;
  end_time: string;
};
type DayStat = {
  date: string;
  totalSeconds: number;
};
import focusService from '../../services/focus.service';

export function useFocusTimerStatistic(month: number, year: number) {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [dayStats, setDayStats] = useState<DayStat[]>([]);
  const [summary, setSummary] = useState({
    totalSessions: 0,
    totalSeconds: 0,
    weekSessions: 0,
    weekSeconds: 0,
    averageSessionMinutes: 0,
    streakDays: 0,
    activeDays: 0,
  });

  useEffect(() => {
    fetchSessions();
  }, [month, year]);

  const fetchSessions = async () => {
    const allSessions = await focusService.getFocusTimerList();
    const filtered = allSessions.filter((session) => {
      const start = new Date(session.start_time);
      return start.getFullYear() === year && start.getMonth() === month;
    });
    setSessions(filtered);
    processStats(filtered);
  };

  const processStats = (sessions: FocusSession[]) => {
    const dayMap: Record<string, number> = {};
    let totalSeconds = 0;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    let weekSeconds = 0;
    let weekSessions = 0;
    const activeDates = new Set<string>();

    sessions.forEach((session) => {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      const duration = (end.getTime() - start.getTime()) / 1000;
      totalSeconds += duration;
      const key = start.toISOString().split('T')[0];
      dayMap[key] = (dayMap[key] || 0) + duration;
      activeDates.add(key);

      if (start >= startOfWeek) {
        weekSeconds += duration;
        weekSessions += 1;
      }
    });

    const dayStats: DayStat[] = Object.entries(dayMap).map(([date, totalSeconds]) => ({
      date,
      totalSeconds,
    }));

    const averageSessionMinutes = sessions.length ? totalSeconds / 60 / sessions.length : 0;
    const streakDays = calculateStreak(Array.from(activeDates));

    setDayStats(dayStats);
    setSummary({
      totalSessions: sessions.length,
      totalSeconds,
      weekSessions,
      weekSeconds,
      averageSessionMinutes: Math.round(averageSessionMinutes),
      streakDays,
      activeDays: activeDates.size,
    });
  };

  const calculateStreak = (dates: string[]): number => {
    const sorted = dates.map((d) => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    let streak = 0;
    let current = new Date();
    for (const d of sorted) {
      if (d.toDateString() === current.toDateString()) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  return { dayStats, summary, sessions };
}
