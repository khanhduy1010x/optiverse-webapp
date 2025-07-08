import React, { useState } from 'react';
import { format, getDaysInMonth } from 'date-fns';
import { useFocusTimerStatistic } from '../../hooks/focus-timer/useFocusTimerStatistic.hook';
import Modal from '../FocusTimer/ViewFocustimeListModal';

export default function FocusTimerStatisticPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { dayStats, summary, sessions } = useFocusTimerStatistic(month, year);

  const maxSeconds = Math.max(...dayStats.map((d) => d.totalSeconds), 0);

  const getColor = (seconds: number) => {
    if (seconds === 0) return '#e0e0e0';
    const ratio = seconds / maxSeconds;
    if (ratio > 0.66) return '#2e7d32';
    if (ratio > 0.33) return '#66bb6a';
    return '#c8e6c9';
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(new Date(year, month));
    const statsMap = Object.fromEntries(dayStats.map((d) => [d.date, d.totalSeconds]));

    return (
      <div className="grid grid-cols-7 gap-2 mt-6">
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const date = new Date(year, month, idx + 1);
          const iso = format(date, 'yyyy-MM-dd');
          const seconds = statsMap[iso] || 0;
          return (
            <div
              key={idx}
              className="w-10 h-10 flex items-center justify-center text-xs rounded shadow cursor-pointer"
              style={{ backgroundColor: getColor(seconds) }}
              onClick={() => setSelectedDate(iso)}
              title={`${Math.floor(seconds / 60)} minutes`}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Total sessions" value={summary.totalSessions} />
        <SummaryCard title="Total time" value={`${Math.floor(summary.totalSeconds / 60)} minutes`} />
        <SummaryCard title="This week's session" value={summary.weekSessions} />
        <SummaryCard title="This week's time" value={`${Math.floor(summary.weekSeconds / 60)} minutes`} />
      </div>

      <div className="flex gap-4 items-center">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="p-2 border rounded">
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>{`Month ${i + 1}`}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="p-2 border rounded">
          {Array.from({ length: 5 }).map((_, i) => {
            const y = new Date().getFullYear() - i;
            return <option key={i} value={y}>{y}</option>;
          })}
        </select>
      </div>

      {renderCalendar()}

      <Modal isOpen={!!selectedDate} onClose={() => setSelectedDate(null)}>
        {selectedDate && (
          <>
            <h2 className="text-lg font-semibold mb-2">
              Session on {format(new Date(selectedDate), 'dd/MM/yyyy')}
            </h2>
            <ul className="space-y-2">
              {sessions
                .filter((s) => s.start_time.startsWith(selectedDate))
                .map((s) => {
                  const start = new Date(s.start_time).toLocaleTimeString();
                  const end = new Date(s.end_time).toLocaleTimeString();
                  const duration = Math.floor(
                    (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 60000
                  );
                  return (
                    <li key={s._id} className="border-b pb-1">
                      🕒 {start} - {end} ({duration} minutes)
                    </li>
                  );
                })}
            </ul>
          </>
        )}
      </Modal>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
