import React from 'react';
import Icon from '../common/Icon/Icon.component';

interface StatsCardProps {
    icon: string;
    label: string;
    value: string | number;
    suffix?: string;
    color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
    description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    icon,
    label,
    value,
    suffix,
    color = 'blue',
    description,
}) => {
    const colorScheme = {
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: 'text-blue-600',
            accent: 'bg-blue-100',
        },
        green: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: 'text-green-600',
            accent: 'bg-green-100',
        },
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            icon: 'text-amber-600',
            accent: 'bg-amber-100',
        },
        red: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: 'text-red-600',
            accent: 'bg-red-100',
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            icon: 'text-purple-600',
            accent: 'bg-purple-100',
        },
    };

    const scheme = colorScheme[color];

    return (
        <div className={`${scheme.bg} ${scheme.border} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${scheme.accent}`}>
                    <Icon name={icon as any} size={24} className={scheme.icon} />
                </div>
            </div>

            <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {suffix && <span className="text-sm text-gray-600">{suffix}</span>}
            </div>

            {description && (
                <p className="text-xs text-gray-500 mt-3">{description}</p>
            )}
        </div>
    );
};

export default StatsCard;
