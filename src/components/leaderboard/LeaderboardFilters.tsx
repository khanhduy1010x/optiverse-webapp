import React, { useState, useRef, useEffect } from 'react';
import { TimePeriod, RankingMetric } from '../../services/leaderboard/leaderboard.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface LeaderboardFiltersProps {
  timePeriod: TimePeriod;
  metric: RankingMetric;
  onTimePeriodChange: (period: TimePeriod) => void;
  onMetricChange: (metric: RankingMetric) => void;
}

const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({
  timePeriod,
  metric,
  onTimePeriodChange,
  onMetricChange,
}) => {
  const { t } = useAppTranslate('leaderboard');
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);
  const periodDropdownRef = useRef<HTMLDivElement>(null);
  const metricDropdownRef = useRef<HTMLDivElement>(null);

  const periodOptions = [
    { label: t('weekly'), value: TimePeriod.WEEKLY },
    { label: t('monthly'), value: TimePeriod.MONTHLY },
  ];

  const metricOptions = [
    { label: t('total_spending'), value: RankingMetric.TOTAL_SPENDING },
    { label: t('total_products'), value: RankingMetric.TOTAL_PRODUCTS },
  ];

  const getDisplayLabel = (value: string | TimePeriod | RankingMetric, options: any[]) => {
    return options.find(opt => opt.value === value)?.label || value;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target as Node)) {
        if (metricDropdownRef.current && !metricDropdownRef.current.contains(event.target as Node)) {
          setExpandedDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/50 p-5 space-y-6">
      {/* Time Period Filter */}
      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
          {t('time_period')}
        </label>
        <div className="flex flex-col gap-2">
          {periodOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onTimePeriodChange(option.value)}
              className={`w-full py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 text-left ${
                timePeriod === option.value
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200/50"></div>

      {/* Ranking Metric Filter */}
      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
          {t('ranking_by')}
        </label>
        <div className="flex flex-col gap-2">
          {metricOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onMetricChange(option.value)}
              className={`w-full py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 text-left ${
                metric === option.value
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardFilters;
