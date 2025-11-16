import React, { useState } from 'react';
import StatsCard from '../../components/admin/StatsCard.component';
import PackageDistributionChart from '../../components/admin/PackageDistributionChart.component';
import TrendComparisonChart from '../../components/admin/TrendComparisonChart.component';
import SubscriptionStatus from '../../components/admin/SubscriptionStatus.component';
import SubscriptionHistory from '../../components/admin/SubscriptionHistory.component';
import { formatVND } from '../../utils/currency.utils';
import { useMembershipStats } from '../../hooks/admin/useMembershipStats.hook';

const MembershipStatsDashboard: React.FC = () => {
    const [fromDate, setFromDate] = useState<string>(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    );
    const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const { stats, loading, error, period, changePeriod } = useMembershipStats('12m');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="text-gray-500">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 mb-2">Failed to load dashboard</div>
                    <div className="text-gray-500 text-sm">{error}</div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">No data available</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Membership Statistics Dashboard
                    </h1>
                    <p className="text-gray-600">Track membership performance and subscriber trends</p>
                </div>

                {/* Period Selector */}
                <div className="mb-6 flex gap-2 bg-white rounded-lg shadow p-4 w-fit">
                    {(['7d', '30d', '90d', '12m'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => changePeriod(p)}
                            className={`px-4 py-2 rounded font-medium transition-colors flex items-center gap-2 ${period === p
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {p === '7d' && 'Last 7 Days'}
                            {p === '30d' && 'Last 30 Days'}
                            {p === '90d' && 'Last 90 Days'}
                            {p === '12m' && 'Last 12 Months'}
                        </button>
                    ))}
                </div>

                {/* Summary Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        icon="dollar"
                        label="Total Revenue"
                        value={formatVND(stats.totalRevenue, false)}
                        suffix="VND"
                        color="green"
                        description={`From ${stats.packages.length} packages`}
                    />
                    <StatsCard
                        icon="users"
                        label="Active Users"
                        value={String(stats.totalActiveUsers)}
                        suffix="users"
                        color="blue"
                        description={`Currently subscribed`}
                    />
                    <StatsCard
                        icon="trending-up"
                        label="New Subscribers"
                        value={String(stats.newSubscribers7Days)}
                        suffix="(7d)"
                        color="amber"
                        description={`Recent signups`}
                    />
                    <StatsCard
                        icon="clock"
                        label="Expiring Soon"
                        value={String(stats.expiringSubscribers7Days)}
                        suffix="(7d)"
                        color="red"
                        description={`Need renewal`}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Pie Chart - Takes 1 column */}
                    <div className="lg:col-span-1">
                        <PackageDistributionChart packages={stats.packages} />
                    </div>

                    {/* Trend Comparison Chart - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <TrendComparisonChart
                            monthlyData={stats.monthlyRevenue}
                            packages={stats.packages}
                        />
                    </div>
                </div>

                {/* Subscription Status Breakdown */}
                <SubscriptionStatus packages={stats.packages} />

                {/* Subscription History */}
                <div className="mt-8">
                    <SubscriptionHistory
                        fromDate={fromDate}
                        toDate={toDate}
                        onDateRangeChange={(from, to) => {
                            setFromDate(from);
                            setToDate(to);
                        }}
                    />
                </div>

                {/* Quick Stats Table */}
                <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Package Comparison</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Package
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                        Level
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                        Active Users
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                        Revenue
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                        % of Total
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                        Avg Duration
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {stats.packages.map((pkg) => {
                                    const percentageOfTotal = stats.totalRevenue > 0 
                                        ? ((pkg.revenue / stats.totalRevenue) * 100).toFixed(1) 
                                        : '0.0';
                                    
                                    return (
                                        <tr key={pkg.level} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-gray-900">{pkg.packageName}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm text-gray-600">Level {pkg.level}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="font-semibold text-gray-900">{pkg.activeUsers}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="font-semibold text-green-600">
                                                    {formatVND(pkg.revenue, false)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="font-semibold text-gray-900">{percentageOfTotal}%</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm text-gray-600">
                                                    {pkg.averageDuration} days
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembershipStatsDashboard;
