import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { MembershipStats } from '../../types/membership-stats.type';

interface PackageComparisonChartProps {
    packages: MembershipStats[];
}

type ChartMetric = 'revenue' | 'activeUsers' | 'newSubscribers';

const PackageComparisonChart: React.FC<PackageComparisonChartProps> = ({ packages }) => {
    const [metric, setMetric] = useState<ChartMetric>('revenue');

    // Prepare data for chart
    const chartData = packages.map((pkg) => ({
        name: pkg.packageName,
        revenue: pkg.totalRevenue,
        activeUsers: pkg.activeUsers,
        newSubscribers: pkg.newSubscribers,
        level: pkg.packageLevel,
    }));

    const getBarColor = (index: number): string => {
        const colors = ['#F59E0B', '#10B981', '#3B82F6']; // Amber, Green, Blue
        return colors[index] || '#6B7280';
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow">
                    <p className="font-semibold text-gray-900">{data.name}</p>
                    {metric === 'revenue' && (
                        <p className="text-sm text-green-600">Revenue: {data.revenue.toLocaleString()} VND</p>
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
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Package Performance Comparison
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Compare metrics across all membership packages</p>
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

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                        dataKey={metric}
                        fill={metric === 'revenue' ? '#10B981' : metric === 'activeUsers' ? '#3B82F6' : '#F59E0B'}
                        name={
                            metric === 'revenue'
                                ? 'Revenue (VND)'
                                : metric === 'activeUsers'
                                    ? 'Active Users'
                                    : 'New Subscribers'
                        }
                    />
                </BarChart>
            </ResponsiveContainer>

            {/* Comparison Cards */}
            <div className="mt-6 grid grid-cols-3 gap-4">
                {packages.map((pkg, index) => {
                    let value = '';
                    let color = '';

                    if (metric === 'revenue') {
                        value = pkg.totalRevenue.toLocaleString();
                        color = 'bg-green-50 border-green-200 text-green-600';
                    } else if (metric === 'activeUsers') {
                        value = String(pkg.activeUsers);
                        color = 'bg-blue-50 border-blue-200 text-blue-600';
                    } else {
                        value = String(pkg.newSubscribers);
                        color = 'bg-amber-50 border-amber-200 text-amber-600';
                    }

                    return (
                        <div key={pkg.packageLevel} className={`p-4 rounded-lg border-2 ${color}`}>
                            <p className="text-sm text-gray-600 mb-2 font-medium">📦 {pkg.packageName}</p>
                            <p className="text-2xl font-bold">
                                {value}
                                {metric === 'revenue' && ' VND'}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                {metric === 'revenue'
                                    ? `${pkg.percentageOfTotal}% of total`
                                    : metric === 'activeUsers'
                                        ? `${pkg.activeUsers} subscribers`
                                        : `7-day new subscribers`}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Insights */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">💡 Quick Insights</p>
                {metric === 'revenue' && (
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>
                            • Top performer:{' '}
                            <strong>
                                {packages.reduce((max, pkg) => (pkg.totalRevenue > max.totalRevenue ? pkg : max))
                                    .packageName}
                            </strong>
                        </li>
                        <li>
                            • Total platform revenue:{' '}
                            <strong>
                                {packages
                                    .reduce((sum, pkg) => sum + pkg.totalRevenue, 0)
                                    .toLocaleString()}
                            </strong>{' '}
                            VND
                        </li>
                    </ul>
                )}
                {metric === 'activeUsers' && (
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>
                            • Most popular:{' '}
                            <strong>
                                {packages.reduce((max, pkg) => (pkg.activeUsers > max.activeUsers ? pkg : max))
                                    .packageName}
                            </strong>
                        </li>
                        <li>
                            • Total active subscribers:{' '}
                            <strong>{packages.reduce((sum, pkg) => sum + pkg.activeUsers, 0)}</strong>
                        </li>
                    </ul>
                )}
                {metric === 'newSubscribers' && (
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>
                            • Fastest growing:{' '}
                            <strong>
                                {packages.reduce((max, pkg) => (pkg.newSubscribers > max.newSubscribers ? pkg : max))
                                    .packageName}
                            </strong>
                        </li>
                        <li>
                            • Total new subscribers (7d):{' '}
                            <strong>{packages.reduce((sum, pkg) => sum + pkg.newSubscribers, 0)}</strong>
                        </li>
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PackageComparisonChart;
