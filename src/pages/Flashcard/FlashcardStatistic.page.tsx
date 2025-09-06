import React, { useEffect, useState } from 'react';
import FlashcardSidebar from './FlashcardSidebar';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import {
  PIE_COLORS,
  StatItem,
} from '../../components/statistic/flashcardStatistic.component';
import {
  DeckDueItem,
  ReviewStatistics,
} from '../../types/flashcard/props/component.props';
import flashcardService from '../../services/flashcard.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const FlashcardStatistic: React.FC = () => {
  const { t } = useAppTranslate('flashcard');
  const [stats, setStats] = useState<ReviewStatistics | null>(null);
  const [deckDue, setDeckDue] = useState<DeckDueItem[]>([]);
  const [reviewsEachDay, setReviewsEachDay] = useState<any[]>([]);
  const [learningLevel, setLearningLevel] = useState<
    | {
        name: string;
        value: number;
      }[]
    | undefined
  >(undefined);

  const fetchData = async () => {
    const data = await flashcardService.getFlashcardStatistic();

    const { dueTodayPerDeck, reviewsByDay, ...statsOverview } = data;

    console.log(data);

    setStats(statsOverview);
    setDeckDue(dueTodayPerDeck);
    setReviewsEachDay(reviewsByDay);
    setLearningLevel([
      { name: t('new'), value: statsOverview.newCount },
      { name: t('learning'), value: statsOverview.learningCount },
      { name: t('reviewing'), value: statsOverview.reviewingCount },
    ]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen">
      <FlashcardSidebar currentSelected="flashcard-statistic" />
      <div className="flex-1 transition-all duration-300 ease-in-out h-full w-full overflow-auto ">
        <div className="p-8">
          {/* Main Content Area */}
          <div className="flex-1 p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {t('flashcard_statistics')}
              </h1>
            </div>

            {!stats && <div className="p-6">{t('loading')}</div>}

            {stats && (
              <div className="flex flex-col gap-4">
                {/* Top panel */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white rounded-2xl shadow">
                  <StatItem label={t('decks')} value={stats.totalDeckCount ?? 0} />
                  <StatItem
                    label={t('flashcards')}
                    value={stats.totalFlashcardCount ?? 0}
                  />
                  <StatItem
                    label={t('review_sessions')}
                    value={stats.reviewedCount ?? 0}
                  />
                  <StatItem
                    label={t('due_today')}
                    value={stats.dueTodayCount ?? 0}
                  />
                  <StatItem
                    label={t('reviewed_percent')}
                    value={stats.percentReviewed ? `${stats.percentReviewed.toFixed(2)}%` : 0}
                  />
                  <StatItem
                    label={t('week_reviewed')}
                    value={stats.reviewsThisWeekCount ?? 0}
                  />
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-2xl shadow p-4">
                  <h2 className="text-lg font-semibold mb-2">
                    {t('flashcard_status')}
                  </h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={learningLevel}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {learningLevel?.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow p-4">
                  <h2 className="text-lg font-semibold mb-2">
                    {t('daily_reviews_calendar')}
                  </h2>
                  <CalendarHeatmap
                    startDate={
                      new Date(new Date().setMonth(new Date().getMonth() - 8))
                    } // 8 tháng gần nhất
                    endDate={new Date()}
                    values={reviewsEachDay}
                    classForValue={() => {}}
                    transformDayElement={(element, value) => {
                      const count = value?.count || 0;

                      let fill = '#eee'; // default color
                      if (count >= 15) {
                        fill = '#196127';
                      } else if (count >= 10) {
                        fill = '#239a3b';
                      } else if (count >= 5) {
                        fill = '#7bc96f';
                      } else if (count >= 1) {
                        fill = '#c6e48b';
                      }

                      return React.cloneElement(element, {
                        style: {
                          fill,
                          stroke: 'transparent',
                          outline: 'none',
                        },
                        'data-tooltip-id': 'heatmap-tooltip',
                        'data-tooltip-content': value
                          ? `${value.date} : ${value.count || 0} ${t('reviews')}`
                          : `0 ${t('reviews')}`,
                      });
                    }}
                  />
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-2xl shadow p-4">
                  <h2 className="text-lg font-semibold mb-2">
                    {t('due_today_per_deck')}
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deckDue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="deckTitle"
                        tick={{
                          style: { fontSize: '14px', fill: '#666' },
                        }}
                        tickFormatter={value =>
                          value.length > 5
                            ? `${value.substring(0, 5)}...`
                            : value
                        }
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="dueTodayCount" fill="green" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
        <ReactTooltip id="heatmap-tooltip" place="top" />
      </div>
    </div>
  );
};

export default FlashcardStatistic;
