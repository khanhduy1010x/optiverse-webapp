import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/common/Icon/Icon.component';
import Button from '../../components/common/Button.component';
import { formatVND } from '../../utils/currency.utils';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import membershipPackageService, { MembershipPackage } from '../../services/membership-package.service';

const PaymentSuccessScreen: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useAppTranslate('membership');
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const packageId = searchParams.get('packageId');
    const resultCode = searchParams.get('resultCode');
    const message = searchParams.get('message');
    const amount = searchParams.get('amount');

    const isSuccess = resultCode === '0';
    const isCancelled = resultCode === '1006';

    const [packageInfo, setPackageInfo] = useState<MembershipPackage | null>(null);
    const [loading, setLoading] = useState(true);

    if (!orderId) {
        navigate('/membership');
        return null;
    }

    // Fetch package info only for success status
    useEffect(() => {
        if (packageId && isSuccess) {
            fetchPackageInfo();
        } else {
            setLoading(false);
        }
    }, [packageId, isSuccess]);

    const fetchPackageInfo = async () => {
        try {
            setLoading(true);
            const data = await membershipPackageService.getMembershipPackageById(packageId!);
            setPackageInfo(data);
        } catch (err) {
            console.error('Failed to fetch package info:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!orderId) {
        navigate('/membership');
        return null;
    }

    const getLevelIcon = (level: number) => {
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

    const getLevelColor = (level: number) => {
        switch (level) {
            case 0:
                return 'text-amber-400';
            case 1:
                return 'text-emerald-400';
            case 2:
                return 'text-sky-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <div className="h-[calc(100vh-57px)] bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 pb-12 px-4 md:px-6 flex items-center justify-center">
            <div className="w-full max-w-2xl">
                {/* ====== SUCCESS STATE ====== */}
                {isSuccess ? (
                    <>
                        {/* Success Animation & Header */}
                        <div className="text-center mb-8">
                            {/* Success Checkmark Animation */}
                            <div className="flex justify-center mb-6">
                                <div className="relative w-24 h-24">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                                            <Icon name="check" size={48} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Success Message */}
                            <h1 className="text-4xl font-bold text-white mb-3">
                                Payment Successful!
                            </h1>
                            <p className="text-lg text-gray-400 mb-2">
                                Your membership has been activated
                            </p>
                            <p className="text-sm text-gray-500">
                                Order ID: <span className="text-gray-300 font-semibold">{orderId}</span>
                            </p>
                        </div>

                        {/* Package Details Card */}
                        {packageInfo && (
                            <div className="mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/30 backdrop-blur border border-emerald-500/30 rounded-2xl p-6 shadow-lg shadow-emerald-500/10">
                                {/* Package Header */}
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-700/50">
                                    <div className="w-16 h-16">
                                        <div className={`w-full h-full bg-white/10 rounded-xl flex items-center justify-center ${getLevelColor(packageInfo.level)}`}>
                                            <Icon
                                                name={getLevelIcon(packageInfo.level)}
                                                size={32}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-white">
                                            {packageInfo.name}
                                        </h2>
                                        <p className="text-gray-400 mt-1">
                                            {packageInfo.description || 'Premium membership plan'}
                                        </p>
                                    </div>
                                </div>

                                {/* Package Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {/* Duration */}
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon name="calendar" size={16} className="text-emerald-400" />
                                            <p className="text-xs text-gray-400">Access Duration</p>
                                        </div>
                                        <p className="text-xl font-bold text-white">
                                            {packageInfo.duration_days}
                                        </p>
                                        <p className="text-xs text-gray-500">days</p>
                                    </div>

                                    {/* OP Bonus */}
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon name="star" size={16} className="text-amber-400" />
                                            <p className="text-xs text-gray-400">OP Bonus</p>
                                        </div>
                                        <p className="text-xl font-bold text-white">
                                            {formatVND(packageInfo.opBonusCredits || 0, false)}
                                        </p>
                                        <p className="text-xs text-gray-500">credits</p>
                                    </div>

                                    {/* Price Paid */}
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon name="dollar" size={16} className="text-sky-400" />
                                            <p className="text-xs text-gray-400">Amount Paid</p>
                                        </div>
                                        <p className="text-xl font-bold text-white">
                                            {amount ? formatVND(parseInt(amount), false) : formatVND(packageInfo.price, false)}
                                        </p>
                                        <p className="text-xs text-gray-500">VND</p>
                                    </div>

                                    {/* Status */}
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon name="check" size={16} className="text-emerald-400" />
                                            <p className="text-xs text-gray-400">Status</p>
                                        </div>
                                        <p className="text-xl font-bold text-emerald-400">Active</p>
                                        <p className="text-xs text-gray-500">now</p>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="bg-white/5 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-white mb-3">Your Benefits:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2">
                                            <Icon name="check" size={16} className="text-emerald-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-300">Premium Features</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon name="check" size={16} className="text-emerald-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-300">Priority Support</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon name="check" size={16} className="text-emerald-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-300">Unlimited Updates</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Icon name="check" size={16} className="text-emerald-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-300">{formatVND(packageInfo.opBonusCredits || 0, false)} OP Bonus</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info Message */}
                        <div className="mb-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Icon name="message" size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-blue-200 font-semibold mb-1">What's Next?</p>
                                    <p className="text-xs text-blue-300">
                                        Your membership is now active! You can access all premium features immediately. Check your email for the receipt and membership details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={() => navigate('/membership')}
                                className="flex-1 bg-gray-700 text-white px-4 py-3 text-sm rounded-lg hover:bg-gray-600 transition-colors font-medium"
                            >
                                View Membership Plans
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 text-sm rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium shadow-lg shadow-emerald-500/50"
                            >
                                Back to Dashboard
                            </Button>
                        </div>

                        {/* Footer Message */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500">
                                Thank you for upgrading! Enjoy your premium membership experience.
                            </p>
                        </div>
                    </>
                ) : isCancelled ? (
                    <>
                        {/* ====== CANCELLED STATE ====== */}
                        <div className="text-center mb-8">
                            {/* Cancelled Icon Animation */}
                            <div className="flex justify-center mb-6">
                                <div className="relative w-24 h-24">
                                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                                            <Icon name="close" size={48} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cancelled Message */}
                            <h1 className="text-4xl font-bold text-white mb-3">
                                Payment Cancelled
                            </h1>
                            <p className="text-lg text-gray-400 mb-2">
                                Your payment has been cancelled
                            </p>
                            <p className="text-sm text-gray-500">
                                Order ID: <span className="text-gray-300 font-semibold">{orderId}</span>
                            </p>
                        </div>

                        {/* Error Details Card */}
                        <div className="mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/30 backdrop-blur border border-red-500/30 rounded-2xl p-6 shadow-lg shadow-red-500/10">
                            <div className="space-y-4">
                                {/* Cancellation Reason */}
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-red-200 mb-2">Cancellation Reason</h3>
                                    <p className="text-sm text-red-100">
                                        {message ? decodeURIComponent(message) : 'The transaction was cancelled by the user.'}
                                    </p>
                                </div>

                                {/* Transaction Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Amount */}
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-xs text-gray-400 mb-1">Amount</p>
                                        <p className="text-lg font-bold text-white">
                                            {amount ? formatVND(parseInt(amount), false) : '—'}
                                        </p>
                                    </div>

                                    {/* Error Code */}
                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-xs text-gray-400 mb-1">Error Code</p>
                                        <p className="text-lg font-bold text-red-400">{resultCode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warning Message */}
                        <div className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Icon name="alert" size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-yellow-200 font-semibold mb-1">What Happened?</p>
                                    <p className="text-xs text-yellow-300">
                                        Your payment was not processed. You have not been charged, and no membership has been activated. You can try again at any time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={() => navigate('/membership')}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 text-sm rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-lg shadow-amber-500/50"
                            >
                                Try Again
                            </Button>
                            <Button
                                onClick={() => navigate('/membership')}
                                className="flex-1 bg-gray-700 text-white px-4 py-3 text-sm rounded-lg hover:bg-gray-600 transition-colors font-medium"
                            >
                                Back to Membership
                            </Button>
                        </div>

                        {/* Footer Message */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500">
                                If you need help, please contact our support team.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        {/* ====== UNKNOWN STATE ====== */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-6">
                                <div className="relative w-24 h-24">
                                    <div className="absolute inset-0 bg-gray-500/20 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="inline-flex animate-spin rounded-full h-16 w-16 border-4 border-sky-500 border-t-white"></div>
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-4xl font-bold text-white mb-3">
                                Processing...
                            </h1>
                            <p className="text-lg text-gray-400 mb-2">
                                Please wait while we process your payment
                            </p>
                            <p className="text-sm text-gray-500">
                                Order ID: <span className="text-gray-300 font-semibold">{orderId}</span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccessScreen;
