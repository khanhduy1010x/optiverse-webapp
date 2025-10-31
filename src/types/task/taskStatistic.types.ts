export type TimePeriod = 'day' | 'week' | 'month' | 'year';

export interface PeriodStatistics {
  completed: number;
  pending: number;
  overdue: number;
  total: number;
  percentCompleted: number;
}

export interface ChartDataPoint {
  label: string;
  completed: number;
  pending: number;
  overdue: number;
}

export interface TaskStatisticByPeriod {
  period: TimePeriod;
  statistics: PeriodStatistics;
  chartData: ChartDataPoint[];
  loading: boolean;
}
