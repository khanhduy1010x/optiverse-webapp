import React from 'react';
import { MembershipStats } from '../../types/membership-stats.type';

interface SubscriptionStatusProps {
    packages: MembershipStats[];
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ packages }) => {
    const getPackageBgColor = (packageName: string): string => {
        const colorMap: Record<string, string> = {
            Basic: 'bg-amber-50 border-amber-200',
            Plus: 'bg-green-50 border-green-200',
            Business: 'bg-blue-50 border-blue-200',
        };
        return colorMap[packageName] || 'bg-gray-50 border-gray-200';
    };

    const getStatusColor = (status: string): string => {
        const colorMap: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            expired: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    const getPackageColor = (packageName: string): string => {
        const colorMap: Record<string, string> = {
            Basic: 'text-amber-600',
            Plus: 'text-green-600',
            Business: 'text-blue-600',
        };
        return colorMap[packageName] || 'text-gray-600';
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Subscription Status Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg) => {
                    const total =
                        pkg.activeUsers + pkg.expiredUsers + pkg.cancelledUsers;
                    const activePercent = ((pkg.activeUsers / total) * 100).toFixed(1);
                    const expiredPercent = ((pkg.expiredUsers / total) * 100).toFixed(1);
                    const cancelledPercent = ((pkg.cancelledUsers / total) * 100).toFixed(1);

                    return (
                        <div
                            key={pkg.level}
                            className={`border-2 rounded-lg p-4 ${getPackageBgColor(pkg.packageName)}`}
                        >
                            <h4 className={`font-semibold mb-4 flex items-center gap-2 ${getPackageColor(pkg.packageName)}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                {pkg.packageName}
                            </h4>

                            {/* Active Users */}
                            <div className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">Active</span>
                                    <span className={`text-sm font-semibold ${getStatusColor('active')}`}>
                                        {pkg.activeUsers} ({activePercent}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${activePercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Expired Users */}
                            <div className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">Expired</span>
                                    <span className={`text-sm font-semibold ${getStatusColor('expired')}`}>
                                        {pkg.expiredUsers} ({expiredPercent}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{ width: `${expiredPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Cancelled Users */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">Cancelled</span>
                                    <span className={`text-sm font-semibold ${getStatusColor('cancelled')}`}>
                                        {pkg.cancelledUsers} ({cancelledPercent}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gray-500 h-2 rounded-full"
                                        style={{ width: `${cancelledPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Total Count */}
                            <div className="mt-4 pt-4 border-t border-gray-300">
                                <p className="text-sm font-semibold text-gray-900">
                                    Total Subscriptions: <span className="text-lg">{total}</span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-3">Legend:</p>
                <div className="flex gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded" />
                        <span className="text-sm text-gray-600">Active - Currently subscribed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded" />
                        <span className="text-sm text-gray-600">Expired - Subscription ended</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-500 rounded" />
                        <span className="text-sm text-gray-600">Cancelled - User cancelled</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionStatus;
