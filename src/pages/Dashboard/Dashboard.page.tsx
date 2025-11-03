import React from 'react';
import { useDashboard } from '../../hooks/dashboard/useDashboard.hook';
import { BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import { FaRegCheckCircle, FaRegClock, FaRegListAlt, FaRegLightbulb, FaRegCalendarCheck, FaRegChartBar, FaRegStar } from 'react-icons/fa';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

function FlashcardPieChart({ percentReviewed }: { percentReviewed: number }) {
  const { t } = useAppTranslate('dashboard');
  const data = [
    { name: t('reviewed'), value: percentReviewed },
    { name: t('not_reviewed'), value: 100 - percentReviewed }
  ];
  return (
    <ResponsiveContainer width={120} height={120}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={40} outerRadius={60} label>
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

function FlashcardReviewBarChart({ reviewsByDay }: { reviewsByDay: { date: string, count: number }[] }) {
  const { t } = useAppTranslate('dashboard');
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={reviewsByDay.map((d, i) => ({ name: d.date || t('day_n', { n: i + 1 }), value: d.count }))} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
        <XAxis dataKey="name" tick={{ fontWeight: 'bold', fontSize: 15, fill: '#333' }} />
        <YAxis tick={{ fontSize: 14, fill: '#8884d8' }} />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#8884d8', fontSize: 16, fontWeight: 'bold' }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const Dashboard: React.FC = () => {
  const { t } = useAppTranslate('dashboard');
  const {
    flashcardToday,
    // flashcardStreak, flashcardChart đã không còn dùng
    flashcardDueToday,
    flashcardPercentReviewed,
    flashcardTotalCard,
    flashcardReviewsByDay,
    // ... các trường khác giữ nguyên
    taskCompleted,
    taskTotal,
    taskPercent,
    taskChart,
    focusMinutes,
    focusSessions,
    focusChart,
    focusStreak,
    goalFlashcard,
    goalTask,
    goalFocus,
    achievement,
    streakChart,
  } = useDashboard();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">{t('dashboard_overview')}</h1>
      {/* OVERVIEW SECTION: Important stats of all 3 types */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
        {/* Flashcard: Due Today */}
        <div className="flex flex-col items-center bg-white rounded-xl shadow p-4 border-t-4 border-blue-400">
          <FaRegLightbulb className="text-blue-400 text-2xl mb-1" />
          <div className="text-xs text-gray-500">{t('flashcards_due_today')}</div>
          <div className="text-xl font-bold text-blue-600">{flashcardDueToday}</div>
        </div>
        {/* Flashcard: Reviewed Today */}
        <div className="flex flex-col items-center bg-white rounded-xl shadow p-4 border-t-4 border-blue-500">
          <FaRegCheckCircle className="text-blue-500 text-2xl mb-1" />
          <div className="text-xs text-gray-500">{t('reviewed_today')}</div>
          <div className="text-xl font-bold text-blue-700">{flashcardToday}</div>
        </div>
        {/* Flashcard: Percent Reviewed */}
        <div className="flex flex-col items-center bg-white rounded-xl shadow p-4 border-t-4 border-blue-300">
          <FaRegStar className="text-blue-300 text-2xl mb-1" />
          <div className="text-xs text-gray-500">{t('percent_reviewed')}</div>
          <div className="text-xl font-bold text-blue-500">{flashcardPercentReviewed.toFixed(2)}%</div>
        </div>
        {/* Task: Tasks Completed Today */}
        <div className="flex flex-col items-center bg-white rounded-xl shadow p-4 border-t-4 border-green-400">
          <FaRegListAlt className="text-green-400 text-2xl mb-1" />
          <div className="text-xs text-gray-500">{t('tasks_completed_today')}</div>
          <div className="text-xl font-bold text-green-600">{taskCompleted}</div>
        </div>
        {/* Task: Completion % */}
        <div className="flex flex-col items-center bg-white rounded-xl shadow p-4 border-t-4 border-green-500">
          <FaRegChartBar className="text-green-500 text-2xl mb-1" />
          <div className="text-xs text-gray-500">{t('task_completion')}</div>
          <div className="text-xl font-bold text-green-700">{taskPercent}%</div>
        </div>
        {/* Focus Timer: Minutes Focused Today */}
        <div className="flex flex-col items-center bg-white rounded-xl shadow p-4 border-t-4 border-indigo-400">
          <FaRegClock className="text-indigo-400 text-2xl mb-1" />
          <div className="text-xs text-gray-500">{t('minutes_focused_today')}</div>
          <div className="text-xl font-bold text-indigo-600">{focusMinutes}</div>
        </div>
        {/* Focus Timer: Sessions Today */}
        <div className="flex flex-col items-center bg-white rounded-xl shadow p-4 border-t-4 border-indigo-500">
          <FaRegCalendarCheck className="text-indigo-500 text-2xl mb-1" />
          <div className="text-xs text-gray-500">{t('focus_sessions')}</div>
          <div className="text-xl font-bold text-indigo-700">{focusSessions}</div>
        </div>
      </div>
      {/* Flashcard Section (compact) */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <div className="text-lg font-semibold mb-2">{t('review_progress')}</div>
            <FlashcardPieChart percentReviewed={flashcardPercentReviewed} />
            <div className="text-sm text-gray-500 mt-2">{t('percent_reviewed')}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center md:col-span-2">
            <div className="text-lg font-semibold mb-2">{t('reviews_by_day')}</div>
            <FlashcardReviewBarChart reviewsByDay={flashcardReviewsByDay} />
          </div>
        </div>
      </div>
      {/* Task & Focus Timer Section (compact, PieChart style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Task Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-lg font-semibold mb-2">{t('tasks')}</div>
          <div className="text-3xl font-bold mb-1">{taskCompleted}/{taskTotal}</div>
          <div className="text-gray-500 mb-2">{t('tasks_completed_today')}</div>
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={[
                  { name: t('completed'), value: taskCompleted },
                  { name: t('remaining'), value: Math.max(taskTotal - taskCompleted, 0) },
                ]}
                innerRadius={40}
                outerRadius={60}
                label
                dataKey="value"
              >
                <Cell fill="#82ca9d" />
                <Cell fill="#e0e0e0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-xs text-green-600 mt-2">{t('completion_label')}: {taskPercent}%</div>
        </div>
        {/* Focus Timer Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-lg font-semibold mb-2">{t('focus_timer')}</div>
          <div className="text-3xl font-bold mb-1">{focusMinutes} {t('minutes_short')}</div>
          <div className="text-gray-500 mb-2">{t('minutes_focused_today')}</div>
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={[
                  { name: t('focused'), value: focusMinutes },
                  { name: t('remaining'), value: Math.max(goalFocus - focusMinutes, 0) },
                ]}
                innerRadius={40}
                outerRadius={60}
                label
                dataKey="value"
              >
                <Cell fill="#21b4ca" />
                <Cell fill="#e0e0e0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="text-xs text-indigo-600 mt-2">{t('sessions_label')}: {focusSessions} | {t('streak_label')}: {focusStreak} {t('days')}</div>
        </div>
      </div>
      {/* Streak Line Chart */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="text-lg font-semibold mb-2">{t('streak_progress_last_7_days')}</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={streakChart.map((v, i) => ({ name: t('day_n', { n: i + 1 }), value: v }))}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#f59e42" radius={[4, 4, 4, 4]} label={{ position: 'top', fill: '#f59e42', fontSize: 14 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievement Card */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-lg font-semibold mb-2">{t('achievement')}</div>
          <div className="text-2xl font-bold text-blue-700 mb-1">{achievement.title}</div>
          <div className="text-gray-600 text-center">{achievement.desc}</div>
        </div>
        {/* Goal Card */}
        <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-lg font-semibold mb-2">{t('todays_goals')}</div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between w-full text-gray-700">
              <span>{t('flashcards')}</span>
              <span>{flashcardToday}/{goalFlashcard}</span>
            </div>
            <div className="flex justify-between w-full text-gray-700">
              <span>{t('tasks')}</span>
              <span>{taskCompleted}/{goalTask}</span>
            </div>
            <div className="flex justify-between w-full text-gray-700">
              <span>{t('focus_time')}</span>
              <span>{focusMinutes}/{goalFocus} {t('minutes_short')}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Detailed Charts Section (BarChart, beautified Y axis) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Task Chart */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <div className="text-lg font-semibold mb-4">{t('tasks_completed_last_7_days')}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={taskChart.map((v, i) => ({ name: t('day_n', { n: i + 1 }), value: v }))} layout="vertical" margin={{ left: 40, right: 20, top: 20, bottom: 20 }}>
              <XAxis type="number" tick={{ fontSize: 14, fill: '#82ca9d' }} />
              <YAxis dataKey="name" type="category" tick={{ fontWeight: 'bold', fontSize: 15, fill: '#333' }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 4, 4]} label={{ position: 'right', fill: '#82ca9d', fontSize: 16, fontWeight: 'bold' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Focus Timer Chart */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col">
          <div className="text-lg font-semibold mb-4">{t('focus_time_last_7_days')}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={focusChart.map((v, i) => ({ name: t('day_n', { n: i + 1 }), value: v }))} layout="vertical" margin={{ left: 40, right: 20, top: 20, bottom: 20 }}>
              <XAxis type="number" tick={{ fontSize: 14, fill: '#21b4ca' }} />
              <YAxis dataKey="name" type="category" tick={{ fontWeight: 'bold', fontSize: 15, fill: '#333' }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#21b4ca" radius={[4, 4, 4, 4]} label={{ position: 'right', fill: '#21b4ca', fontSize: 16, fontWeight: 'bold' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;