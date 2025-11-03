import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { StatsPeriod, MembershipStats } from '../../types/membership-stats.type';
import { formatVND } from '../../utils/currency.utils';

interface TrendComparisonChartProps {
    monthlyData: StatsPeriod[];
    packages: MembershipStats[];
}

type MetricType = 'revenue' | 'activeUsers' | 'newSubscribers';

// Mock data for package trends
const generatePackageTrendData = (
    monthlyData: StatsPeriod[],
    packages: MembershipStats[],
    metric: MetricType,
) => {
    const basicRevenue = Math.round(
        packages[0].totalRevenue / 12 + Math.random() * 100000,
    );
    const plusRevenue = Math.round(packages[1].totalRevenue / 12 + Math.random() * 200000);
    const businessRevenue = Math.round(
        packages[2].totalRevenue / 12 + Math.random() * 150000,
    );

    const basicUsers = Math.round(packages[0].activeUsers * 0.8);
    const plusUsers = Math.round(packages[1].activeUsers * 0.9);
    const businessUsers = Math.round(packages[2].activeUsers * 0.95);

    return monthlyData.map((data, index) => {
        if (metric === 'revenue') {
            return {
                month: data.month,
                Basic: Math.round(basicRevenue * (0.9 + Math.random() * 0.2)),
                Plus: Math.round(plusRevenue * (0.9 + Math.random() * 0.2)),
                Business: Math.round(businessRevenue * (0.9 + Math.random() * 0.2)),
            };
        } else if (metric === 'activeUsers') {
            return {
                month: data.month,
                Basic: Math.round(basicUsers * (0.8 + Math.random() * 0.3)),
                Plus: Math.round(plusUsers * (0.85 + Math.random() * 0.3)),
                Business: Math.round(businessUsers * (0.9 + Math.random() * 0.3)),
            };
        } else {
            return {
                month: data.month,
                Basic: Math.round(packages[0].newSubscribers * (0.7 + Math.random() * 0.6)),
                Plus: Math.round(packages[1].newSubscribers * (0.7 + Math.random() * 0.6)),
                Business: Math.round(packages[2].newSubscribers * (0.7 + Math.random() * 0.6)),
            };
        }
    });
};

const TrendComparisonChart: React.FC<TrendComparisonChartProps> = ({
    monthlyData,
    packages,
}) => {
    const [metric, setMetric] = useState<MetricType>('revenue');

    const chartData = generatePackageTrendData(monthlyData, packages, metric);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border-2 border-gray-300 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                            {entry.name}:{' '}
                            {metric === 'revenue'
                                ? formatVND(entry.value, false)
                                : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Package Trends Comparison
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        12-month performance trends for each membership package
                    </p>
                </div>

                {/* Metric Toggle */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setMetric('revenue')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${metric === 'revenue'
                                ? 'bg-green-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        💰 Revenue
                    </button>
                    <button
                        onClick={() => setMetric('activeUsers')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${metric === 'activeUsers'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        👥 Active Users
                    </button>
                    <button
                        onClick={() => setMetric('newSubscribers')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${metric === 'newSubscribers'
                                ? 'bg-amber-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        📈 New Subscribers
                    </button>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="month"
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="line"
                        height={36}
                    />
                    <Line
                        type="monotone"
                        dataKey="Basic"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        dot={{ fill: '#F59E0B', r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Basic Package"
                    />
                    <Line
                        type="monotone"
                        dataKey="Plus"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: '#10B981', r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Plus Package"
                    />
                    <Line
                        type="monotone"
                        dataKey="Business"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Business Package"
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Trend Analysis */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                {packages.map((pkg, index) => {
                    const color =
                        index === 0
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : index === 1
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-blue-50 border-blue-200 text-blue-700';

                    const lastValue = chartData[chartData.length - 1];
                    const firstValue = chartData[0];
                    const packageKey = pkg.packageName as 'Basic' | 'Plus' | 'Business';
                    const change = lastValue[packageKey] - firstValue[packageKey];
                    const changePercent = (
                        ((change) / firstValue[packageKey]) *
                        100
                    ).toFixed(1);

                    return (
                        <div key={pkg.packageLevel} className={`p-4 rounded-lg border-2 ${color}`}>
                            <p className="text-sm font-semibold mb-3">📦 {pkg.packageName} Package</p>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-gray-600">Current {metric === 'revenue' ? '(VND)' : ''}</p>
                                    <p className="text-lg font-bold">
                                        {metric === 'revenue'
                                            ? formatVND(lastValue[packageKey], false)
                                            : lastValue[packageKey]}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {change >= 0 ? '📈' : '📉'} {change >= 0 ? '+' : ''}
                                        {changePercent}% YoY
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TrendComparisonChart;
