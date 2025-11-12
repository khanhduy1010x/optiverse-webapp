import React, { useMemo } from 'react';
import TaskSidebar from '../../pages/Task/TaskSidebar.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { StatItem, PIE_COLORS } from '../../components/statistic/flashcardStatistic.component';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import useTaskStatistic from '../../hooks/task/useTaskStatistic.hook';
import { useNavigate } from 'react-router-dom';
import { TimePeriod } from '../../types/task/taskStatistic.types';

export const TaskStatisticScreen: React.FC = () => {
  const { t } = useAppTranslate('task');
  const { 
    tasks, 
    loading, 
    completedCount, 
    pendingCount, 
    overdueCount, 
    percentCompleted, 
    period,
    setPeriod,
    periodStatistics,
    chartData
  } = useTaskStatistic();
  const navigate = useNavigate();
  
  const handleNavigate = (menu: string, _path?: string) => {
    if (menu === 'task-event') {
      navigate('/task?menu=task-event');
    } else {
      navigate('/task');
    }
  };

  const periodLabels: Record<TimePeriod, string> = {
    day: t('day') || 'Day',
    week: t('week') || 'Week',
    month: t('month') || 'Month',
    year: t('year') || 'Year',
  };

  const pieData = useMemo(() => ([
    { name: t('completed'), value: periodStatistics.completed },
    { name: t('pending'), value: periodStatistics.pending },
    { name: t('overdue'), value: periodStatistics.overdue },
  ]), [periodStatistics.completed, periodStatistics.pending, periodStatistics.overdue, t]);

  const barData = useMemo(() => {
    return chartData.map(item => ({
      name: item.label,
      completed: item.completed,
      pending: item.pending,
      overdue: item.overdue,
    }));
  }, [chartData]);

  const getPeriodLabel = (): string => {
    const now = new Date();
    switch (period) {
      case 'day': {
        return now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      }
      case 'week': {
        const first = now.getDate() - now.getDay();
        const weekStart = new Date(now.setDate(first));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
      case 'month': {
        return now.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      }
      case 'year': {
        return now.getFullYear().toString();
      }
    }
  };

  return (
    <div className="flex h-screen">
      <TaskSidebar selectedMenu="task-statistic" handleNavigate={handleNavigate} />

      <div className="flex-1 transition-all duration-300 ease-in-out h-full w-full overflow-auto">
        <div className="p-8">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('task_statistics')}</h1>
                <p className="text-sm text-gray-600 mt-1">{getPeriodLabel()}</p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 mb-6">
              {(['day', 'week', 'month', 'year'] as TimePeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    period === p
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>

            {loading && <div className="p-6">{t('loading')}</div>}

            {!loading && (
              <div className="flex flex-col gap-4">
                {/* Period Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">{t('completed')}</p>
                    <p className="text-2xl font-bold text-green-600">{periodStatistics.completed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">{t('pending')}</p>
                    <p className="text-2xl font-bold text-yellow-600">{periodStatistics.pending}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">{t('overdue')}</p>
                    <p className="text-2xl font-bold text-red-600">{periodStatistics.overdue}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">{t('completion_rate')}</p>
                    <p className="text-2xl font-bold text-blue-600">{periodStatistics.percentCompleted}%</p>
                  </div>
                </div>

                {/* Pie Chart - Overall Status */}
                <div className="bg-white rounded-2xl shadow p-4">
                  <h2 className="text-lg font-semibold mb-2">{t('by_status')}</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart - Period Distribution */}
                <div className="bg-white rounded-2xl shadow p-4">
                  <h2 className="text-lg font-semibold mb-2">
                    {period === 'day' && t('Tasks By Hour')}
                    {period === 'week' && t('Tasks By Day')}
                    {period === 'month' && t('Tasks By Date')}
                    {period === 'year' && t('Tasks By Month')}
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData} margin={{ right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#4ade80" stackId="a" />
                      <Bar dataKey="pending" fill="#fbbf24" stackId="a" />
                      <Bar dataKey="overdue" fill="#ef4444" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskStatisticScreen;