import React, { useEffect, useState } from 'react';
import { formatVND } from '../../utils/currency.utils';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import paymentService from '../../services/payment.service';
import Icon from '../../components/common/Icon/Icon.component';
import ProfileSidebar from './ProfileSidebar.component';
import { useNavigate } from 'react-router-dom';

interface Payment {
    packageId: string;
    amount: number;
    status: string;
    name?: string;
    level?: number;
    price?: number;
    duration_days?: number;
    opBonusCredits?: number;
    description?: string;
    is_active?: boolean;
    createdAt?: string;
}

export default function PaymentHistoryPage() {
    const { t } = useAppTranslate('profile');
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewType, setViewType] = useState<'card' | 'table'>('card');
    const navigate = useNavigate();
    const selectedMenu = 'payment_history';
    const handleNavigate = (menu: string, path: string) => {
        navigate(path);
    };

    useEffect(() => {
        fetchPaymentHistory();
    }, []);

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await paymentService.getPaymentHistory();
            setPayments(data || []);
        } catch (err) {
            console.error('Failed to fetch payment history:', err);
            setError('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const getLevelIcon = (level?: number) => {
        switch (level) {
            case 0:
                return 'level_0' as const;
            case 1:
                return 'level_1' as const;
            case 2:
                return 'level_2' as const;
            default:
                return 'star' as const;
        }
    };

    const getLevelColor = (level?: number) => {
        switch (level) {
            case 0:
                return 'text-amber-400';
            case 1:
                return 'text-emerald-400';
            case 2:
                return 'text-blue-400';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
            case 'success':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Completed
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        Pending
                    </span>
                );
            case 'failed':
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Failed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="w-full dark:border-gray-700 rounded-lg h-full overflow-hidden">
            <div className='flex flex-1 overflow-hidden h-full'>
                <ProfileSidebar
                    selectedMenu={selectedMenu}
                    handleNavigate={handleNavigate}
                />

                <div className="h-full w-full bg-gray-50/50 overflow-auto">
                    <div className="w-full p-6 space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900">
                                Payment History
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                View all your membership purchases and transactions
                            </p>
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewType('card')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${viewType === 'card'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"></path>
                                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zm8-1a1 1 0 00-1 1v6a1 1 0 001 1h4a1 1 0 001-1v-6a1 1 0 00-1-1h-4z" clipRule="evenodd"></path>
                                    </svg>
                                    Card
                                </div>
                            </button>
                            <button
                                onClick={() => setViewType('table')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${viewType === 'table'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"></path>
                                    </svg>
                                    Table
                                </div>
                            </button>
                        </div>

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    <svg
                                        className="h-5 w-5 text-red-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-red-800 text-sm font-medium">{error}</p>
                                </div>
                            </div>
                        )}
                        {/* Summary Card */}
                        {!loading && payments.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-gray-900 font-semibold mb-4">Summary</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                            Total Transactions
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {payments.length}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                            Total Spent
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {formatVND(
                                                payments.reduce((sum, p) => sum + (p.amount || 0), 0),
                                                false
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                            Completed
                                        </p>
                                        <p className="text-2xl font-semibold text-green-600">
                                            {payments.filter(p => p.status.toLowerCase() === 'paid' || p.status.toLowerCase() === 'success').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Loading State */}
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="space-y-4 text-center">
                                    <div className="w-12 h-12 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin mx-auto"></div>
                                    <p className="text-gray-500 text-sm">Loading payment history...</p>
                                </div>
                            </div>
                        ) : payments.length === 0 ? (
                            /* Empty State */
                            <div className="bg-white rounded-lg border border-gray-200 py-16 px-6 text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-8 h-8 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-gray-900 font-semibold mb-1">
                                    No payments yet
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Your payment history will appear here
                                </p>
                            </div>
                        ) : (

                            /* Payment List - Card View */
                            viewType === 'card' ? (
                                <div className="space-y-3">
                                    {payments.map((payment, index) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                {/* Left - Package Info */}
                                                <div className="flex items-start gap-4 flex-1">
                                                    {/* Package Icon */}
                                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 border border-gray-100"
                                                        style={{
                                                            backgroundImage: payment.level === 0 ? 'linear-gradient(to bottom right, rgb(251, 191, 36), rgb(251, 146, 60))' :
                                                                payment.level === 1 ? 'linear-gradient(to bottom right, rgb(52, 211, 153), rgb(16, 185, 129))' :
                                                                    'linear-gradient(to bottom right, rgb(96, 165, 250), rgb(59, 130, 246))'
                                                        }}
                                                    >
                                                        <Icon
                                                            name={getLevelIcon(payment.level)}
                                                            size={28}
                                                            className="text-white"
                                                        />
                                                    </div>

                                                    {/* Package Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-gray-900 font-semibold text-sm">
                                                                {payment.name || 'Membership Package'}
                                                            </h3>
                                                            {payment.level !== undefined && (
                                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLevelColor(payment.level)}`}>
                                                                    Level {payment.level}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {payment.description && (
                                                            <p className="text-xs text-gray-600 mb-2">
                                                                {payment.description}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-2">
                                                            {payment.duration_days && (
                                                                <div className="flex items-center gap-1">
                                                                    <Icon name="calendar" size={14} className="text-gray-400" />
                                                                    <span>{payment.duration_days} days access</span>
                                                                </div>
                                                            )}
                                                            {payment.opBonusCredits && payment.opBonusCredits > 0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <Icon name="star" size={14} className="text-amber-400" />
                                                                    <span>{formatVND(payment.opBonusCredits, false)} OP Bonus</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <p className="text-xs text-gray-400">
                                                            Order ID: {payment.packageId}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right - Amount & Status */}
                                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                    <p className="text-gray-900 font-bold text-lg">
                                                        {payment.amount === 0
                                                            ? 'FREE'
                                                            : formatVND(payment.amount, false)}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Icon name="check" size={16} className={payment.status.toLowerCase() === 'paid' || payment.status.toLowerCase() === 'success' ? 'text-green-500' : 'text-gray-400'} />
                                                        {getStatusBadge(payment.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Payment List - Table View */
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Package</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">OP Bonus</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((payment, index) => (
                                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0"
                                                                style={{
                                                                    backgroundImage: payment.level === 0 ? 'linear-gradient(to bottom right, rgb(251, 191, 36), rgb(251, 146, 60))' :
                                                                        payment.level === 1 ? 'linear-gradient(to bottom right, rgb(52, 211, 153), rgb(16, 185, 129))' :
                                                                            'linear-gradient(to bottom right, rgb(96, 165, 250), rgb(59, 130, 246))'
                                                                }}
                                                            >
                                                                <Icon
                                                                    name={getLevelIcon(payment.level)}
                                                                    size={20}
                                                                    className="text-white"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 text-sm">{payment.name}</p>
                                                                <p className="text-xs text-gray-500">{payment.description}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {payment.duration_days} days
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {payment.opBonusCredits && payment.opBonusCredits > 0
                                                            ? formatVND(payment.opBonusCredits, false)
                                                            : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <p className="font-semibold text-gray-900">
                                                            {payment.amount === 0
                                                                ? 'FREE'
                                                                : formatVND(payment.amount, false)}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {getStatusBadge(payment.status)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}


                    </div>
                </div>
            </div>
        </div>
    );
}
