import React, { useState, useEffect } from 'react';
import membershipStatsService from '../../services/membership-stats.service';
import { formatVND } from '../../utils/currency.utils';

export interface SubscriptionRecord {
    userId: string;
    userName: string;
    packageName: string;
    packageLevel: number;
    startDate: Date;
    endDate: Date;
    status: string;
    revenue: number;
}

interface SubscriptionHistoryProps {
    fromDate: string;
    toDate: string;
    onDateRangeChange?: (from: string, to: string) => void;
}

const SubscriptionHistory: React.FC<SubscriptionHistoryProps> = ({
    fromDate,
    toDate,
    onDateRangeChange,
}) => {
    const [localFromDate, setLocalFromDate] = useState(fromDate);
    const [localToDate, setLocalToDate] = useState(toDate);
    const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchHistory = async (from: string, to: string) => {
        try {
            setLoading(true);
            const data = await membershipStatsService.getSubscriptionHistory(
                new Date(from),
                new Date(to)
            );
            setSubscriptions(data);
        } catch (error) {
            console.error('Error fetching subscription history:', error);
            setSubscriptions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(fromDate, toDate);
    }, [fromDate, toDate]);

    const handleApplyDateRange = () => {
        if (new Date(localFromDate) > new Date(localToDate)) {
            alert('From date must be before To date');
            return;
        }
        fetchHistory(localFromDate, localToDate);
        onDateRangeChange?.(localFromDate, localToDate);
        setCurrentPage(1);
    };

    const getPackageColor = (packageName: string): string => {
        const colorMap: Record<string, string> = {
            'BASIC': 'bg-amber-50 text-amber-900',
            'PLUS': 'bg-green-50 text-green-900',
            'BUSINESS': 'bg-blue-50 text-blue-900',
            'Basic': 'bg-amber-50 text-amber-900',
            'Plus': 'bg-green-50 text-green-900',
            'Business': 'bg-blue-50 text-blue-900',
            'Basic Weekly': 'bg-amber-50 text-amber-900',
            'Basic Monthly': 'bg-amber-100 text-amber-900',
            'Basic Yearly': 'bg-amber-200 text-amber-900',
            'Plus Weekly': 'bg-green-50 text-green-900',
            'Plus Monthly': 'bg-green-100 text-green-900',
            'Plus Yearly': 'bg-green-200 text-green-900',
            'Business Weekly': 'bg-blue-50 text-blue-900',
            'Business Monthly': 'bg-blue-100 text-blue-900',
            'Business Yearly': 'bg-blue-200 text-blue-900',
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

    const getStatusIcon = (status: string) => {
        if (status === 'active') {
            return (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
            );
        }
        if (status === 'expired') {
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        }
        if (status === 'cancelled') {
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            );
        }
        return (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    };

    const totalPages = Math.ceil(subscriptions.length / itemsPerPage);
    const paginatedSubscriptions = subscriptions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Subscription History & User Registrations
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Apply Filter
                    </button>

                    <div className="text-sm text-gray-600 font-medium">
                        {loading ? 'Loading...' : `${subscriptions.length} subscriptions found`}
                    </div>
                </div>
            </div>

            {/* Subscriptions Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Loading subscription history...</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    User Information
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Package
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                                    Amount
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Start Date
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
                                paginatedSubscriptions.map((sub, idx) => (
                                    <tr key={`${sub.userId}-${idx}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{sub.userName}</div>
                                            <div className="text-xs text-gray-500">{sub.userId}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${getPackageColor(
                                                    sub.packageName,
                                                )}`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                {sub.packageName}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-gray-900">
                                            {formatVND(sub.revenue, false)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(sub.startDate).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(sub.endDate).toLocaleDateString('vi-VN')}
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
                                    <td colSpan={6} className="px-4 py-8 text-center">
                                        <p className="text-gray-600">No subscriptions found in this date range</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
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
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            Next
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
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
