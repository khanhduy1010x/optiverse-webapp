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

// Mock data for package trends - dynamically supports any number of packages
const generatePackageTrendData = (
    monthlyData: StatsPeriod[],
    packages: MembershipStats[],
    metric: MetricType,
) => {
    return monthlyData.map((data) => {
        const monthData: any = { month: data.month };
        
        packages.forEach((pkg, index) => {
            const baseValue = metric === 'revenue' 
                ? pkg.totalRevenue / 12 
                : metric === 'activeUsers' 
                    ? pkg.activeUsers 
                    : pkg.newSubscribers;
            
            // Add random variation ±20%
            const variation = 0.9 + Math.random() * 0.2;
            monthData[pkg.packageName] = Math.round(baseValue * variation);
        });
        
        return monthData;
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
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${metric === 'revenue'
                                ? 'bg-green-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <path d="M12 6v2m0 8v2m-1-7h1.5a1.5 1.5 0 0 1 0 3H11v0a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1-1.5 1.5H10"/>
                        </svg>
                        Revenue
                    </button>
                    <button
                        onClick={() => setMetric('activeUsers')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${metric === 'activeUsers'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm8 0c-.33 0-.71.03-1.14.08 1.37.81 2.14 1.88 2.14 3.92v3h6v-3c0-2.66-5.33-4-7-4z"/>
                        </svg>
                        Active Users
                    </button>
                    <button
                        onClick={() => setMetric('newSubscribers')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${metric === 'newSubscribers'
                                ? 'bg-amber-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        New Subscribers
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
                    {packages.map((pkg, index) => {
                        const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
                        const color = colors[index % colors.length];
                        return (
                            <Line
                                key={pkg.packageLevel}
                                type="monotone"
                                dataKey={pkg.packageName}
                                stroke={color}
                                strokeWidth={2.5}
                                dot={{ fill: color, r: 4 }}
                                activeDot={{ r: 6 }}
                                name={pkg.packageName}
                            />
                        );
                    })}
                </LineChart>
            </ResponsiveContainer>

            {/* Trend Analysis */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {packages.map((pkg, index) => {
                    const colorClasses = [
                        'bg-amber-50 border-amber-200 text-amber-700',
                        'bg-green-50 border-green-200 text-green-700',
                        'bg-blue-50 border-blue-200 text-blue-700',
                        'bg-red-50 border-red-200 text-red-700',
                        'bg-purple-50 border-purple-200 text-purple-700',
                        'bg-pink-50 border-pink-200 text-pink-700',
                        'bg-cyan-50 border-cyan-200 text-cyan-700',
                        'bg-lime-50 border-lime-200 text-lime-700',
                    ];
                    const color = colorClasses[index % colorClasses.length];

                    const lastValue = chartData[chartData.length - 1];
                    const firstValue = chartData[0];
                    const packageKey = pkg.packageName;
                    const change = lastValue[packageKey] - firstValue[packageKey];
                    const changePercent = (
                        ((change) / firstValue[packageKey]) *
                        100
                    ).toFixed(1);

                    return (
                        <div key={pkg.packageLevel} className={`p-3 rounded-lg border-2 ${color}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                                </svg>
                                <p className="text-sm font-semibold truncate">{pkg.packageName}</p>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-gray-600">Current {metric === 'revenue' ? '(VND)' : ''}</p>
                                    <p className="text-base font-bold">
                                        {metric === 'revenue'
                                            ? formatVND(lastValue[packageKey], false)
                                            : lastValue[packageKey]}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <svg className={`w-4 h-4 shrink-0 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={change >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                                    </svg>
                                    <p className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {change >= 0 ? '+' : ''}{changePercent}% YoY
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
