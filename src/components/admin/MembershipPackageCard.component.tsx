import React from 'react';
import Icon from '../common/Icon/Icon.component';
import { MembershipPackage } from '../../services/membership-package.service';
import { formatVND } from '../../utils/currency.utils';

interface MembershipPackageCardProps {
    package: MembershipPackage;
    onEdit?: (pkg: MembershipPackage) => void;
    onDelete?: (level: number) => void;
}

const MembershipPackageCard: React.FC<MembershipPackageCardProps> = ({
    package: pkg,
    onEdit,
    onDelete,
}) => {
    // Map level to icon name
    const getIconName = (level: number): string => {
        switch (level) {
            case 0:
                return 'level_0';
            case 1:
                return 'level_1';
            case 2:
                return 'level_2';
            default:
                return 'star';
        }
    };

    // Map level to color scheme
    const getColorScheme = (level: number) => {
        switch (level) {
            case 0:
                return {
                    bg: 'bg-amber-50',
                    border: 'border-amber-200',
                    badge: 'bg-amber-100 text-amber-800',
                    icon: 'text-amber-600',
                    button: 'hover:bg-amber-100',
                };
            case 1:
                return {
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-200',
                    badge: 'bg-emerald-100 text-emerald-800',
                    icon: 'text-emerald-600',
                    button: 'hover:bg-emerald-100',
                };
            case 2:
                return {
                    bg: 'bg-sky-50',
                    border: 'border-sky-200',
                    badge: 'bg-sky-100 text-sky-800',
                    icon: 'text-sky-600',
                    button: 'hover:bg-sky-100',
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    border: 'border-gray-200',
                    badge: 'bg-gray-100 text-gray-800',
                    icon: 'text-gray-600',
                    button: 'hover:bg-gray-100',
                };
        }
    };

    const colors = getColorScheme(pkg.level);

    return (
        <div
            className={`${colors.bg} ${colors.border} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
        >
            {/* Header with Icon and Status */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg ${colors.badge}`}>
                        <Icon
                            name={getIconName(pkg.level) as any}
                            size={24}
                            className={colors.icon}
                        />
                    </div>

                    {/* Name and Status */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                        <p className={`text-sm ${colors.badge} px-2 py-0.5 rounded inline-block mt-1`}>
                            {pkg.is_active ? 'Active' : 'Inactive'}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(pkg)}
                            className={`p-2 rounded-lg text-gray-600 hover:text-gray-900 ${colors.button} transition-colors`}
                            title="Edit"
                        >
                            <Icon name="edit" size={18} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(pkg.level)}
                            className={`p-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors`}
                            title="Delete"
                        >
                            <Icon name="delete" size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Description */}
            {pkg.description && (
                <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
            )}

            {/* Package Details Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Price */}
                <div className="bg-white rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Price</p>
                    <p className="text-xl font-bold text-gray-900">
                        {formatVND(pkg.price)}
                    </p>
                </div>

                {/* Duration */}
                <div className="bg-white rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Duration</p>
                    <p className="text-xl font-bold text-gray-900">{pkg.duration_days} days</p>
                </div>

                {/* Subscribers */}
                <div className="bg-white rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Subscribers</p>
                    <p className="text-xl font-bold text-gray-900">{pkg.subscriber_count || 0}</p>
                </div>
            </div>

            {/* OP Bonus Credits */}
            {pkg.opBonusCredits !== undefined && pkg.opBonusCredits !== null && (
                <div className="bg-white rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Bonus OP Credits</p>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-amber-600">
                                +{pkg.opBonusCredits}
                            </span>
                            <Icon name="star" size={16} className="text-amber-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Info */}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <span>Level {pkg.level}</span>
                {pkg.createdAt && (
                    <span>
                        Created {new Date(pkg.createdAt).toLocaleDateString()}
                    </span>
                )}
            </div>
        </div>
    );
};

export default MembershipPackageCard;
