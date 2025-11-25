import React, { useState } from 'react';
import Icon from '../common/Icon/Icon.component';
import { useAppTranslate } from '../../hooks/useAppTranslate';

interface MarketplaceFilterBarProps {
    searchInput: string;
    onSearchInputChange: (query: string) => void;
    onSearchSubmit: () => void;
    onSearchKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    priceRange: { min: number; max: number };
    onPriceChange: (range: { min: number; max: number }) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
}

const MarketplaceFilterBar: React.FC<MarketplaceFilterBarProps> = ({
    searchInput,
    onSearchInputChange,
    onSearchSubmit,
    onSearchKeyPress,
    priceRange,
    onPriceChange,
    sortBy,
    onSortChange,
}) => {
    const { t } = useAppTranslate('marketplace');
    const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);

    const toggleDropdown = (dropdown: string) => {
        setExpandedDropdown(expandedDropdown === dropdown ? null : dropdown);
    };

    const priceRanges = [
        { label: t('all'), min: 0, max: 1000 },
        { label: t('free'), min: 0, max: 0 },
        { label: '0 - 100 OP', min: 0, max: 100 },
        { label: '100 - 350 OP', min: 100, max: 350 },
        { label: '350+ OP', min: 350, max: 1000 },
    ];

    const sortOptions = [
        { label: t('newest'), value: 'newest' },
        { label: t('oldest'), value: 'oldest' },
        { label: t('price_high_to_low'), value: 'price-high' },
        { label: t('price_low_to_high'), value: 'price-low' },
    ];

    const getDisplayLabel = (value: string, options: Array<{ label: string; value: string }>) => {
        return options.find(opt => opt.value === value)?.label || value;
    };

    const getDisplayPrice = (range: { min: number; max: number }) => {
        if (range.min === 0 && range.max === 0) return t('free');
        if (range.min === 0 && range.max === 999000) return t('all');
        return `${range.min} - ${range.max} OP`;
    };

    return (
        <div className="bg-white border-b border-gray-200 p-6  z-20">
            {/* Search Bar */}
            <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder={t('search_items')}
                        value={searchInput}
                        onChange={(e) => onSearchInputChange(e.target.value)}
                        onKeyPress={onSearchKeyPress}
                        className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
                    />
                    <button
                        onClick={onSearchSubmit}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition cursor-pointer"
                        title="Search"
                    >
                        <Icon
                            name="search"
                            size={20}
                            className="pointer-events-none"
                        />
                    </button>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-3">
                {/* Price Filter */}
                <div className="relative">
                    <button
                        onClick={() => toggleDropdown('price')}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition bg-white"
                    >
                        <span className="text-sm font-medium text-gray-700">{t('price')}: {getDisplayPrice(priceRange)}</span>
                        <Icon
                            name="chevron"
                            size={16}
                            className={`text-gray-400 transition-transform ${expandedDropdown === 'price' ? 'rotate-180' : ''
                                }`}
                        />
                    </button>
                    {expandedDropdown === 'price' && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-30 min-w-48">
                            {priceRanges.map((range) => (
                                <button
                                    key={`${range.min}-${range.max}`}
                                    onClick={() => {
                                        onPriceChange(range);
                                        setExpandedDropdown(null);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition ${priceRange.min === range.min && priceRange.max === range.max
                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                        : 'text-gray-700'
                                        }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sort Filter */}
                <div className="relative ml-auto">
                    <button
                        onClick={() => toggleDropdown('sort')}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition bg-white"
                    >
                        <span className="text-sm font-medium text-gray-700">{t('sort_by')}: {getDisplayLabel(sortBy, sortOptions)}</span>
                        <Icon
                            name="chevron"
                            size={16}
                            className={`text-gray-400 transition-transform ${expandedDropdown === 'sort' ? 'rotate-180' : ''
                                }`}
                        />
                    </button>
                    {expandedDropdown === 'sort' && (
                        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-30 min-w-48">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onSortChange(option.value);
                                        setExpandedDropdown(null);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition ${sortBy === option.value
                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                        : 'text-gray-700'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketplaceFilterBar;
