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
import {
  deckDueItemsData,
  PIE_COLORS,
  reviewStatisticData,
  StatItem,
} from '../../components/statistic/flashcardStatistic.component';
import {
  DeckDueItem,
  ReviewStatistics,
} from '../../types/flashcard/props/component.props';

const FlashcardStatistic: React.FC = () => {
  const [stats, setStats] = useState<ReviewStatistics | null>(null);
  const [deckDueData, setDeckDueData] = useState<DeckDueItem[]>([]);
  const pieData = [
    { name: 'New', value: reviewStatisticData.newCount },
    { name: 'Learning', value: reviewStatisticData.learningCount },
    { name: 'Reviewing', value: reviewStatisticData.reviewingCount },
  ];
  // const StatisticCard = ({
  //   title,
  //   count,
  //   subtitle,
  // }: {
  //   title: string;
  //   count: number;
  //   subtitle: string;
  // }) => {
  //   return (
  //     <div className="border border-gray-300 rounded-lg p-6 w-64 text-center">
  //       <h3 className="text-lg font-medium">{title}</h3>
  //       <p className="text-4xl font-bold my-2">{count}</p>
  //       <p className="text-sm">{subtitle}</p>
  //     </div>
  //   );
  // };

  useEffect(() => {
    setStats(reviewStatisticData);
    setDeckDueData(deckDueItemsData);
  }, []);

  return (
    <div className="flex flex-row min-h-screen">
      <FlashcardSidebar currentSelected="flashcard-statistic" />
      <div className="w-full max-w-4xl min-h-screen mx-auto p-4 sm:p-6 lg:p-8">
        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Flashcard Statistics
            </h1>
          </div>

          {!stats && <div className="p-6">Loading...</div>}

          {stats && (
            <div className='flex flex-col gap-4'>
              {/* Top panel */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white rounded-2xl shadow">
                <StatItem label="Decks" value={stats.totalDeckCount} />
                <StatItem
                  label="Flashcards"
                  value={stats.totalFlashcardCount}
                />
                <StatItem
                  label="Review Sessions"
                  value={stats.totalReviewSessionCount}
                />
                <StatItem label="Due Today" value={stats.dueTodayCount} />
                <StatItem
                  label="Average Ease Factor"
                  value={stats.averageEaseFactor.toFixed(2)}
                />
                <StatItem
                  label="Average Quality"
                  value={stats.averageQuality.toFixed(2)}
                />
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-2xl shadow p-4">
                <h2 className="text-lg font-semibold mb-2">Flashcard Status</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-2xl shadow p-4">
                <h2 className="text-lg font-semibold mb-2">
                  Due Today per Deck
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deckDueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="deckTitle" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="dueTodayCount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardStatistic;
