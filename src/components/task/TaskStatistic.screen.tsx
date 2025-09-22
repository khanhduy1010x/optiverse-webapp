import React, { useMemo } from 'react';
import TaskSidebar from '../../pages/Task/TaskSidebar.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import { StatItem, PIE_COLORS } from '../../components/statistic/flashcardStatistic.component';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import useTaskStatistic from '../../hooks/task/useTaskStatistic.hook';
import { useNavigate } from 'react-router-dom';

export const TaskStatisticScreen: React.FC = () => {
  const { t } = useAppTranslate('task');
  const { tasks, loading, completedCount, pendingCount, overdueCount, percentCompleted, weekByDay } = useTaskStatistic();
  const navigate = useNavigate();
  const handleNavigate = (menu: string, _path?: string) => {
     if (menu === 'task-event') {
       navigate('/task?menu=task-event');
     } else {
       navigate('/task');
     }
   };

  const pieData = useMemo(() => ([
    { name: t('completed'), value: completedCount },
    { name: t('pending'), value: pendingCount },
    { name: t('overdue'), value: overdueCount },
  ]), [completedCount, pendingCount, overdueCount, t]);

  const barData = useMemo(() => {
    const days = [
      t('day_sun'), t('day_mon'), t('day_tue'), t('day_wed'), t('day_thu'), t('day_fri'), t('day_sat')
    ];
    return days.map((d, idx) => ({ day: d, completed: weekByDay[idx] || 0 }));
  }, [weekByDay, t]);

  return (
    <div className="flex h-screen">
      <TaskSidebar selectedMenu="task-statistic" handleNavigate={handleNavigate} />

      <div className="flex-1 transition-all duration-300 ease-in-out h-full w-full overflow-auto ">
        <div className="p-8">
          <div className="flex-1 p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{t('task_statistics')}</h1>
            </div>

            {loading && <div className="p-6">{t('loading')}</div>}

            {!loading && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white rounded-2xl shadow">
                  <StatItem label={t('all')} value={tasks.length} />
                  <StatItem label={t('completed')} value={completedCount} />
                  <StatItem label={t('pending')} value={pendingCount} />
                  <StatItem label={t('overdue')} value={overdueCount} />
                  <StatItem label={t('completion_rate')} value={`${percentCompleted}%`} />
                </div>

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

                <div className="bg-white rounded-2xl shadow p-4">
                  <h2 className="text-lg font-semibold mb-2">{t('tasks_by_day')}</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#4ade80" />
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