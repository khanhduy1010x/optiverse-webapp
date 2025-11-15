import React, { useState } from 'react';
import { format, getDaysInMonth } from 'date-fns';
import { useFocusTimerStatistic } from '../../hooks/focus-timer/useFocusTimerStatistic.hook';
import ViewFocustimeListModal from './ViewFocustimeListModal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useAppTranslate } from '../../hooks/useAppTranslate';

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-white border rounded-lg shadow text-center p-4 flex flex-col items-center justify-center h-full">
      <div className="text-gray-500 text-xs mb-1">{title}</div>
      <div className="font-bold text-lg text-blue-700">{value}</div>
    </div>
  );
}

const COLORS = ['#8884d8', '#e0e0e0'];

export default function FocusTimerStatisticPage() {
  const { t } = useAppTranslate('focus');
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { dayStats, summary, sessions } = useFocusTimerStatistic(month, year);

  const formatDuration = (seconds: number) => {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}${t('hours_short')} ${m}${t('minutes_short')}`;
    }
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}${t('minutes_short')} ${s}${t('seconds_short')}`;
  };

  // Charts
  const daysInMonth = getDaysInMonth(new Date(year, month));
  const pieData = [
    { name: t('active_days'), value: summary.activeDays },
    { name: t('inactive_days'), value: daysInMonth - summary.activeDays },
  ];
  const chartData = dayStats.map(d => ({
    ...d,
    minutes: Math.round(d.totalSeconds / 60),
  }));

  // Calendar
  const maxSeconds = Math.max(...dayStats.map(d => d.totalSeconds), 0);
  const getColor = (seconds: number) => {
    if (seconds === 0) return '#e0e0e0';
    const ratio = seconds / maxSeconds;
    if (ratio > 0.66) return '#2e7d32';
    if (ratio > 0.33) return '#66bb6a';
    return '#c8e6c9';
  };
  const renderCalendar = () => {
    const statsMap = Object.fromEntries(
      dayStats.map(d => [d.date, d.totalSeconds])
    );
    return (
      <div className="grid grid-cols-7 gap-2 mb-6 ">
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const date = new Date(year, month, idx + 1);
          const iso = format(date, 'yyyy-MM-dd');
          const seconds = statsMap[iso] || 0;
          return (
            <div
              key={idx}
              className="flex items-center justify-center rounded-lg shadow cursor-pointer text-sm font-semibold transition-all duration-150 hover:scale-105"
              data-tooltip-id="calendar-tooltip"
              data-tooltip-content={`${Math.floor(seconds / 60)} ${t('minutes')}`}
              style={{
                width: 42,
                height: 42,
                backgroundColor: getColor(seconds),
              }}
              onClick={() => setSelectedDate(iso)}
            >
              {idx + 1}
            </div>
          );
        })}
        <Tooltip id="calendar-tooltip" place="top" />
      </div>
    );
  };

  return (
              <div className="h-full overflow-y-auto bg-gray-50 p-8">
    <div className="max-w-3xl md:max-w-4xl mx-auto py-6 px-4 md:px-8">
      <h1 className="text-3xl font-bold mb-6">{t('focus_timer_statistics')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title={t('total_sessions')}
          value={summary.totalSessions}
        />
        <SummaryCard
          title={t('total_focus_time')}
          value={formatDuration(summary.totalSeconds)}
        />
        <SummaryCard title={t('active_days')} value={summary.activeDays} />
        <SummaryCard title={t('streak_days')} value={summary.streakDays} />
        <SummaryCard
          title={t('average_per_session')}
          value={`${summary.averageSessionMinutes} ${t('minutes')}`}
        />
        <SummaryCard
          title={t('sessions_this_week')}
          value={summary.weekSessions}
        />
        <SummaryCard
          title={t('focus_time_this_week')}
          value={formatDuration(summary.weekSeconds)}
        />
      </div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>{`${t('month')} ${i + 1}`}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={i} value={y}>
                {y}
              </option>
            );
          })}
        </select>
      </div>
      {/* Calendar */}
      {renderCalendar()}
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <h2 className="font-semibold text-lg mb-2">
            {t('total_focus_time_per_day_bar_chart')}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ReTooltip />
              <Bar dataKey="minutes" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <h2 className="font-semibold text-lg mb-2">
            {t('active_day_ratio_pie_chart')}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <ReTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold text-lg mb-2">
          {t('focus_time_trend_line_chart')}
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ReTooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="minutes"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Modal: focus session details by day */}
      <ViewFocustimeListModal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        sessions={sessions.filter(s =>
          s.start_time.startsWith(selectedDate || '')
        )}
        date={selectedDate}
      />
    </div>
    </div>
  );
}
