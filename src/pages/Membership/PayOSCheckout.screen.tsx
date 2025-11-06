import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import paymentService from '../../services/payment.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const PayOSCheckoutScreen: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useAppTranslate('membership');
    const packageId = searchParams.get('packageId');

    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!packageId) {
            navigate('/membership');
            return;
        }

        fetchPayOSCheckout();
    }, [packageId, navigate]);
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!event.data?.status) return;

            const q = event.data.query || "";

            if (event.data.status === "success") {
                navigate(`/membership/callback${q}&type=payos`);
            }

            if (event.data.status === "cancel") {
                navigate(`/membership/callback${q}&type=payos`);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [navigate]);

    const fetchPayOSCheckout = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await paymentService.createPayOSPayment(packageId!);
            if (response.checkoutUrl) {
                setCheckoutUrl(response.checkoutUrl);
            } else {
                setError('Failed to get PayOS checkout URL');
            }
        } catch (err) {
            console.error('PayOS Checkout error:', err);
            setError('Failed to load PayOS checkout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex animate-spin rounded-full h-16 w-16 border-4 border-sky-500 border-t-white mb-6"></div>
                    <p className="text-white text-lg font-semibold">{t('loading_payos_checkout')}</p>
                    <p className="text-gray-400 text-sm mt-2">{t('preparing_payment_page')}</p>
                </div>
            </div>
        );
    }

    if (error || !checkoutUrl) {
        return (
            <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-5xl mb-4">⚠️</div>
                    <p className="text-red-400 text-lg font-semibold mb-2">{error || t('payment_page_not_found')}</p>
                    <p className="text-gray-400 text-sm mb-6">{t('unable_load_payos')}</p>
                    <button
                        onClick={() => navigate('/membership')}
                        className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        {t('back_to_membership')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-white overflow-hidden">
            {/* Header */}
            <div className="h-16 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 flex items-center justify-between px-6 shadow-lg">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/membership')}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title={t('back_to_membership')}
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-bold text-white">{t('payos_payment')}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-300 text-sm">{t('secure_connection')}</span>
                </div>
            </div>

            {/* Iframe Container */}
            <div className="w-full h-[calc(100vh-64px)]">
                <iframe
                    src={checkoutUrl}
                    title={t('payos_payment')}
                    className="w-full h-full border-none"
                    allow="payment"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
                />
            </div>

            {/* Fallback Message */}
            <noscript>
                <div className="absolute inset-0 bg-white flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-700 mb-4">{t('js_required')}</p>
                        <a
                            href="/membership"
                            className="text-sky-500 hover:underline"
                        >
                            {t('back_to_membership')}
                        </a>
                    </div>
                </div>
            </noscript>
        </div>
    );
};

export default PayOSCheckoutScreen;
