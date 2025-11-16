import React, { useState, useEffect } from 'react';
import LeaderboardFilters from './LeaderboardFilters';
import LeaderboardList from './LeaderboardList';
import leaderboardService, { TimePeriod, RankingMetric, LeaderboardResponse } from '../../services/leaderboard/leaderboard.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const Leaderboard: React.FC = () => {
  const { t } = useAppTranslate('leaderboard');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.MONTHLY);
  const [metric, setMetric] = useState<RankingMetric>(RankingMetric.TOTAL_SPENDING);
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [timePeriod, metric, page]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await leaderboardService.getLeaderboard({
        timePeriod,
        metric,
        page,
        limit,
      });
      setData(response);
    } catch (err: any) {
      setError(err.message || t('failed_to_fetch'));
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    setPage(1); // Reset to first page when changing filters
  };

  const handleMetricChange = (newMetric: RankingMetric) => {
    setMetric(newMetric);
    setPage(1); // Reset to first page when changing filters
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPeriodDate = (periodString?: string) => {
    if (!periodString) return '';
    // Parse "2025-11-01 to 2025-11-30"
    const dates = periodString.split(' to ');
    if (dates.length !== 2) return periodString;

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    try {
      const startDate = new Date(dates[0].trim());
      const endDate = new Date(dates[1].trim());
      return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`;
    } catch {
      return periodString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto px-0 lg:px-0">
        {/* Main Content - No Card Style */}
        <div className="p-0 lg:p-0">
          
          {/* Header - Left Aligned */}
          <div className="mb-12 pb-8 border-b border-gray-200/50 pl-4 lg:pl-12">
            <h1 className="text-5xl font-bold text-gray-900">{t('leaderboard_title')}</h1>
            <p className="text-base text-gray-600 mt-2">{t('leaderboard_subtitle')}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 ml-4 lg:ml-12">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900">{t('error')}</h3>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Filters - Segmented Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 pb-12 border-b border-gray-200/50 pl-4 lg:pl-12">
            {/* Time Period */}
            <div>
              <label className="text-sm font-semibold text-gray-600 uppercase tracking-widest mb-4 block">
                {t('time_period')}
              </label>
              <div className="inline-flex gap-2 bg-gray-100 rounded-lg p-2">
                {[
                  { label: t('weekly'), value: TimePeriod.WEEKLY },
                  { label: t('monthly'), value: TimePeriod.MONTHLY },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleTimePeriodChange(option.value)}
                    className={`px-5 py-3 rounded-md font-semibold text-base transition-all duration-200 ${
                      timePeriod === option.value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ranking Metric */}
            <div>
              <label className="text-sm font-semibold text-gray-600 uppercase tracking-widest mb-4 block">
                {t('ranking_by')}
              </label>
              <div className="inline-flex gap-2 bg-gray-100 rounded-lg p-2">
                {[
                  { label: t('total_spending'), value: RankingMetric.TOTAL_SPENDING },
                  { label: t('total_products'), value: RankingMetric.TOTAL_PRODUCTS },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleMetricChange(option.value)}
                    className={`px-5 py-3 rounded-md font-semibold text-base transition-all duration-200 ${
                      metric === option.value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        {/* Summary Cards */}
        {data && data.entries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 pl-4 lg:pl-12">
            {/* Ranked Users Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition-all shadow-lg hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">👥</span>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest">{t('total')}</p>
              </div>
              <p className="text-base text-gray-600 mb-2">{t('ranked_users')}</p>
              <p className="text-4xl font-bold text-gray-900">{data.total}</p>
            </div>

            {/* Top User Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition-all shadow-lg hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏆</span>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest">{t('top_1')}</p>
              </div>
              <p className="text-base text-gray-600 mb-3">{t('top_user')}</p>
              <div className="flex items-center gap-3">
                {data.entries[0]?.userAvatar ? (
                  <img
                    src={data.entries[0].userAvatar}
                    alt={data.entries[0]?.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-xs text-yellow-600">
                    {data.entries[0]?.userName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <p className="font-semibold text-gray-900 truncate text-base">{data.entries[0]?.userName}</p>
              </div>
            </div>

            {/* Time Period Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-300 transition-all shadow-lg hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📅</span>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest">{t('period')}</p>
              </div>
              <p className="text-base text-gray-600 mb-2">{t('time_period')}</p>
              <p className="text-xl font-bold text-gray-900">
                {data?.entries[0]?.period ? formatPeriodDate(data.entries[0].period) : t('period')}
              </p>
            </div>
          </div>
        )}

        {/* Main Leaderboard Table */}
        <div className="pl-4 lg:pl-12">
          <LeaderboardList
            entries={data?.entries || []}
            metric={metric}
            loading={loading}
            page={page}
            totalPages={data?.totalPages || 1}
            onPageChange={handlePageChange}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
