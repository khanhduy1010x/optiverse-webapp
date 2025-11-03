import React, { useState } from 'react';
import Icon from '../common/Icon/Icon.component';
import { formatVND } from '../../utils/currency.utils';

export enum PackageLevel {
    BASIC = 0,
    PLUS = 1,
    BUSINESS = 2,
}

interface CreatePackageFormProps {
    onSubmit?: (data: CreatePackageData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
}

export interface CreatePackageData {
    level: PackageLevel;
    name: string;
    description: string;
    price: number;
    duration_days: number;
    opBonusCredits: number;
}

const CreateMembershipPackageForm: React.FC<CreatePackageFormProps> = ({
    onSubmit,
    onCancel,
    isLoading = false,
}) => {
    const [formData, setFormData] = useState<CreatePackageData>({
        level: PackageLevel.BASIC,
        name: '',
        description: '',
        price: 0,
        duration_days: 30,
        opBonusCredits: 0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const levelOptions = [
        { value: PackageLevel.BASIC, label: 'Basic Package', color: 'amber' },
        { value: PackageLevel.PLUS, label: 'Plus Package', color: 'green' },
        { value: PackageLevel.BUSINESS, label: 'Business Package', color: 'blue' },
    ];

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Package name is required';
        if (formData.price < 0) newErrors.price = 'Price cannot be negative';
        if (formData.duration_days < 1) newErrors.duration_days = 'Duration must be at least 1 day';
        if (formData.opBonusCredits < 0) newErrors.opBonusCredits = 'OP Bonus cannot be negative';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        let newValue: any = value;

        // Format price input - only accept numbers
        if (name === 'price' || name === 'opBonusCredits' || name === 'duration_days') {
            newValue = parseInt(value) || 0;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleLevelSelect = (level: PackageLevel) => {
        setFormData((prev) => ({ ...prev, level }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            onSubmit?.(formData)
                .catch((err) => {
                    console.error('Error submitting form:', err);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }
    }; const getLevelColor = (level: PackageLevel) => {
        const colors: Record<PackageLevel, string> = {
            [PackageLevel.BASIC]: 'border-amber-300 bg-amber-50',
            [PackageLevel.PLUS]: 'border-green-300 bg-green-50',
            [PackageLevel.BUSINESS]: 'border-blue-300 bg-blue-50',
        };
        return colors[level];
    };

    const getLevelBadgeColor = (level: PackageLevel) => {
        const colors: Record<PackageLevel, string> = {
            [PackageLevel.BASIC]: 'bg-amber-100 text-amber-800',
            [PackageLevel.PLUS]: 'bg-green-100 text-green-800',
            [PackageLevel.BUSINESS]: 'bg-blue-100 text-blue-800',
        };
        return colors[level];
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">➕ Create New Membership Package</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Package Level Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Package Level <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {levelOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleLevelSelect(option.value)}
                                className={`p-4 rounded-lg border-2 transition-all ${formData.level === option.value
                                    ? `${getLevelColor(option.value)} border-2`
                                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                <div className="font-semibold text-gray-900">{option.label}</div>
                                <div className={`text-sm mt-2 inline-block px-2 py-1 rounded ${getLevelBadgeColor(option.value)}`}>
                                    Level {option.value}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Package Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Package Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Premium Monthly Plan"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe what's included in this package..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    />
                </div>

                {/* Price and Duration Row */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Price (VND) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="price"
                            value={formData.price > 0 ? formData.price.toLocaleString('vi-VN') : ''}
                            onChange={(e) => {
                                const numValue = parseInt(e.target.value.replace(/[^\d]/g, '')) || 0;
                                setFormData((prev) => ({ ...prev, price: numValue }));
                                if (errors.price) {
                                    setErrors((prev) => ({ ...prev, price: '' }));
                                }
                            }}
                            placeholder="0"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 ${errors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Duration (Days) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="duration_days"
                            value={formData.duration_days}
                            onChange={handleChange}
                            placeholder="30"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 ${errors.duration_days ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.duration_days && (
                            <p className="text-red-500 text-sm mt-1">{errors.duration_days}</p>
                        )}
                    </div>
                </div>

                {/* OP Bonus */}
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        OP Bonus Credits
                    </label>
                    <input
                        type="number"
                        name="opBonusCredits"
                        value={formData.opBonusCredits}
                        onChange={handleChange}
                        placeholder="0"
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 ${errors.opBonusCredits ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors.opBonusCredits && (
                        <p className="text-red-500 text-sm mt-1">{errors.opBonusCredits}</p>
                    )}
                    <p className="text-gray-600 text-xs mt-1">
                        💡 Bonus OP credits users receive when subscribing to this package
                    </p>
                </div>

                {/* Preview - Card Style */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">📋 Preview</h3>
                    <div className={`rounded-lg border-2 p-6 ${getLevelColor(formData.level)}`}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg ${getLevelBadgeColor(formData.level)}`}>
                                    <Icon name={`level_${formData.level}`} size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">
                                        {formData.name || 'Package Name'}
                                    </h4>
                                    <p className={`text-xs font-semibold ${getLevelBadgeColor(formData.level)}`}>
                                        Level {formData.level}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {formData.description && (
                            <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                                {formData.description}
                            </p>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-gray-300">
                            <div className="text-center">
                                <p className="text-xs text-gray-600 mb-1">Price</p>
                                <p className="font-bold text-gray-900">
                                    {formData.price > 0 ? formatVND(formData.price) : '-'}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-600 mb-1">Duration</p>
                                <p className="font-bold text-gray-900">
                                    {formData.duration_days} days
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-600 mb-1">Subscribers</p>
                                <p className="font-bold text-gray-900">0</p>
                            </div>
                        </div>

                        {/* OP Bonus */}
                        {formData.opBonusCredits > 0 && (
                            <div className="bg-amber-100 rounded-lg p-3 mb-4">
                                <p className="text-sm font-semibold text-amber-900">
                                    🌟 OP Bonus: +{formData.opBonusCredits}
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="text-xs text-gray-600 text-center">
                            Created now
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting || isLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting || isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                ✨ Create Package
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateMembershipPackageForm;
