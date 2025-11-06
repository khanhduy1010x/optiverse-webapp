import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import paymentService from '../../services/payment.service';
import { useAppTranslate } from '../../hooks/useAppTranslate';

const MoMoCheckoutScreen: React.FC = () => {
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

        fetchMoMoCheckout();
    }, [packageId, navigate]);
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {

            if (event.data?.status) {
                const q = event.data.query || "";
                navigate(`/membership/callback${q}&type=momo`);
                return;
            }

            if (typeof event.data === "string" && event.data.startsWith("?")) {
                const q = event.data;
                navigate(`/membership/callback${q}&type=momo`);
                return;
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [navigate]);


    const fetchMoMoCheckout = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await paymentService.createMomoPayment(packageId!);
            if (response.payUrl) {
                setCheckoutUrl(response.payUrl);
            } else {
                setError('Failed to get MoMo checkout URL');
            }
        } catch (err) {
            console.error('MoMo Checkout error:', err);
            setError('Failed to load MoMo checkout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-white mb-6"></div>
                    <p className="text-white text-lg font-semibold">{t('loading_momo_checkout')}</p>
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
                    <p className="text-gray-400 text-sm mb-6">{t('unable_load_momo')}</p>
                    <button
                        onClick={() => navigate('/membership')}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        {t('back_to_membership')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[calc(100vh-57px)] ">
            {/* Iframe Container */}
            <div className="w-full h-screen overflow-hidden">
                <iframe
                    src={checkoutUrl}
                    title={t('momo_payment')}
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
                            className="text-pink-500 hover:underline"
                        >
                            {t('back_to_membership')}
                        </a>
                    </div>
                </div>
            </noscript>
        </div>
    );
};

export default MoMoCheckoutScreen;
