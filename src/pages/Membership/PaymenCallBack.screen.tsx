
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../components/common/Icon/Icon.component';
import Button from '../../components/common/Button.component';
import { formatVND } from '../../utils/currency.utils';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const PaymentCallbackScreen: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useAppTranslate('membership');
    const [searchParams] = useSearchParams();

    // Handle both MoMo and PayOS params
    const orderId = searchParams.get('orderId') || searchParams.get('orderCode');
    const packageId = searchParams.get('packageId');
    const resultCode = searchParams.get('resultCode') || searchParams.get('code');
    const amount = searchParams.get('amount');
    const cancel = searchParams.get('cancel');
    const status = searchParams.get('status');

    // Determine success/failure state
    const isCancelled = resultCode === '1006' || cancel === 'true' || status === 'CANCELLED';
    const isSuccess = (resultCode === '0' || resultCode === '00') && !isCancelled;

    if (!orderId) {
        navigate('/membership');
        return null;
    }

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
                                {t('payment_successful')}
                            </h1>
                            <p className="text-lg text-gray-400">
                                {t('membership_activated')}
                            </p>
                        </div>

                        {/* Simple Info Card */}
                        <div className="mb-8 bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">{t('order_id')}</span>
                                    <span className="text-white font-semibold">{orderId}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">{t('status')}</span>
                                    <span className="text-emerald-400 font-semibold">{t('successful')}</span>
                                </div>
                                {amount && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">{t('amount')}</span>
                                        <span className="text-white font-semibold">{formatVND(parseInt(amount), false)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={() => navigate('/membership')}
                                className="flex-1 bg-gray-700 text-white px-4 py-3 text-sm rounded-lg hover:bg-gray-600 transition-colors font-medium"
                            >
                                {t('view_plans')}
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 text-sm rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium shadow-lg shadow-emerald-500/50"
                            >
                                {t('back_to_dashboard')}
                            </Button>
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
                                {t('payment_cancelled')}
                            </h1>
                            <p className="text-lg text-gray-400 mb-6">
                                {t('payment_not_processed')}
                            </p>
                        </div>

                        {/* Simple Info Card */}
                        <div className="mb-8 bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-2xl p-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">{t('order_id')}</span>
                                    <span className="text-white font-semibold">{orderId}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">{t('status')}</span>
                                    <span className="text-red-400 font-semibold">{t('cancelled')}</span>
                                </div>
                                {amount && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">{t('amount')}</span>
                                        <span className="text-white font-semibold">{formatVND(parseInt(amount), false)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">

                            <Button
                                onClick={() => navigate('/membership')}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 text-sm rounded-lg transition-colors font-medium"
                            >
                                {t('back_to_membership')}
                            </Button>
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
                                {t('processing')}
                            </h1>
                            <p className="text-lg text-gray-400 mb-2">
                                {t('wait_process_payment')}
                            </p>
                            <p className="text-sm text-gray-500">
                                {t('order_id')}: <span className="text-gray-300 font-semibold">{orderId}</span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentCallbackScreen;
