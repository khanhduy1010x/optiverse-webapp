import React from 'react';
import Icon from '../common/Icon/Icon.component';
import { MembershipPackage } from '../../services/membership-package.service';
import { formatVND } from '../../utils/currency.utils';

interface MembershipPackageTableProps {
    packages: MembershipPackage[];
    onEdit?: (pkg: MembershipPackage) => void;
    onDelete?: (level: number) => void;
}

const MembershipPackageTable: React.FC<MembershipPackageTableProps> = ({
    packages,
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
                    badge: 'bg-amber-100 text-amber-800',
                    icon: 'text-amber-600',
                };
            case 1:
                return {
                    badge: 'bg-emerald-100 text-emerald-800',
                    icon: 'text-emerald-600',
                };
            case 2:
                return {
                    badge: 'bg-sky-100 text-sky-800',
                    icon: 'text-sky-600',
                };
            default:
                return {
                    badge: 'bg-gray-100 text-gray-800',
                    icon: 'text-gray-600',
                };
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Fixed Header */}
            <div className="flex-shrink-0 overflow-hidden">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Package Name
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                Level
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                Price
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                                Duration
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                                OP Bonus
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                                Subscribers
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                                Status
                            </th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                </table>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto">
                <table className="min-w-full border-collapse">
                    <tbody>
                        {packages.map((pkg, idx) => {
                            const colors = getColorScheme(pkg.level);
                            return (
                                <tr
                                    key={pkg._id}
                                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    {/* Package Name */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${colors.badge}`}>
                                                <Icon
                                                    name={getIconName(pkg.level) as any}
                                                    size={16}
                                                    className={colors.icon}
                                                />
                                            </div>
                                            <span className="font-medium text-gray-900">{pkg.name}</span>
                                        </div>
                                    </td>

                                    {/* Level */}
                                    <td className="px-6 py-4 text-gray-700">Level {pkg.level}</td>

                                    {/* Price */}
                                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                        {formatVND(pkg.price)}
                                    </td>

                                    {/* Duration */}
                                    <td className="px-6 py-4 text-center text-gray-700">
                                        {pkg.duration_days} days
                                    </td>

                                    {/* OP Bonus */}
                                    <td className="px-6 py-4 text-center">
                                        {pkg.opBonusCredits !== undefined && pkg.opBonusCredits !== null ? (
                                            <span className="text-amber-600 font-semibold flex items-center justify-center gap-1">
                                                +{pkg.opBonusCredits}
                                                <Icon name="star" size={14} className="text-amber-500" />
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>

                                    {/* Subscribers */}
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                                            {pkg.subscriber_count || 0}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${pkg.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {pkg.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(pkg)}
                                                    className="p-2 rounded-lg text-gray-600 hover:bg-amber-100 hover:text-amber-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Icon name="edit" size={16} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(pkg.level)}
                                                    className="p-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Icon name="delete" size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MembershipPackageTable;
