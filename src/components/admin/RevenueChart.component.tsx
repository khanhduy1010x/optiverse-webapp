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

interface RevenueChartProps {
    monthlyData: StatsPeriod[];
}

type ChartMode = 'revenue' | 'users' | 'newSubscribers';

const RevenueChart: React.FC<RevenueChartProps> = ({ monthlyData }) => {
    const [chartMode, setChartMode] = useState<ChartMode>('revenue');

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow">
                    <p className="font-semibold text-gray-900">{data.month}</p>
                    {chartMode === 'revenue' && (
                        <p className="text-sm text-green-600">Revenue: {formatVND(data.revenue)}</p>
                    )}
                    {chartMode === 'users' && (
                        <p className="text-sm text-blue-600">Active Users: {data.activeUsers}</p>
                    )}
                    {chartMode === 'newSubscribers' && (
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
                    12-Month Performance Overview
                </h3>

                {/* Chart Mode Toggle */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setChartMode('revenue')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${chartMode === 'revenue'
                                ? 'bg-green-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        💰 Revenue
                    </button>
                    <button
                        onClick={() => setChartMode('users')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${chartMode === 'users'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        👥 Active Users
                    </button>
                    <button
                        onClick={() => setChartMode('newSubscribers')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${chartMode === 'newSubscribers'
                                ? 'bg-amber-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        📈 New Subscribers
                    </button>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                {chartMode === 'revenue' ? (
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="#10B981" name="Revenue (VND)" />
                    </BarChart>
                ) : chartMode === 'users' ? (
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
        </div>
    );
};

export default RevenueChart;
