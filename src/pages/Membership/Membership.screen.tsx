import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon/Icon.component';
import Button from '../../components/common/Button.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';
import membershipPackageService, { MembershipPackage } from '../../services/membership-package.service';
import { formatVND } from '../../utils/currency.utils';

const MembershipScreen: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useAppTranslate('membership');
    const [packages, setPackages] = useState<MembershipPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMembershipPackages();
    }, []);

    const fetchMembershipPackages = async () => {
        try {
            setLoading(true);
            const data = await membershipPackageService.getAllMembershipPackages();
            // Filter only active packages
            const activePackages = data.filter(pkg => pkg.is_active);
            // Sort by level
            activePackages.sort((a, b) => a.level - b.level);
            setPackages(activePackages);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch packages:', err);
            setError('Failed to load membership packages. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

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
                return 'border-amber-500/30 bg-gray-800/50 hover:border-amber-500/60';
            case 1:
                return 'border-emerald-500/30 bg-gray-800/50 hover:border-emerald-500/60 ring-1 ring-emerald-500/20';
            case 2:
                return 'border-sky-500/30 bg-gray-800/50 hover:border-sky-500/60';
            default:
                return 'border-gray-500/30 bg-gray-800/50';
        }
    };

    const getLevelGlowColor = (level: number) => {
        switch (level) {
            case 0:
                return 'from-amber-500/20 to-orange-500/20';
            case 1:
                return 'from-emerald-500/20 to-green-500/20';
            case 2:
                return 'from-sky-500/20 to-blue-500/20';
            default:
                return 'from-gray-500/20 to-gray-600/20';
        }
    };

    const getLevelIconColor = (level: number) => {
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

    const getLevelTextColor = (level: number) => {
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

    const getLevelBadgeColor = (level: number) => {
        switch (level) {
            case 0:
                return 'bg-amber-500/20 border border-amber-400/50 text-amber-300';
            case 1:
                return 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300';
            case 2:
                return 'bg-sky-500/20 border border-sky-400/50 text-sky-300';
            default:
                return 'bg-gray-500/20 border border-gray-400/50 text-gray-300';
        }
    };

    const formatDuration = (days: number): string => {
        if (days <= 30) {
            return `${days} days`;
        }

        const months = Math.floor(days / 30);
        const remainingDays = days % 30;

        // Convert months to years if 12 or more
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (years > 0) {
            if (remainingMonths === 0 && remainingDays === 0) {
                return `${years} year${years > 1 ? 's' : ''}`;
            }
            if (remainingDays === 0) {
                return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
            }
            return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
        }

        if (remainingMonths === 0) {
            return `${months} month${months > 1 ? 's' : ''}`;
        }
        return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 pb-12 px-4 md:px-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <p className="text-gray-400">{t('loading_packages')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 pb-12 px-4 md:px-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button onClick={fetchMembershipPackages} className="bg-white text-black px-4 py-2 rounded">
                        {t('try_again')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-20 pb-12 px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                {/* No Packages Message */}
                {packages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">{t('no_packages')}</p>
                    </div>
                ) : (
                    <>
                        {/* Membership Cards Grouped by Level */}
                        {[0, 1, 2].map((level) => {
                            const levelPackages = packages.filter(pkg => pkg.level === level);
                            if (levelPackages.length === 0) return null;

                            return (
                                <div key={level} className="mb-16">
                                    {/* Level Header */}
                                    <div className="mb-8 pb-6 border-b border-gray-700/50">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Icon name={getLevelIcon(level)} size={28} className={getLevelIconColor(level)} />
                                            <h2 className={`text-3xl font-bold ${getLevelTextColor(level)}`}>
                                                {level === 0 ? t('basic_plans') : level === 1 ? t('plus_plans') : t('business_plans')}
                                            </h2>
                                        </div>
                                        <p className="text-gray-400 ml-11">
                                            {level === 0 ? t('basic_description') : level === 1 ? t('plus_description') : t('business_description')}
                                        </p>
                                    </div>

                                    {/* Level Packages Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                                        {levelPackages.map((pkg) => {
                                            const isDisabled = !!pkg.disabled;
                                            return (
                                                <div key={pkg._id} className="group relative h-full">
                                                    <div className={`absolute inset-0 bg-gradient-to-r ${getLevelGlowColor(pkg.level)} rounded-2xl blur-xl transition-all ${isDisabled ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`} />
                                                    <div className={`relative backdrop-blur border rounded-2xl p-8 transition-all ${getLevelColor(pkg.level)} h-full flex flex-col ${isDisabled ? 'opacity-60 border-gray-600/50' : ''}`}>
                                                        {/* Header */}
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <Icon name={getLevelIcon(pkg.level)} size={32} className={getLevelIconColor(pkg.level)} />
                                                            <div>
                                                                <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                                                                <p className={`text-sm font-medium ${getLevelTextColor(pkg.level)}`}>
                                                                    {t('level')} {pkg.level}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="mb-6">
                                                            <div className="flex items-baseline gap-1 mb-2">
                                                                <span className="text-4xl font-bold text-white">
                                                                    {pkg.price === 0 ? t('free') : formatVND(pkg.price, false)}
                                                                </span>
                                                                {pkg.price > 0 && (
                                                                    <span className="text-gray-400 text-sm">/{pkg.duration_days} {t('price_suffix')}</span>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-400 text-sm">
                                                                {pkg.description || t('package_description')}
                                                            </p>
                                                        </div>

                                                        {/* Features */}
                                                        <div className="space-y-4 mb-8">
                                                            <div className="flex items-center gap-3">
                                                                <Icon name="check" size={18} className={getLevelTextColor(pkg.level)} />
                                                                <span className="text-gray-300">{formatVND(pkg.opBonusCredits || 0, false)} {t('op_bonus')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Icon name="check" size={18} className={getLevelTextColor(pkg.level)} />
                                                                <span className="text-gray-300">{formatDuration(pkg.duration_days)} {t('access')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Icon name="check" size={18} className={getLevelTextColor(pkg.level)} />
                                                                <span className="text-gray-300">{t('premium_features')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Icon name="check" size={18} className={getLevelTextColor(pkg.level)} />
                                                                <span className="text-gray-300">{t('priority_support')}</span>
                                                            </div>
                                                        </div>

                                                        {/* Subscriber Count */}
                                                        {pkg.subscriber_count !== undefined && (
                                                            <div className="mb-6 p-3 bg-gray-700/30 rounded-lg text-center">
                                                                <p className="text-gray-400 text-xs">{t('active_subscribers')}</p>
                                                                <p className="text-white font-semibold text-lg">{pkg.subscriber_count.toLocaleString()}</p>
                                                            </div>
                                                        )}

                                                        {/* Action Button */}
                                                        <Button
                                                            disabled={isDisabled}
                                                            onClick={() => {
                                                                if (isDisabled) return;
                                                                navigate(`/membership/payment?packageId=${pkg._id}`);
                                                            }}
                                                            className={`w-full py-2 px-4 rounded-lg transition-all font-medium mt-auto ${isDisabled
                                                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                                                : (pkg.price === 0
                                                                    ? `${getLevelBadgeColor(pkg.level)} hover:opacity-80`
                                                                    : 'bg-white text-black hover:bg-gray-200')
                                                                }`}
                                                        >
                                                            {pkg.price === 0 ? t('start_free') : t('upgrade_now')}
                                                        </Button>
                                                    </div>
                                                    {/* Optional lock indicator when disabled */}
                                                    {isDisabled && (
                                                        <div className="absolute top-3 right-3 px-2 py-1 text-xs rounded bg-gray-700/70 text-gray-200 border border-gray-600 flex items-center gap-1">
                                                            <Icon name="lock" size={14} className="text-gray-300" />
                                                            <span>{t('unavailable', { ns: 'membership', defaultValue: 'Unavailable' })}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Features Comparison */}
                        {packages.length > 1 && (
                            <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-2xl p-8 mb-12">
                                <h2 className="text-2xl font-bold text-white mb-8 text-center">{t('compare_features')}</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-700">
                                                <th className="text-left py-4 px-4 text-gray-400 font-semibold">{t('feature')}</th>
                                                {packages.map(pkg => (
                                                    <th key={pkg._id} className={`text-center py-4 px-4 font-semibold ${getLevelTextColor(pkg.level)}`}>
                                                        {pkg.name}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                                                <td className="py-4 px-4 text-gray-300">{t('price')}</td>
                                                {packages.map(pkg => (
                                                    <td key={pkg._id} className="text-center py-4 px-4 text-white font-semibold">
                                                        {pkg.price === 0 ? t('free') : formatVND(pkg.price, false)}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                                                <td className="py-4 px-4 text-gray-300">{t('duration')}</td>
                                                {packages.map(pkg => (
                                                    <td key={pkg._id} className="text-center py-4 px-4">
                                                        <Icon name="check" size={20} className={`${getLevelTextColor(pkg.level)} mx-auto`} />
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                                                <td className="py-4 px-4 text-gray-300">{t('op_bonus')}</td>
                                                {packages.map(pkg => (
                                                    <td key={pkg._id} className="text-center py-4 px-4">
                                                        <span className="text-white font-semibold">
                                                            {pkg.opBonusCredits ? formatVND(pkg.opBonusCredits, false) : '-'}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* FAQ Section */}
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-2xl font-bold text-white mb-8 text-center">{t('faq_title')}</h2>
                            <div className="space-y-4">
                                <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-lg p-6 hover:border-gray-600/50 transition-colors">
                                    <h3 className="text-lg font-semibold text-white mb-2">{t('faq_1')}</h3>
                                    <p className="text-gray-400">{t('faq_1_answer')}</p>
                                </div>
                                <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-lg p-6 hover:border-gray-600/50 transition-colors">
                                    <h3 className="text-lg font-semibold text-white mb-2">{t('faq_2')}</h3>
                                    <p className="text-gray-400">{t('faq_2_answer')}</p>
                                </div>
                                <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-lg p-6 hover:border-gray-600/50 transition-colors">
                                    <h3 className="text-lg font-semibold text-white mb-2">{t('faq_3')}</h3>
                                    <p className="text-gray-400">{t('faq_3_answer')}</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MembershipScreen;
