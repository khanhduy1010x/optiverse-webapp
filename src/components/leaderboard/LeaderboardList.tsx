import React from 'react';
import { LeaderboardEntry, RankingMetric } from '../../services/leaderboard/leaderboard.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  metric: RankingMetric;
  loading: boolean;
}

const LeaderboardList: React.FC<LeaderboardListProps> = ({
  entries,
  metric,
  loading,
}) => {
  const { t } = useAppTranslate('leaderboard');
  
  // Show only top 10
  const topEntries = entries.slice(0, 10);

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' OP';
  };

  return (
    <div className="space-y-6">
      {/* Main Data Table */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 rounded-full border-3 border-gray-300 border-t-blue-500 animate-spin"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600 font-medium">{t('no_ranking_data')}</p>
          <p className="text-gray-500 text-sm mt-1">{t('come_back_later')}</p>
        </div>
      ) : (
        <>
          {/* Table Wrapper */}
          <div className="overflow-x-auto -mx-6 lg:-mx-10 shadow-lg rounded-2xl border-2 border-gray-200">
            {/* Table Header */}
            <div className="bg-gray-50 border-b-2 border-gray-200 px-6 lg:px-10 rounded-t-2xl">
              <div className={`grid gap-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-widest min-w-full ${
                metric === RankingMetric.TOTAL_SPENDING 
                  ? 'grid-cols-7' 
                  : 'grid-cols-8'
              }`}>
                <div className="col-span-1">{t('rank')}</div>
                <div className="col-span-4">{t('leaderboard')}</div>
                {metric === RankingMetric.TOTAL_PRODUCTS && (
                  <div className="col-span-2 text-right">{t('products')}</div>
                )}
                {metric === RankingMetric.TOTAL_SPENDING && (
                  <div className="col-span-2 text-right">{t('spending')}</div>
                )}
                {metric === RankingMetric.TOTAL_PRODUCTS && (
                  <div className="col-span-1 text-right">{t('op_points')}</div>
                )}
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y-2 divide-gray-200 rounded-b-2xl">
              {topEntries.map((entry, index) => {
                const isTop3 = entry.rank <= 3;
                const bgColor = 
                  entry.rank === 1 ? 'bg-yellow-50/60' :
                  entry.rank === 2 ? 'bg-gray-50/60' :
                  entry.rank === 3 ? 'bg-orange-50/60' :
                  'hover:bg-gray-50/30';

                return (
                  <div
                    key={`${entry.userId}-${index}`}
                    className={`grid gap-6 px-6 lg:px-10 py-4 transition-colors ${bgColor} ${!isTop3 ? 'hover:bg-gray-50' : ''} min-w-full ${
                      metric === RankingMetric.TOTAL_SPENDING 
                        ? 'grid-cols-7' 
                        : 'grid-cols-8'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex items-center">
                      <span className="text-xl font-bold">
                        {getMedalIcon(entry.rank) || `#${entry.rank}`}
                      </span>
                    </div>

                    {/* User */}
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <img
                        src={entry.userAvatar || 'https://via.placeholder.com/40'}
                        alt={entry.userName}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm">{entry.userName}</p>
                      </div>
                    </div>

                    {/* Products - Show only if Products metric */}
                    {metric === RankingMetric.TOTAL_PRODUCTS && (
                      <div className="col-span-2 flex items-center justify-end">
                        <p className="font-semibold text-gray-900 text-sm">{entry.totalProducts}</p>
                      </div>
                    )}

                    {/* Spending - Show only if Spending metric */}
                    {metric === RankingMetric.TOTAL_SPENDING && (
                      <div className="col-span-2 flex items-center justify-end">
                        <p className="font-semibold text-gray-900 text-sm">{formatCurrency(entry.totalSpending)}</p>
                      </div>
                    )}

                    {/* OP Points - Show only if Products metric */}
                    {metric === RankingMetric.TOTAL_PRODUCTS && (
                      <div className="col-span-1 flex items-center justify-end">
                        <p className="font-bold text-gray-900 text-sm">{formatCurrency(entry.totalSpending)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardList;
