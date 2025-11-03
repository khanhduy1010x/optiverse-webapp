import React, { useState, useEffect } from 'react';
import StatsCard from '../../components/admin/StatsCard.component';
import PackageDistributionChart from '../../components/admin/PackageDistributionChart.component';
import TrendComparisonChart from '../../components/admin/TrendComparisonChart.component';
import SubscriptionStatus from '../../components/admin/SubscriptionStatus.component';
import SubscriptionHistory from '../../components/admin/SubscriptionHistory.component';
import { mockDashboardStats, DashboardStats } from '../../types/membership-stats.type';
import { formatVND } from '../../utils/currency.utils';

const MembershipStatsDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('12m');
    const [fromDate, setFromDate] = useState<string>(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    );
    const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setDashboardData(mockDashboardStats);
            setLoading(false);
        }, 500);
    }, [period]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">No data available</div>
            </div>
        );
    }

    // Calculate summary stats
    const totalRevenue = dashboardData.packages.reduce((sum, pkg) => sum + pkg.totalRevenue, 0);
    const totalActiveUsers = dashboardData.packages.reduce((sum, pkg) => sum + pkg.activeUsers, 0);
    const totalNewSubscribers = dashboardData.packages.reduce(
        (sum, pkg) => sum + pkg.newSubscribers,
        0,
    );
    const totalExpiringSubscribers = dashboardData.packages.reduce(
        (sum, pkg) => sum + pkg.expiringSubscribers,
        0,
    );

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
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded font-medium transition-colors ${period === p
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {p === '7d' && '📅 Last 7 Days'}
                            {p === '30d' && '📅 Last 30 Days'}
                            {p === '90d' && '📅 Last 90 Days'}
                            {p === '12m' && '📅 Last 12 Months'}
                        </button>
                    ))}
                </div>

                {/* Summary Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        icon="💰"
                        label="Total Revenue"
                        value={formatVND(totalRevenue, false)}
                        suffix="VND"
                        color="green"
                        description={`From ${dashboardData.packages.length} packages`}
                    />
                    <StatsCard
                        icon="👥"
                        label="Active Users"
                        value={String(totalActiveUsers)}
                        suffix="users"
                        color="blue"
                        description={`Currently subscribed`}
                    />
                    <StatsCard
                        icon="📈"
                        label="New Subscribers"
                        value={String(totalNewSubscribers)}
                        suffix={period === '7d' ? '(7d)' : `(${period})`}
                        color="amber"
                        description={`Recent signups`}
                    />
                    <StatsCard
                        icon="⏰"
                        label="Expiring Soon"
                        value={String(totalExpiringSubscribers)}
                        suffix={period === '7d' ? '(7d)' : `(${period})`}
                        color="red"
                        description={`Need renewal`}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Pie Chart - Takes 1 column */}
                    <div className="lg:col-span-1">
                        <PackageDistributionChart packages={dashboardData.packages} />
                    </div>

                    {/* Trend Comparison Chart - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <TrendComparisonChart
                            monthlyData={dashboardData.monthlyRevenue}
                            packages={dashboardData.packages}
                        />
                    </div>
                </div>

                {/* Subscription Status Breakdown */}
                <SubscriptionStatus packages={dashboardData.packages} />

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
                                        Total Revenue
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                        % of Total
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                                        New (7d)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {dashboardData.packages.map((pkg) => (
                                    <tr key={pkg.packageLevel} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-gray-900">{pkg.packageName}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-gray-600">Level {pkg.packageLevel}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="font-semibold text-gray-900">{pkg.activeUsers}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="font-semibold text-green-600">
                                                {formatVND(pkg.totalRevenue, false)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="font-semibold text-gray-900">{pkg.percentageOfTotal}%</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-amber-600 font-medium">
                                                +{pkg.newSubscribers}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MembershipStatsDashboard;
