import React, { useState } from 'react';

export interface SubscriptionRecord {
    _id: string;
    userId: string;
    userName: string;
    userEmail: string;
    packageName: string;
    packageLevel: number;
    subscriptionDate: string;
    expiryDate?: string;
    status: 'active' | 'expired' | 'cancelled';
    amount: number;
}

interface SubscriptionHistoryProps {
    fromDate: string;
    toDate: string;
    onDateRangeChange?: (from: string, to: string) => void;
}

// Mock subscription data
const generateMockSubscriptions = (fromDate: string, toDate: string): SubscriptionRecord[] => {
    const packages = ['Basic', 'Plus', 'Business'];
    const statuses = ['active', 'expired', 'cancelled'] as const;
    const subscriptions: SubscriptionRecord[] = [];

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const daysDiff = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

    // Generate 20-50 random subscriptions in the date range
    const count = Math.floor(Math.random() * 30) + 20;

    for (let i = 0; i < count; i++) {
        const randomDays = Math.floor(Math.random() * daysDiff);
        const subscriptionDate = new Date(from.getTime() + randomDays * 24 * 60 * 60 * 1000);

        const packageIndex = Math.floor(Math.random() * 3);
        const packageName = packages[packageIndex];
        const amount =
            packageIndex === 0
                ? 99000
                : packageIndex === 1
                    ? 199000
                    : 399000;

        subscriptions.push({
            _id: `sub_${i}`,
            userId: `user_${1000 + i}`,
            userName: `User ${1000 + i}`,
            userEmail: `user${1000 + i}@example.com`,
            packageName,
            packageLevel: packageIndex,
            subscriptionDate: subscriptionDate.toISOString(),
            expiryDate: new Date(
                subscriptionDate.getTime() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            status: statuses[Math.floor(Math.random() * 3)],
            amount,
        });
    }

    return subscriptions.sort(
        (a, b) =>
            new Date(b.subscriptionDate).getTime() - new Date(a.subscriptionDate).getTime(),
    );
};

const SubscriptionHistory: React.FC<SubscriptionHistoryProps> = ({
    fromDate,
    toDate,
    onDateRangeChange,
}) => {
    const [localFromDate, setLocalFromDate] = useState(fromDate);
    const [localToDate, setLocalToDate] = useState(toDate);
    const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>(
        generateMockSubscriptions(fromDate, toDate),
    );
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleApplyDateRange = () => {
        if (new Date(localFromDate) > new Date(localToDate)) {
            alert('From date must be before To date');
            return;
        }
        setSubscriptions(generateMockSubscriptions(localFromDate, localToDate));
        onDateRangeChange?.(localFromDate, localToDate);
        setCurrentPage(1);
    };

    const getPackageColor = (packageName: string): string => {
        const colorMap: Record<string, string> = {
            Basic: 'bg-amber-50 text-amber-900',
            Plus: 'bg-green-50 text-green-900',
            Business: 'bg-blue-50 text-blue-900',
        };
        return colorMap[packageName] || 'bg-gray-50 text-gray-900';
    };

    const getStatusBadge = (status: string): string => {
        const statusMap: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            expired: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string): string => {
        const iconMap: Record<string, string> = {
            active: '✅',
            expired: '⏰',
            cancelled: '❌',
        };
        return iconMap[status] || '❓';
    };

    const totalPages = Math.ceil(subscriptions.length / itemsPerPage);
    const paginatedSubscriptions = subscriptions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📅 Subscription History & User Registrations
                </h3>

                {/* Date Range Picker */}
                <div className="flex gap-4 items-end flex-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={localFromDate}
                            onChange={(e) => setLocalFromDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={localToDate}
                            onChange={(e) => setLocalToDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={handleApplyDateRange}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        🔍 Apply Filter
                    </button>

                    <div className="text-sm text-gray-600 font-medium">
                        {subscriptions.length} subscriptions found
                    </div>
                </div>
            </div>

            {/* Subscriptions Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                User Information
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                Package
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                                Amount
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                Subscription Date
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                Expiry Date
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {paginatedSubscriptions.length > 0 ? (
                            paginatedSubscriptions.map((sub) => (
                                <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{sub.userName}</div>
                                        <div className="text-xs text-gray-500">{sub.userId}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                        {sub.userEmail}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getPackageColor(
                                                sub.packageName,
                                            )}`}
                                        >
                                            📦 {sub.packageName}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                                        {sub.amount.toLocaleString()} VND
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(sub.subscriptionDate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                        {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString('vi-VN') : '-'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusBadge(
                                                sub.status,
                                            )}`}
                                        >
                                            {getStatusIcon(sub.status)}
                                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center">
                                    <p className="text-gray-600">No subscriptions found in this date range</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Total Subscriptions</p>
                    <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                        {subscriptions.filter((s) => s.status === 'active').length}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Expired</p>
                    <p className="text-2xl font-bold text-red-600">
                        {subscriptions.filter((s) => s.status === 'expired').length}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-600">
                        {subscriptions.filter((s) => s.status === 'cancelled').length}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionHistory;
