import React from 'react';

interface StatsCardProps {
    icon: 'dollar' | 'users' | 'trending-up' | 'clock';
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

    const getIcon = () => {
        switch (icon) {
            case 'dollar':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'users':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                );
            case 'trending-up':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                );
            case 'clock':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div className={`${scheme.bg} ${scheme.border} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${scheme.accent} ${scheme.icon}`}>
                    {getIcon()}
                </div>
            </div>

            <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900 break-all">{value}</p>
                {suffix && <span className="text-sm text-gray-600">{suffix}</span>}
            </div>

            {description && (
                <p className="text-xs text-gray-500 mt-3">{description}</p>
            )}
        </div>
    );
};

export default StatsCard;
