import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/common/Icon/Icon.component';
import Button from '../../components/common/Button.component';
import { formatVND } from '../../utils/currency.utils';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import membershipPackageService, { MembershipPackage } from '../../services/membership-package.service';
import paymentService from '../../services/payment.service';

const PaymentMethodScreen: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useAppTranslate('membership');
    const [searchParams] = useSearchParams();
    const packageId = searchParams.get('packageId');

    const [selectedMethod, setSelectedMethod] = useState<'momo' | 'payos' | 'vpay' | null>(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [packageInfo, setPackageInfo] = useState<MembershipPackage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (packageId) {
            fetchPackageInfo();
        }
    }, [packageId]);

    const fetchPackageInfo = async () => {
        try {
            setLoading(true);
            const data = await membershipPackageService.getMembershipPackageById(packageId!);
            setPackageInfo(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch package info:', err);
            setError('Failed to load package information');
        } finally {
            setLoading(false);
        }
    };

    const handleMomoPayment = async () => {
        if (!selectedMethod || selectedMethod !== 'momo') return;
        // Navigate to MoMo checkout screen
        navigate(`/membership/momo-checkout?packageId=${packageId}`);
    };

    const handlePayOSPayment = async () => {
        if (!selectedMethod || selectedMethod !== 'payos') return;
        // Navigate to PayOS checkout screen
        navigate(`/membership/payos-checkout?packageId=${packageId}`);
    };

    if (!packageId) {
        navigate('/membership');
        return null;
    }

    if (loading) {
        return (
            <div className="h-[calc(100vh-57px)] bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 pb-12 px-4 md:px-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <p className="text-gray-400">{t('loading_payment_details')}</p>
                </div>
            </div>
        );
    }

    if (!packageInfo) {
        return (
            <div className="h-[calc(100vh-57px)] bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 pb-12 px-4 md:px-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || t('package_not_found')}</p>
                    <Button
                        onClick={() => navigate('/membership')}
                        className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200"
                    >
                        {t('back_to_membership')}
                    </Button>
                </div>
            </div>
        );
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
        <div className="h-[calc(100vh-57px)] bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 pb-12 px-4 md:px-6">
            {/* Loading Overlay */}
            {processing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="inline-flex animate-spin rounded-full h-16 w-16 border-4 border-sky-500 border-t-white mb-6"></div>
                        <p className="text-white text-lg font-semibold mb-2">Processing Payment</p>
                        <p className="text-gray-400 text-sm">Please wait while we process your MoMo payment...</p>
                    </div>
                </div>
            )}

            <div className=" mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-xl md:text-3xl font-bold text-white mb-2">
                        {t('payment_method')}
                    </h1>
                    <p className="text-xs text-gray-400">
                        {t('payment_method_subtitle')}
                    </p>
                </div>

                {/* Top Row - Package & Order Summary Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 mb-8">
                    {/* Left - Package Summary */}
                    <div className="lg:col-span-5 bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Icon
                                    name={packageInfo.level === 0 ? 'level_0' : packageInfo.level === 1 ? 'level_1' : 'level_2'}
                                    size={36}
                                    className={packageInfo.level === 0 ? 'text-amber-400' : packageInfo.level === 1 ? 'text-emerald-400' : 'text-sky-400'}
                                />
                                <div>
                                    <h2 className="text-lg font-bold text-white">{packageInfo.name}</h2>
                                    <p className="text-gray-400 text-xs mt-0.5">{packageInfo.description || t('package_description')}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">
                                    {packageInfo.price === 0 ? t('free') : formatVND(packageInfo.price, false)}
                                </div>
                                <p className="text-gray-400 text-xs mt-1">
                                    {packageInfo.duration_days} {t('days_access')}
                                </p>
                            </div>
                        </div>

                        {/* Benefits Preview */}
                        <div className="mt-4 pt-4 border-t border-gray-700/50 grid grid-cols-2 gap-3 lg:col-span-3">
                            <div className="flex items-center gap-1.5">
                                <Icon name="check" size={14} className={packageInfo.level === 0 ? 'text-amber-400' : packageInfo.level === 1 ? 'text-emerald-400' : 'text-sky-400'} />
                                <span className="text-gray-300 text-xs">
                                    {formatVND(packageInfo.opBonusCredits || 0, false)} {t('op_bonus')}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Icon name="check" size={14} className={packageInfo.level === 0 ? 'text-amber-400' : packageInfo.level === 1 ? 'text-emerald-400' : 'text-sky-400'} />
                                <span className="text-gray-300 text-xs">{t('premium_features')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Icon name="check" size={14} className={packageInfo.level === 0 ? 'text-amber-400' : packageInfo.level === 1 ? 'text-emerald-400' : 'text-sky-400'} />
                                <span className="text-gray-300 text-xs">{t('priority_support')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Icon name="check" size={14} className={packageInfo.level === 0 ? 'text-amber-400' : packageInfo.level === 1 ? 'text-emerald-400' : 'text-sky-400'} />
                                <span className="text-gray-300 text-xs">{t('unlimited_updates')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right - Order Summary Card */}
                    <div className="lg:col-span-3 bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-white mb-3">{t('order_summary')}</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">{t('subtotal')}</span>
                                <span className="text-white font-semibold text-xs">
                                    {packageInfo.price === 0 ? t('free') : formatVND(packageInfo.price, false)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs">{t('tax')}</span>
                                <span className="text-white font-semibold text-xs">{t('free')}</span>
                            </div>
                            <div className="border-t border-gray-700 pt-2 flex justify-between items-center">
                                <span className="text-white font-semibold text-xs">{t('total')}</span>
                                <span className="text-lg font-bold text-sky-400">
                                    {packageInfo.price === 0 ? t('free') : formatVND(packageInfo.price, false)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row - Payment Methods Full Width */}
                <div className="mb-6">
                    <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-white mb-3">{t('payment_methods')}</h3>
                        <div className="space-y-2">
                            {/* MoMo Option */}
                            <div
                                onClick={() => setSelectedMethod('momo')}
                                className={`relative cursor-pointer rounded-xl transition-all duration-200 ${selectedMethod === 'momo'
                                    ? 'bg-white/10 ring-2 ring-white/30'
                                    : 'bg-white/5 hover:bg-white/8'
                                    }`}
                            >
                                <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9">
                                            <img src='/momo.png' alt='MoMo Logo' className='w-full h-full object-contain' />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">{t('momo')}</h3>
                                            <p className="text-xs text-gray-400">
                                                {t('momo_description')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === 'momo'
                                        ? 'border-sky-400 bg-sky-400'
                                        : 'border-gray-600'
                                        }`}>
                                        {selectedMethod === 'momo' && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* PayOS QR Code Option */}
                            <div
                                onClick={() => setSelectedMethod('payos')}
                                className={`relative cursor-pointer rounded-xl transition-all duration-200 ${selectedMethod === 'payos'
                                    ? 'bg-white/10 ring-2 ring-white/30'
                                    : 'bg-white/5 hover:bg-white/8'
                                    }`}
                            >
                                <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9">
                                            <img src='/qrcode.jpg' alt='PayOS QR Code' className='w-full h-full rounded-sm object-contain' />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">{t('qr_code') || 'QR Code'}</h3>
                                            <p className="text-xs text-gray-400">
                                                {t('qr_code_description') || 'Scan QR code to pay'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === 'payos'
                                        ? 'border-sky-400 bg-sky-400'
                                        : 'border-gray-600'
                                        }`}>
                                        {selectedMethod === 'payos' && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* VPay Option */}
                            <div
                                className="relative rounded-xl bg-white/5 opacity-40 cursor-not-allowed"
                            >
                                <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9">
                                            <img src='/vnpay.jpg' alt='VPay Logo' className='w-full h-full rounded-[8px] object-contain' />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <h3 className="text-sm font-semibold text-white">{t('vpay')}</h3>
                                                <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                                                    {t('coming_soon')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {t('vpay_description')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-700"></div>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mt-3">
                                <p className="text-red-300 text-xs">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        onClick={() => navigate('/membership')}
                        className="flex-1 bg-gray-700 text-white px-4 py-2 text-sm rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={() => {
                            if (selectedMethod === 'momo') {
                                handleMomoPayment();
                            } else if (selectedMethod === 'payos') {
                                handlePayOSPayment();
                            }
                        }}
                        disabled={!selectedMethod || processing || selectedMethod === 'vpay'}
                        className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors font-medium text-white ${!selectedMethod || processing || selectedMethod === 'vpay'
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-sky-500 hover:bg-sky-600'
                            }`}
                    >
                        {processing ? 'Processing...' : t('continue_payment')}
                    </Button>
                </div>


            </div>
        </div>
    );
};

export default PaymentMethodScreen;
