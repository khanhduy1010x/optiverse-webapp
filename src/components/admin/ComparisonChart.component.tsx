import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { StatsPeriod } from '../../types/membership-stats.type';
import { formatVND } from '../../utils/currency.utils';

interface ComparisonChartProps {
    monthlyData: StatsPeriod[];
}

type MetricType = 'revenue' | 'activeUsers' | 'newSubscribers';

const ComparisonChart: React.FC<ComparisonChartProps> = ({ monthlyData }) => {
    const [metric, setMetric] = useState<MetricType>('revenue');

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow">
                    <p className="font-semibold text-gray-900">{data.month}</p>
                    {metric === 'revenue' && (
                        <p className="text-sm text-green-600">Revenue: {formatVND(data.revenue)}</p>
                    )}
                    {metric === 'activeUsers' && (
                        <p className="text-sm text-blue-600">Active Users: {data.activeUsers}</p>
                    )}
                    {metric === 'newSubscribers' && (
                        <p className="text-sm text-amber-600">New Subscribers: {data.newSubscribers}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Performance Metrics Comparison
                </h3>

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
                {metric === 'revenue' ? (
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="#10B981" name="Revenue (VND)" />
                    </BarChart>
                ) : metric === 'activeUsers' ? (
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="activeUsers"
                            stroke="#3B82F6"
                            name="Active Users"
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6' }}
                        />
                    </LineChart>
                ) : (
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="newSubscribers" fill="#F59E0B" name="New Subscribers" />
                    </BarChart>
                )}
            </ResponsiveContainer>

            {/* Stats Summary */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                {metric === 'revenue' && (
                    <>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
                            <p className="text-lg font-bold text-green-600">
                                {formatVND(monthlyData.reduce((sum, m) => sum + m.revenue, 0), false)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-gray-600 mb-1">Average/Month</p>
                            <p className="text-lg font-bold text-green-600">
                                {formatVND(
                                    monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length,
                                    false,
                                )}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-gray-600 mb-1">Highest Month</p>
                            <p className="text-lg font-bold text-green-600">
                                {formatVND(Math.max(...monthlyData.map((m) => m.revenue)), false)}
                            </p>
                        </div>
                    </>
                )}

                {metric === 'activeUsers' && (
                    <>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-gray-600 mb-1">Total Active Users</p>
                            <p className="text-lg font-bold text-blue-600">
                                {monthlyData.reduce((sum, m) => sum + m.activeUsers, 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-gray-600 mb-1">Average/Month</p>
                            <p className="text-lg font-bold text-blue-600">
                                {Math.round(
                                    monthlyData.reduce((sum, m) => sum + m.activeUsers, 0) /
                                    monthlyData.length,
                                )}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-gray-600 mb-1">Peak Users</p>
                            <p className="text-lg font-bold text-blue-600">
                                {Math.max(...monthlyData.map((m) => m.activeUsers))}
                            </p>
                        </div>
                    </>
                )}

                {metric === 'newSubscribers' && (
                    <>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-xs text-gray-600 mb-1">Total New Subscribers</p>
                            <p className="text-lg font-bold text-amber-600">
                                {monthlyData.reduce((sum, m) => sum + m.newSubscribers, 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-xs text-gray-600 mb-1">Average/Month</p>
                            <p className="text-lg font-bold text-amber-600">
                                {Math.round(
                                    monthlyData.reduce((sum, m) => sum + m.newSubscribers, 0) /
                                    monthlyData.length,
                                )}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-xs text-gray-600 mb-1">Best Month</p>
                            <p className="text-lg font-bold text-amber-600">
                                {Math.max(...monthlyData.map((m) => m.newSubscribers))}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ComparisonChart;
